import type { NextRequest } from 'next/server';
import {
  bumpRetry,
  getPendingSubmissions,
  markDelivered,
  markFailed,
} from '@/lib/kv';
import {
  buildTelegramPayload,
  sendMessage,
} from '@/lib/telegram';

/**
 * GET /api/cron/retry-submissions
 *
 * Vercel Cron endpoint — invoked every 5 minutes by `vercel.json`.
 *
 * Security: rejects anything without `Authorization: Bearer ${CRON_SECRET}`.
 *
 * Behavior:
 *   - Fetch up to 50 submissions stuck in status:'pending'.
 *   - Retry Telegram. Backoff is a hint to the scheduler via sleep — not a
 *     true multi-minute delay, since Vercel caps invocation duration. We
 *     apply a small in-handler wait scaled by retry_count, capped at 2s.
 *   - Success → markDelivered.
 *   - Failure → increment retry_count, stash last_error.
 *   - If retry_count > 10 → markFailed (cron stops picking it up).
 *
 * Returns `{ processed, delivered, failed }` for Loom visibility.
 */

const MAX_RETRIES = 10;
const MAX_BACKOFF_MS = 2_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const withTimeout = <T>(p: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout ${ms}ms`)), ms),
    ),
  ]);

export async function GET(req: NextRequest): Promise<Response> {
  // --- Auth guard ---
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get('authorization') ?? '';
  if (!secret || header !== `Bearer ${secret}`) {
    console.log('[cron/retry] rejected — missing/bad Authorization');
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const pending = await getPendingSubmissions(50);
  console.log(`[cron/retry] scanning ${pending.length} pending submissions`);

  let delivered = 0;
  let failed = 0;

  for (const record of pending) {
    const attemptNumber = record.retry_count + 1;
    // Exponential backoff capped at MAX_BACKOFF_MS.
    const backoff = Math.min(
      2 ** record.retry_count * 100,
      MAX_BACKOFF_MS,
    );
    if (backoff > 0) await sleep(backoff);

    let result: Awaited<ReturnType<typeof sendMessage>>;
    try {
      result = await withTimeout(
        sendMessage(buildTelegramPayload(record)),
        4000,
      );
    } catch (err) {
      result = { ok: false, error: (err as Error).message };
    }

    if (result.ok) {
      await markDelivered(record.id);
      delivered += 1;
      console.log(
        `[cron/retry] delivered uuid=${record.id} attempt=${attemptNumber}`,
      );
      continue;
    }

    const nextCount = record.retry_count + 1;
    const lastError = result.error ?? 'unknown';

    if (nextCount > MAX_RETRIES) {
      await markFailed(record.id, lastError);
      failed += 1;
      console.log(
        `[cron/retry] giving up uuid=${record.id} after ${nextCount} attempts: ${lastError}`,
      );
    } else {
      await bumpRetry(record.id, nextCount, lastError);
      console.log(
        `[cron/retry] still failing uuid=${record.id} count=${nextCount} err="${lastError}"`,
      );
    }
  }

  return Response.json({
    processed: pending.length,
    delivered,
    failed,
  });
}
