import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  escapeMd,
  formatMessage,
  buildTelegramPayload,
  isTelegramConfigured,
  sendMessage,
  type TelegramNotifyPayload,
} from './telegram';
import type { SubmissionRecord } from './types-backend';

/**
 * Telegram client — escape, formatter, payload builder, transport.
 */

const basePayload = (overrides: Partial<TelegramNotifyPayload> = {}): TelegramNotifyPayload => ({
  timestamp: '2025-01-01T12:34:56Z',
  email: 'user@example.com',
  waitlist_position: 2501,
  q1_who: 'colleague',
  q2_level: 'conversational',
  q3_segment: 'career',
  q4_age: '25_34',
  q5_moment: 'the Monday stand-up',
  q5_moment_id: 'career_0',
  q6_time: 20,
  q7_challenge: {
    challenge_id: 'career_conv_intro',
    selected_option_id: 'a',
    was_correct: true,
  },
  q8_coach: 'helen',
  q8_style: 'conversations',
  plan_name: 'The Stand-Up Plan',
  plan_tagline: 'Four weeks to the moment you described.',
  ...overrides,
});

describe('escapeMd', () => {
  it('escapes every MarkdownV2 reserved character', () => {
    const raw = '_ * [ ] ( ) ~ ` > # + - = | { } . ! \\';
    const escaped = escapeMd(raw);
    // Every reserved char should be prefixed with a backslash.
    for (const ch of '_*[]()~`>#+-=|{}.!') {
      expect(escaped).toContain(`\\${ch}`);
    }
    // Backslash itself is escaped: original had ` \` → `\\`
    expect(escaped).toContain('\\\\');
  });

  it('is a no-op for plain text with no reserved chars', () => {
    expect(escapeMd('hello world')).toBe('hello world');
  });
});

describe('formatMessage', () => {
  it('emits 10 labeled Q&A blocks (Q1..Q10) with literal question text', () => {
    const out = formatMessage(basePayload());
    for (let i = 1; i <= 10; i += 1) {
      expect(out).toContain(`Q${i} `);
    }
    // Check a couple of literal question labels (partial matches, escaped)
    expect(out).toContain('who are you talking to');
    expect(out).toContain('current English level');
    expect(out).toContain('coach');
    expect(out).toContain('generated plan');
    expect(out).toContain('Email address');
  });

  it('includes timestamp and waitlist position header', () => {
    const out = formatMessage(basePayload({ waitlist_position: 2999 }));
    expect(out).toContain('\\#2999');
    expect(out).toContain('New Loqui signup');
    expect(out).toContain('Timestamp:');
  });
});

describe('buildTelegramPayload', () => {
  it('extracts only the fields needed from SubmissionRecord', () => {
    const record: SubmissionRecord = {
      id: 'uuid-1',
      email: 'pick@me.com',
      answers: {
        session_id: 'x',
        started_at: 'y',
        plan_source: 'fallback',
        q1_who_talking_to: 'interviewer',
        q2_level: 'near_native',
        q3_segment: 'test_prep',
        q4_age: '35_44',
        q5_moment: 'IELTS speaking',
        q5_moment_id: 'tp_0',
        q6_time: 45,
        q8_coach: 'david',
        q8_style: 'structured',
      },
      plan: {
        plan_name: 'The Band-8 Plan',
        tagline: 'Four weeks to the moment.',
        the_moment: 'For: IELTS speaking',
        focus_axes: [
          { axis: 'register', why_for_you: 'reason' },
          { axis: 'lexical_range', why_for_you: 'reason' },
        ],
        weeks: [],
        outcome: 'outcome',
      },
      waitlist_position: 2600,
      status: 'pending',
      created_at: '2025-04-16T00:00:00Z',
      retry_count: 0,
    };

    const out = buildTelegramPayload(record);
    expect(out).toEqual({
      timestamp: '2025-04-16T00:00:00Z',
      email: 'pick@me.com',
      waitlist_position: 2600,
      q1_who: 'interviewer',
      q2_level: 'near_native',
      q3_segment: 'test_prep',
      q4_age: '35_44',
      q4_prior_apps: undefined,
      q5_moment: 'IELTS speaking',
      q5_moment_id: 'tp_0',
      q6_time: 45,
      q7_challenge: undefined,
      q8_coach: 'david',
      q8_style: 'structured',
      plan_name: 'The Band-8 Plan',
      plan_tagline: 'Four weeks to the moment.',
    });
  });
});

describe('isTelegramConfigured', () => {
  const ORIG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const ORIG_CHAT = process.env.TELEGRAM_CHAT_ID;

  afterEach(() => {
    if (ORIG_TOKEN === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
    else process.env.TELEGRAM_BOT_TOKEN = ORIG_TOKEN;
    if (ORIG_CHAT === undefined) delete process.env.TELEGRAM_CHAT_ID;
    else process.env.TELEGRAM_CHAT_ID = ORIG_CHAT;
  });

  it('returns true when both env vars set', () => {
    process.env.TELEGRAM_BOT_TOKEN = 'abc';
    process.env.TELEGRAM_CHAT_ID = '-100';
    expect(isTelegramConfigured()).toBe(true);
  });

  it('returns false when either env var missing', () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    expect(isTelegramConfigured()).toBe(false);

    process.env.TELEGRAM_BOT_TOKEN = 'abc';
    delete process.env.TELEGRAM_CHAT_ID;
    expect(isTelegramConfigured()).toBe(false);

    delete process.env.TELEGRAM_BOT_TOKEN;
    process.env.TELEGRAM_CHAT_ID = '-100';
    expect(isTelegramConfigured()).toBe(false);
  });
});

describe('sendMessage', () => {
  const ORIG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const ORIG_CHAT = process.env.TELEGRAM_CHAT_ID;
  const originalFetch = global.fetch;

  beforeEach(() => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
  });

  afterEach(() => {
    if (ORIG_TOKEN === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
    else process.env.TELEGRAM_BOT_TOKEN = ORIG_TOKEN;
    if (ORIG_CHAT === undefined) delete process.env.TELEGRAM_CHAT_ID;
    else process.env.TELEGRAM_CHAT_ID = ORIG_CHAT;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns stub result when not configured', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await sendMessage(basePayload());
    expect(result).toEqual({ ok: false, error: 'Telegram not configured' });
    expect(spy).toHaveBeenCalled();
  });

  it('POSTs correct body shape when configured', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'token-123';
    process.env.TELEGRAM_CHAT_ID = '-100500';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '',
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    const result = await sendMessage(basePayload());
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain('/bottoken-123/sendMessage');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body);
    expect(body.chat_id).toBe('-100500');
    expect(body.parse_mode).toBe('MarkdownV2');
    expect(body.disable_web_page_preview).toBe(true);
    expect(typeof body.text).toBe('string');
  });

  it('returns {ok:false, status, error} on 4xx response', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'tok';
    process.env.TELEGRAM_CHAT_ID = 'chat';
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'bad request',
    }) as unknown as typeof fetch;
    const result = await sendMessage(basePayload());
    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
    expect(result.error).toContain('Telegram 400');
  });

  it('returns {ok:false, error} on network error', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'tok';
    process.env.TELEGRAM_CHAT_ID = 'chat';
    global.fetch = vi.fn().mockRejectedValue(
      new Error('ECONNRESET'),
    ) as unknown as typeof fetch;
    const result = await sendMessage(basePayload());
    expect(result.ok).toBe(false);
    expect(result.error).toBe('ECONNRESET');
  });
});
