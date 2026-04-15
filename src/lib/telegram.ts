import type { FunnelState } from './types';
import { LEVEL_LABELS, SEGMENT_LABELS } from './types';
import type { SubmissionRecord } from './types-backend';

/**
 * Telegram Bot API client.
 *
 * The brief requires every submission to push a message that carries all 10
 * funnel answers. `buildTelegramPayload` extracts only what the formatter
 * needs from a `SubmissionRecord`, so route handlers don't reach into the
 * full record inline.
 *
 * MarkdownV2 is picky: every user-supplied value goes through `escapeMd`.
 */

const API_BASE = 'https://api.telegram.org';

// --- Labels for inline pretty-printing ------------------------------------

const WHO_LABELS: Record<NonNullable<FunnelState['q1_who_talking_to']>, string> =
  {
    colleague: 'A colleague in a meeting',
    stranger_abroad: 'A stranger at a bar abroad',
    partner_family: "My partner's family",
    interviewer: 'An interviewer across the table',
  };

const PRIOR_APP_LABELS: Record<
  NonNullable<FunnelState['q4_prior_apps']>[number],
  string
> = {
  duolingo: 'Duolingo',
  babbel: 'Babbel',
  busuu: 'Busuu',
  italki_preply: 'italki / Preply',
  none: 'None',
};

const TIME_LABELS: Record<NonNullable<FunnelState['q6_time']>, string> = {
  10: '10 min / day',
  20: '20 min / day',
  45: '45 min / day',
};

const STYLE_LABELS: Record<NonNullable<FunnelState['q8_style']>, string> = {
  drills: 'Short, sharp drills',
  conversations: 'Real conversations',
  stories: 'Stories and scenarios',
  structured: 'Structured lessons',
};

// --- Payload shape --------------------------------------------------------

export interface TelegramNotifyPayload {
  timestamp: string;
  email: string;
  waitlist_position: number;
  // All 10 answer fields.
  q1_who?: FunnelState['q1_who_talking_to'];
  q2_level?: FunnelState['q2_level'];
  q3_segment?: FunnelState['q3_segment'];
  q4_prior_apps?: FunnelState['q4_prior_apps'];
  q5_moment?: string;
  q5_moment_id?: string;
  q6_time?: FunnelState['q6_time'];
  q7_challenge?: FunnelState['q7_challenge'];
  q8_style?: FunnelState['q8_style'];
  // Plan header.
  plan_name: string;
  plan_tagline: string;
}

/**
 * Extract exactly the fields the formatter needs. Keeps the call site at
 * /api/submit clean.
 */
export const buildTelegramPayload = (
  record: SubmissionRecord,
): TelegramNotifyPayload => ({
  timestamp: record.created_at,
  email: record.email,
  waitlist_position: record.waitlist_position,
  q1_who: record.answers.q1_who_talking_to,
  q2_level: record.answers.q2_level,
  q3_segment: record.answers.q3_segment,
  q4_prior_apps: record.answers.q4_prior_apps,
  q5_moment: record.answers.q5_moment,
  q5_moment_id: record.answers.q5_moment_id,
  q6_time: record.answers.q6_time,
  q7_challenge: record.answers.q7_challenge,
  q8_style: record.answers.q8_style,
  plan_name: record.plan.plan_name,
  plan_tagline: record.plan.tagline,
});

// --- MarkdownV2 escape ----------------------------------------------------

export const escapeMd = (text: string): string =>
  text.replace(/[_*\[\]()~`>#+\-=|{}.!\\]/g, (ch) => `\\${ch}`);

const fmt = (value: string | number | undefined): string =>
  value === undefined || value === null || value === ''
    ? '—'
    : escapeMd(String(value));

// --- Message formatter ----------------------------------------------------

export const formatMessage = (p: TelegramNotifyPayload): string => {
  const who = p.q1_who ? WHO_LABELS[p.q1_who] : '—';
  const level = p.q2_level ? LEVEL_LABELS[p.q2_level] : '—';
  const segment = p.q3_segment ? SEGMENT_LABELS[p.q3_segment] : '—';
  const priorApps =
    p.q4_prior_apps && p.q4_prior_apps.length > 0
      ? p.q4_prior_apps.map((a) => PRIOR_APP_LABELS[a]).join(', ')
      : 'None';
  const time = p.q6_time ? TIME_LABELS[p.q6_time] : '—';
  const style = p.q8_style ? STYLE_LABELS[p.q8_style] : '—';

  const q7Line = p.q7_challenge
    ? `Challenge: ${p.q7_challenge.was_correct ? '✓' : '✗'} — ${escapeMd(p.q7_challenge.challenge_id)}`
    : 'Challenge: —';

  const lines: string[] = [
    `*New Loqui signup* — \\#${p.waitlist_position}`,
    '',
    fmt(p.timestamp),
    '',
    '*Contact*',
    `Email: ${escapeMd(p.email)}`,
    '',
    '*Profile*',
    `Talking to: ${escapeMd(who)}`,
    `Level: ${escapeMd(level)}`,
    `Segment: ${escapeMd(segment)}`,
    `Prior apps: ${escapeMd(priorApps)}`,
    '',
    '*Moment*',
    `Target: ${fmt(p.q5_moment)}`,
    `Time / day: ${escapeMd(time)}`,
    q7Line,
    `Style: ${escapeMd(style)}`,
    '',
    '*Plan*',
    escapeMd(p.plan_name),
    escapeMd(p.plan_tagline),
    '',
    '\\-\\-\\-',
    'Sent by Loqui MVP',
  ];

  return lines.join('\n');
};

// --- Transport ------------------------------------------------------------

export const isTelegramConfigured = (): boolean =>
  Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

export const sendMessage = async (
  payload: TelegramNotifyPayload,
): Promise<{ ok: boolean; status?: number; error?: string }> => {
  if (!isTelegramConfigured()) {
    console.log(
      '[telegram] not configured — stub message:',
      JSON.stringify(
        {
          email: payload.email,
          waitlist_position: payload.waitlist_position,
          segment: payload.q3_segment,
          plan_name: payload.plan_name,
        },
        null,
        2,
      ),
    );
    return { ok: false, error: 'Telegram not configured' };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const chatId = process.env.TELEGRAM_CHAT_ID!;
  const url = `${API_BASE}/bot${token}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatMessage(payload),
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        ok: false,
        status: res.status,
        error: `Telegram ${res.status}: ${text.slice(0, 200)}`,
      };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
};
