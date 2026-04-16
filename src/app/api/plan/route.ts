import type { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  generatePlanWithClaude,
  isClaudeEnabled,
} from '@/lib/claude';
import { generateDeterministicPlan } from '@/lib/plan-generator';
import type { FunnelState, GeneratedPlan, PlanSource } from '@/lib/types';

/**
 * POST /api/plan
 *
 * Claude-first, deterministic-fallback plan generation.
 *
 * Contract:
 *   Input:  partial FunnelState (Q1–Q8; email not required yet).
 *   Output: { plan, source: 'claude' | 'fallback' }, always 200.
 *
 * Failure modes (all swallowed into fallback):
 *   - zod validation error → fallback plan with empty answers
 *   - Claude thrown error  → fallback
 *   - Claude timeout >3s   → fallback
 *   - Any other crash      → fallback
 *
 * The funnel reveal is mission-critical copy real estate. We never return 5xx.
 */

// ---------- Input validation ----------

const SegmentSchema = z.enum([
  'career',
  'test_prep',
  'immigration',
  'travel_social',
]);
const LevelSchema = z.enum([
  'getting_by',
  'conversational',
  'fluent_with_gaps',
  'near_native',
]);
const TimeSchema = z.union([z.literal(10), z.literal(20), z.literal(45)]);
const StyleSchema = z.enum([
  'drills',
  'conversations',
  'stories',
  'structured',
]);
const PriorAppSchema = z.enum([
  'duolingo',
  'babbel',
  'busuu',
  'italki_preply',
  'none',
]);
const WhoSchema = z.enum([
  'colleague',
  'stranger_abroad',
  'partner_family',
  'interviewer',
]);
const AgeBracketSchema = z.enum([
  'under_18',
  '18_24',
  '25_34',
  '35_44',
  '45_54',
  '55_plus',
]);
const CoachSchema = z.enum(['marcus', 'helen', 'aiko', 'david']);

const PlanRequestSchema = z
  .object({
    q1_who_talking_to: WhoSchema.optional(),
    q2_level: LevelSchema.optional(),
    q3_segment: SegmentSchema.optional(),
    q4_prior_apps: z.array(PriorAppSchema).optional(),
    q4_age: AgeBracketSchema.optional(),
    q5_moment: z.string().max(300).optional(),
    q5_moment_id: z.string().max(64).optional(),
    q6_time: TimeSchema.optional(),
    q7_seed_phrase: z.string().max(500).optional(),
    q7_user_phrase: z.string().max(500).optional(),
    q8_style: StyleSchema.optional(),
    q8_coach: CoachSchema.optional(),
  })
  .passthrough();

// ---------- Rate limit (dev, in-memory) ----------
// TODO: move to Upstash ratelimit for prod.

const PLAN_WINDOW_MS = 60_000;
const PLAN_MAX_REQ = 10;
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
    rateLimitMap.set(ip, { count: 1, resetAt: now + PLAN_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > PLAN_MAX_REQ;
};

// ---------- Helpers ----------

const withTimeout = <T>(p: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout ${ms}ms`)), ms),
    ),
  ]);

const toJson = (plan: GeneratedPlan, source: PlanSource): Response =>
  Response.json({ plan, source }, { status: 200 });

// ---------- Handler ----------

export async function POST(req: NextRequest): Promise<Response> {
  const start = Date.now();
  const ip = ipOf(req);
  console.log(`[api/plan] request from ${ip}`);

  if (rateLimited(ip)) {
    console.log(`[api/plan] rate-limited ip=${ip}`);
    // Rate-limit fallback: still return a plan (with an empty-answer shape)
    // so no client ever sees a hard error on the reveal screen.
    const plan = generateDeterministicPlan({} as unknown as FunnelState);
    return toJson(plan, 'fallback');
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    console.log('[api/plan] body not JSON — using empty answers');
  }

  const parsed = PlanRequestSchema.safeParse(body);
  // Cast through unknown — FunnelState has session_id/started_at/plan_source
  // that the plan generator doesn't consume.
  const answers = (
    parsed.success ? parsed.data : {}
  ) as unknown as FunnelState;
  if (!parsed.success) {
    console.log(
      '[api/plan] zod validation failed:',
      parsed.error.issues.slice(0, 3),
    );
  }

  // Try Claude if configured. 3s timeout; any failure falls through silently.
  if (isClaudeEnabled()) {
    try {
      console.log('[api/plan] calling Claude (3s timeout)');
      const plan = await withTimeout(generatePlanWithClaude(answers), 3000);
      console.log(
        `[api/plan] claude ok in ${Date.now() - start}ms name="${plan.plan_name}"`,
      );
      return toJson(plan, 'claude');
    } catch (err) {
      console.log(
        `[api/plan] claude failed (${(err as Error).message}) — falling back`,
      );
    }
  } else {
    console.log('[api/plan] claude disabled — using fallback');
  }

  const plan = generateDeterministicPlan(answers);
  console.log(
    `[api/plan] fallback ok in ${Date.now() - start}ms segment=${answers.q3_segment ?? 'career'} time=${answers.q6_time ?? 20} name="${plan.plan_name}"`,
  );
  return toJson(plan, 'fallback');
}
