import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '@/app/api/plan/route';
import type { NextRequest } from 'next/server';

/**
 * POST /api/plan integration.
 *
 * Calls the route handler directly with a minimal NextRequest. Does NOT spin
 * up a server. The route swallows all errors into a fallback plan, so we
 * assert both the happy path and the always-200 guarantee.
 */

const makeReq = (
  body: unknown,
  {
    ip = '10.0.0.1',
    raw = false,
  }: { ip?: string; raw?: boolean } = {},
): NextRequest => {
  const req = new Request('http://localhost/api/plan', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: raw ? (body as string) : JSON.stringify(body),
  });
  return req as unknown as NextRequest;
};

describe('POST /api/plan — happy paths', () => {
  beforeEach(() => {
    // Silence route logging noise.
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns fallback plan with full answers', async () => {
    const res = await POST(
      makeReq({
        q1_who_talking_to: 'colleague',
        q2_level: 'conversational',
        q3_segment: 'career',
        q4_age: '25_34',
        q5_moment: 'the Monday stand-up',
        q6_time: 20,
        q8_coach: 'helen',
      }, { ip: '10.0.0.10' }),
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as { plan: { plan_name: string; weeks: unknown[]; focus_axes: unknown[] }; source: string };
    expect(data.source).toBe('fallback');
    expect(data.plan.plan_name).toBeTruthy();
    expect(data.plan.weeks).toHaveLength(4);
    expect(data.plan.focus_axes).toHaveLength(2);
  });

  it('returns a plan even with minimal answers (segment + time)', async () => {
    const res = await POST(
      makeReq({
        q3_segment: 'test_prep',
        q6_time: 10,
      }, { ip: '10.0.0.11' }),
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as { plan: { plan_name: string }; source: string };
    expect(data.source).toBe('fallback');
    expect(data.plan.plan_name).toBeTruthy();
  });

  it('q8_coach=helen propagates name=Helen, accent=British onto plan.coach', async () => {
    const res = await POST(
      makeReq({
        q3_segment: 'career',
        q6_time: 20,
        q8_coach: 'helen',
      }, { ip: '10.0.0.12' }),
    );
    const data = (await res.json()) as {
      plan: { coach?: { name?: string; accent?: string } };
    };
    expect(data.plan.coach?.name).toBe('Helen');
    expect(data.plan.coach?.accent).toBe('British');
  });
});

describe('POST /api/plan — always-200 fallback', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('invalid body returns 200 with default fallback plan', async () => {
    // `q3_segment` set to nonsense string → zod fails, route still returns a plan.
    const res = await POST(
      makeReq({ q3_segment: 42, q6_time: 'lots' }, { ip: '10.0.0.20' }),
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as { plan: { plan_name: string }; source: string };
    expect(data.plan.plan_name).toBeTruthy();
    expect(data.source).toBe('fallback');
  });

  it('malformed JSON returns 200 with default fallback plan', async () => {
    const res = await POST(
      makeReq('not { json', { ip: '10.0.0.21', raw: true }),
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as { plan: { plan_name: string } };
    expect(data.plan.plan_name).toBeTruthy();
  });
});

describe('POST /api/plan — rate limit', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('11 rapid calls from same IP — 11th is rate-limited (still 200, fallback empty-answer plan)', async () => {
    const ip = '10.0.99.77';
    // The route's rate-limit branch returns an empty-answer fallback (no
    // segment). So we should see a still-valid plan back.
    let rateLimitedResponse: Awaited<ReturnType<typeof POST>> | null = null;
    for (let i = 0; i < 11; i += 1) {
      const res = await POST(
        makeReq(
          { q3_segment: 'career', q6_time: 20, q5_moment: `moment ${i}` },
          { ip },
        ),
      );
      if (i === 10) rateLimitedResponse = res;
    }
    expect(rateLimitedResponse).not.toBeNull();
    // Route contract: still 200, plan returned.
    expect(rateLimitedResponse!.status).toBe(200);
    const data = (await rateLimitedResponse!.json()) as {
      plan: { plan_name: string };
      source: string;
    };
    expect(data.source).toBe('fallback');
    expect(data.plan.plan_name).toBeTruthy();
  });
});
