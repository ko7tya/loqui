import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { NextRequest } from 'next/server';

/**
 * POST /api/submit integration.
 *
 * Strategy:
 *   - Mock @/lib/kv so we observe saves + delivery transitions.
 *   - Mock fetch for Telegram transport.
 *   - Use a fresh IP per test so the route-level rate-limit map can't leak
 *     state across tests.
 */

// --- KV mock --------------------------------------------------------------

type MockRecord = {
  id: string;
  status: string;
  delivered_at?: string;
  retry_count: number;
  last_error?: string;
};

const kvState: {
  submissions: Map<string, MockRecord>;
  waitlistCounter: number;
} = {
  submissions: new Map(),
  waitlistCounter: 0,
};

vi.mock('@/lib/kv', () => ({
  saveSubmission: vi.fn(async (uuid: string, data: MockRecord) => {
    kvState.submissions.set(uuid, { ...data });
  }),
  getSubmission: vi.fn(async (uuid: string) =>
    kvState.submissions.get(uuid) ?? null,
  ),
  getPendingSubmissions: vi.fn(async () => []),
  markDelivered: vi.fn(async (uuid: string) => {
    const existing = kvState.submissions.get(uuid);
    if (existing) {
      kvState.submissions.set(uuid, {
        ...existing,
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      });
    }
  }),
  markFailed: vi.fn(async () => {}),
  bumpRetry: vi.fn(async () => {}),
  incrementWaitlist: vi.fn(async () => {
    kvState.waitlistCounter += 1;
    return 2487 + kvState.waitlistCounter;
  }),
  isKVConfigured: vi.fn(() => false),
}));

import { POST } from '@/app/api/submit/route';

const makeReq = (
  body: unknown,
  { ip = '10.1.0.1', raw = false }: { ip?: string; raw?: boolean } = {},
): NextRequest => {
  const req = new Request('http://localhost/api/submit', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: raw ? (body as string) : JSON.stringify(body),
  });
  return req as unknown as NextRequest;
};

const baseBody = (overrides: Record<string, unknown> = {}) => ({
  email: 'user@example.com',
  answers: {
    q1_who_talking_to: 'colleague',
    q2_level: 'conversational',
    q3_segment: 'career',
    q4_age: '25_34',
    q5_moment: 'the Monday stand-up',
    q6_time: 20,
    q8_coach: 'helen',
    q8_style: 'conversations',
  },
  ...overrides,
});

beforeEach(() => {
  kvState.submissions.clear();
  kvState.waitlistCounter = 0;
  vi.spyOn(console, 'log').mockImplementation(() => {});
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_CHAT_ID;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/submit — happy path', () => {
  it('returns 200 with waitlist_position and plan_name on valid payload', async () => {
    const res = await POST(makeReq(baseBody(), { ip: '10.1.1.1' }));
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      ok: boolean;
      waitlist_position: number;
      plan_name: string;
    };
    expect(data.ok).toBe(true);
    expect(typeof data.waitlist_position).toBe('number');
    expect(data.plan_name).toBeTruthy();
  });

  it('consecutive submits each get their own position', async () => {
    const r1 = await POST(makeReq(baseBody(), { ip: '10.1.1.2' }));
    const r2 = await POST(
      makeReq(baseBody({ email: 'second@example.com' }), {
        ip: '10.1.1.3',
      }),
    );
    const d1 = (await r1.json()) as { waitlist_position: number };
    const d2 = (await r2.json()) as { waitlist_position: number };
    expect(d2.waitlist_position).toBe(d1.waitlist_position + 1);
  });
});

describe('POST /api/submit — honeypot', () => {
  it('honeypot filled → returns fake ok:true, does NOT persist submission', async () => {
    const beforeCount = kvState.submissions.size;
    const res = await POST(
      makeReq(baseBody({ _hp: 'bot-was-here' }), { ip: '10.1.2.1' }),
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as { ok: boolean };
    expect(data.ok).toBe(true);
    expect(kvState.submissions.size).toBe(beforeCount);
  });
});

describe('POST /api/submit — validation', () => {
  it('invalid email → 400', async () => {
    const res = await POST(
      makeReq(baseBody({ email: 'not-an-email' }), { ip: '10.1.3.1' }),
    );
    expect(res.status).toBe(400);
    const data = (await res.json()) as { ok: boolean; error: string };
    expect(data.ok).toBe(false);
    expect(data.error).toBe('invalid_payload');
  });
});

describe('POST /api/submit — rate limit', () => {
  it('6 rapid calls from same IP, 6th returns 429', async () => {
    const ip = '10.1.4.1';
    let last: Awaited<ReturnType<typeof POST>> | null = null;
    for (let i = 0; i < 6; i += 1) {
      last = await POST(
        makeReq(baseBody({ email: `r${i}@example.com` }), { ip }),
      );
    }
    expect(last!.status).toBe(429);
  });
});

describe('POST /api/submit — Telegram integration', () => {
  it('Telegram disabled → saves to KV with status:pending, still returns 200', async () => {
    const res = await POST(makeReq(baseBody(), { ip: '10.1.5.1' }));
    expect(res.status).toBe(200);
    const stored = Array.from(kvState.submissions.values());
    expect(stored).toHaveLength(1);
    expect(stored[0]!.status).toBe('pending');
  });

  it('Telegram 200 → submission marked delivered', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'token-ok';
    process.env.TELEGRAM_CHAT_ID = 'chat-ok';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '',
    }) as unknown as typeof fetch;

    const res = await POST(makeReq(baseBody(), { ip: '10.1.5.2' }));
    expect(res.status).toBe(200);
    const stored = Array.from(kvState.submissions.values());
    expect(stored).toHaveLength(1);
    expect(stored[0]!.status).toBe('delivered');
  });

  it('Telegram 500 → submission stays pending', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'token-500';
    process.env.TELEGRAM_CHAT_ID = 'chat-500';
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'boom',
    }) as unknown as typeof fetch;

    const res = await POST(makeReq(baseBody(), { ip: '10.1.5.3' }));
    expect(res.status).toBe(200);
    const stored = Array.from(kvState.submissions.values());
    expect(stored).toHaveLength(1);
    expect(stored[0]!.status).toBe('pending');
  });
});
