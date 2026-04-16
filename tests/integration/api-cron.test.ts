import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import type { SubmissionRecord } from '@/lib/types-backend';

/**
 * GET /api/cron/retry-submissions integration.
 *
 * - Auth header guard
 * - Retries pending submissions
 * - Bumps retry_count on failure, marks failed past MAX_RETRIES
 */

// --- In-memory KV backing for the cron run ------------------------------

const kvStore: Map<string, SubmissionRecord> = new Map();
let bumpCalls: Array<{ uuid: string; count: number; error: string }> = [];
let failedCalls: Array<{ uuid: string; error: string }> = [];
let deliveredCalls: string[] = [];

const asRecord = (
  overrides: Partial<SubmissionRecord> = {},
): SubmissionRecord => ({
  id: 'uuid-1',
  email: 'user@example.com',
  answers: {
    session_id: 'x',
    started_at: 'y',
    plan_source: 'fallback',
  },
  plan: {
    plan_name: 'The Plan',
    tagline: 'x',
    the_moment: 'x',
    focus_axes: [],
    weeks: [],
    outcome: 'x',
  },
  waitlist_position: 2500,
  status: 'pending',
  created_at: '2025-01-01T00:00:00Z',
  retry_count: 0,
  ...overrides,
});

vi.mock('@/lib/kv', () => ({
  getPendingSubmissions: vi.fn(async (limit: number) =>
    Array.from(kvStore.values())
      .filter((r) => r.status === 'pending')
      .slice(0, limit),
  ),
  markDelivered: vi.fn(async (uuid: string) => {
    deliveredCalls.push(uuid);
    const existing = kvStore.get(uuid);
    if (existing) {
      kvStore.set(uuid, {
        ...existing,
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      });
    }
  }),
  markFailed: vi.fn(async (uuid: string, last_error: string) => {
    failedCalls.push({ uuid, error: last_error });
    const existing = kvStore.get(uuid);
    if (existing) {
      kvStore.set(uuid, {
        ...existing,
        status: 'failed',
        last_error,
      });
    }
  }),
  bumpRetry: vi.fn(async (uuid: string, count: number, last_error: string) => {
    bumpCalls.push({ uuid, count, error: last_error });
    const existing = kvStore.get(uuid);
    if (existing) {
      kvStore.set(uuid, {
        ...existing,
        retry_count: count,
        last_error,
      });
    }
  }),
  isKVConfigured: vi.fn(() => false),
  saveSubmission: vi.fn(async () => {}),
  getSubmission: vi.fn(async () => null),
  incrementWaitlist: vi.fn(async () => 2500),
}));

import { GET } from '@/app/api/cron/retry-submissions/route';

const makeReq = (
  { auth }: { auth?: string } = {},
): NextRequest => {
  const headers: Record<string, string> = {};
  if (auth !== undefined) headers['authorization'] = auth;
  const req = new Request('http://localhost/api/cron/retry-submissions', {
    method: 'GET',
    headers,
  });
  return req as unknown as NextRequest;
};

beforeEach(() => {
  kvStore.clear();
  bumpCalls = [];
  failedCalls = [];
  deliveredCalls = [];
  vi.spyOn(console, 'log').mockImplementation(() => {});
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_CHAT_ID;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GET /api/cron/retry-submissions — auth', () => {
  it('no Authorization header → 401', async () => {
    process.env.CRON_SECRET = 'supersecret';
    const res = await GET(makeReq());
    expect(res.status).toBe(401);
  });

  it('wrong bearer → 401', async () => {
    process.env.CRON_SECRET = 'supersecret';
    const res = await GET(makeReq({ auth: 'Bearer wrong' }));
    expect(res.status).toBe(401);
  });

  it('correct CRON_SECRET → 200 with processed/delivered/failed', async () => {
    process.env.CRON_SECRET = 'secret-ok';
    const res = await GET(makeReq({ auth: 'Bearer secret-ok' }));
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      processed: number;
      delivered: number;
      failed: number;
    };
    expect(data).toEqual({ processed: 0, delivered: 0, failed: 0 });
  });
});

describe('GET /api/cron/retry-submissions — retry logic', () => {
  it('increments retry_count on failure', async () => {
    process.env.CRON_SECRET = 'k';
    // No Telegram env → sendMessage returns {ok:false, error:'Telegram not configured'}
    kvStore.set('u1', asRecord({ id: 'u1', retry_count: 0 }));
    const res = await GET(makeReq({ auth: 'Bearer k' }));
    expect(res.status).toBe(200);
    expect(bumpCalls).toHaveLength(1);
    expect(bumpCalls[0]!.uuid).toBe('u1');
    expect(bumpCalls[0]!.count).toBe(1);
  });

  it('marks as failed when retry_count would exceed MAX_RETRIES', async () => {
    process.env.CRON_SECRET = 'k';
    kvStore.set('u2', asRecord({ id: 'u2', retry_count: 10 }));
    const res = await GET(makeReq({ auth: 'Bearer k' }));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { failed: number };
    expect(data.failed).toBe(1);
    expect(failedCalls).toHaveLength(1);
    expect(failedCalls[0]!.uuid).toBe('u2');
  });

  it('marks as delivered when telegram succeeds', async () => {
    process.env.CRON_SECRET = 'k';
    process.env.TELEGRAM_BOT_TOKEN = 't';
    process.env.TELEGRAM_CHAT_ID = 'c';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '',
    }) as unknown as typeof fetch;
    kvStore.set('u3', asRecord({ id: 'u3', retry_count: 0 }));

    const res = await GET(makeReq({ auth: 'Bearer k' }));
    const data = (await res.json()) as { delivered: number };
    expect(res.status).toBe(200);
    expect(data.delivered).toBe(1);
    expect(deliveredCalls).toEqual(['u3']);
  });

  it('backoff scales with retry_count', async () => {
    process.env.CRON_SECRET = 'k';
    kvStore.set('u4', asRecord({ id: 'u4', retry_count: 3 }));
    // Verify the bump still happens after the route's in-handler sleep.
    const res = await GET(makeReq({ auth: 'Bearer k' }));
    expect(res.status).toBe(200);
    expect(bumpCalls[0]?.uuid).toBe('u4');
    expect(bumpCalls[0]?.count).toBe(4);
  });
});
