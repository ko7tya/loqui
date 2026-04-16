import type { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { generateDeterministicPlan } from '@/lib/plan-generator';
import {
  incrementWaitlist,
  markDelivered,
  saveSubmission,
} from '@/lib/kv';
import {
  buildTelegramPayload,
  sendMessage,
} from '@/lib/telegram';
import type { FunnelState } from '@/lib/types';
import type { SubmissionRecord } from '@/lib/types-backend';

/**
 * POST /api/submit
 *
 * Outbox flow (always returns 200 for anything that isn't an obvious attack):
 *   1. Validate input with zod.
 *   2. Generate the deterministic plan (Q9 already called Claude; we don't
 *      double-spend).
 *   3. Claim waitlist position atomically.
 *   4. Save SubmissionRecord with status:'pending' — BEFORE touching Telegram.
 *   5. Try Telegram with 4s timeout; retry once on 429/529.
 *   6. Success → markDelivered. Failure → leave pending, cron retries.
 *   7. Always return success to the user.
 *
 * Honeypot: `_hp` is a hidden form field. Bots fill it; humans don't.
 * If populated we return a fake 200 so the bot never learns it was caught.
 */

// ---------- Input schema ----------

const FunnelStateSchema = z
  .object({
    q1_who_talking_to: z
      .enum(['colleague', 'stranger_abroad', 'partner_family', 'interviewer'])
      .optional(),
    q2_level: z
      .enum(['getting_by', 'conversational', 'fluent_with_gaps', 'near_native'])
      .optional(),
    q3_segment: z
      .enum(['career', 'test_prep', 'immigration', 'travel_social'])
      .optional(),
    q4_prior_apps: z
      .array(
        z.enum(['duolingo', 'babbel', 'busuu', 'italki_preply', 'none']),
      )
      .optional(),
    q4_age: z
      .enum([
        'under_18',
        '18_24',
        '25_34',
        '35_44',
        '45_54',
        '55_plus',
      ])
      .optional(),
    q5_moment: z.string().max(300).optional(),
    q5_moment_id: z.string().max(64).optional(),
    q6_time: z.union([z.literal(10), z.literal(20), z.literal(45)]).optional(),
    q7_challenge: z
      .object({
        challenge_id: z.string().max(64),
        selected_option_id: z.string().max(64),
        was_correct: z.boolean(),
      })
      .optional(),
    q8_style: z
      .enum(['drills', 'conversations', 'stories', 'structured'])
      .optional(),
    q8_coach: z.enum(['marcus', 'helen', 'aiko', 'david']).optional(),
  })
  .passthrough();

const SubmitSchema = z.object({
  email: z.string().email().max(254),
  answers: FunnelStateSchema,
  _hp: z.string().max(200).optional(),
});

// ---------- Rate limit (dev, in-memory) ----------
// TODO: move to Upstash ratelimit for prod.

const SUBMIT_WINDOW_MS = 60_000;
const SUBMIT_MAX_REQ = 5;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const ipOf = (req: NextRequest): string => {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') ?? 'anon';
};

const rateLimited = (ip: string): boolean => {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + SUBMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > SUBMIT_MAX_REQ;
};

// ---------- Helpers ----------

const withTimeout = <T>(p: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout ${ms}ms`)), ms),
    ),
  ]);

const sleep = (ms: number) =>
  new Promise((r) => setTimeout(r, ms));

/** Attempt Telegram once, with a 4s timeout. Returns the send result. */
const attemptTelegram = async (
  record: SubmissionRecord,
): Promise<Awaited<ReturnType<typeof sendMessage>>> => {
  try {
    return await withTimeout(
      sendMessage(buildTelegramPayload(record)),
      4000,
    );
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
};

// ---------- Handler ----------

export async function POST(req: NextRequest): Promise<Response> {
  const start = Date.now();
  const ip = ipOf(req);
  console.log(`[api/submit] step 0 — request from ${ip}`);

  // 1. Parse + validate.
  let raw: unknown = {};
  try {
    raw = await req.json();
  } catch {
    // keep raw as {} — zod will reject on missing email
  }

  const parsed = SubmitSchema.safeParse(raw);
  if (!parsed.success) {
    console.log(
      '[api/submit] step 1 — zod failed:',
      parsed.error.issues.slice(0, 3),
    );
    return Response.json(
      { ok: false, error: 'invalid_payload' },
      { status: 400 },
    );
  }

  // Honeypot — filled means bot. Return fake-success.
  if (parsed.data._hp && parsed.data._hp.length > 0) {
    console.log('[api/submit] step 1 — honeypot triggered; returning fake ok');
    return Response.json({
      ok: true,
      waitlist_position: 0,
      plan_name: 'The Loqui Plan',
    });
  }

  // Rate limit AFTER honeypot so bots don't burn real limits.
  if (rateLimited(ip)) {
    console.log(`[api/submit] step 1 — rate-limited ip=${ip}`);
    return Response.json(
      { ok: false, error: 'rate_limited' },
      { status: 429 },
    );
  }

  const { email, answers } = parsed.data;
  // Cast through unknown — FunnelState has session_id/started_at/plan_source
  // that this server-side path doesn't need (they're client-session fields).
  const answersTyped = answers as unknown as FunnelState;

  // 2. UUID + plan.
  const uuid = randomUUID();
  const plan = generateDeterministicPlan(answersTyped);
  console.log(
    `[api/submit] step 2 — plan generated name="${plan.plan_name}" uuid=${uuid}`,
  );

  // 3. Claim waitlist position.
  const waitlist_position = await incrementWaitlist();
  console.log(
    `[api/submit] step 3 — waitlist position #${waitlist_position}`,
  );

  // 4. Persist before notifying — outbox guarantee.
  const record: SubmissionRecord = {
    id: uuid,
    email,
    answers: answersTyped,
    plan,
    waitlist_position,
    status: 'pending',
    created_at: new Date().toISOString(),
    retry_count: 0,
  };
  await saveSubmission(uuid, record);
  console.log(`[api/submit] step 4 — submission persisted uuid=${uuid}`);

  // 5. Telegram with retry-once on transient errors.
  let result = await attemptTelegram(record);
  if (
    !result.ok &&
    (result.status === 429 || result.status === 529)
  ) {
    console.log(
      `[api/submit] step 5 — telegram ${result.status}; retrying in 500ms`,
    );
    await sleep(500);
    result = await attemptTelegram(record);
  }

  // 6/7. Mark + respond.
  if (result.ok) {
    await markDelivered(uuid);
    console.log(
      `[api/submit] step 6 — delivered uuid=${uuid} in ${Date.now() - start}ms`,
    );
  } else {
    console.log(
      `[api/submit] step 6 — telegram failed (${result.error}) — staying pending for cron retry`,
    );
  }

  return Response.json({
    ok: true,
    waitlist_position,
    plan_name: plan.plan_name,
  });
}
