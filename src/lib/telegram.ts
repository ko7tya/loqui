import type { FunnelState, CoachId, AgeBracket } from './types';
import {
  LEVEL_LABELS,
  SEGMENT_LABELS,
  AGE_BRACKET_LABELS,
} from './types';
import { COACHES } from '@/content/coaches';
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
 *
 * v2: Q4 is now age, Q8 is now a coach pick. The old prior-app field is
 * retained on the payload (for back-compat with stale sessions) and only
 * rendered as a debug footer if present.
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

// --- Payload shape --------------------------------------------------------

export interface TelegramNotifyPayload {
  timestamp: string;
  email: string;
  waitlist_position: number;
  // All 10 answer fields.
  q1_who?: FunnelState['q1_who_talking_to'];
  q2_level?: FunnelState['q2_level'];
  q3_segment?: FunnelState['q3_segment'];
  /** v2: age bracket replaces the prior-app multi-select. */
  q4_age?: AgeBracket;
  /** Legacy — only rendered as a debug footer if present on the record. */
  q4_prior_apps?: FunnelState['q4_prior_apps'];
  q5_moment?: string;
  q5_moment_id?: string;
  q6_time?: FunnelState['q6_time'];
  q7_challenge?: FunnelState['q7_challenge'];
  /** v2: selected coach; legacy `q8_style` is still tracked below. */
  q8_coach?: CoachId;
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
  q4_age: record.answers.q4_age,
  q4_prior_apps: record.answers.q4_prior_apps,
  q5_moment: record.answers.q5_moment,
  q5_moment_id: record.answers.q5_moment_id,
  q6_time: record.answers.q6_time,
  q7_challenge: record.answers.q7_challenge,
  q8_coach: record.answers.q8_coach,
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

/**
 * Every question is emitted as an explicit Q&A pair. The brief calls for
 * "all Q&A pairs clearly labeled" — we render the literal question text
 * alongside each answer so a reviewer can see exactly what was asked.
 */
const QUESTIONS: Array<{ id: string; label: string }> = [
  {
    id: 'Q1',
    label: 'When you imagine speaking fluently, who are you talking to?',
  },
  { id: 'Q2', label: 'Where are you right now? (current English level)' },
  { id: 'Q3', label: 'Why are you learning English?' },
  { id: 'Q4', label: 'How old are you? (age bracket)' },
  { id: 'Q5', label: 'Which specific moment do you want to nail?' },
  { id: 'Q6', label: 'How much time can you actually give this?' },
  { id: 'Q7', label: 'Which phrasing sounds most natural? (live coaching demo)' },
  { id: 'Q8', label: 'Pick your coach.' },
  { id: 'Q9', label: 'Your generated plan' },
  { id: 'Q10', label: 'Email address' },
];

const answerFor = (p: TelegramNotifyPayload, index: number): string => {
  switch (index) {
    case 0:
      return p.q1_who ? WHO_LABELS[p.q1_who] : '—';
    case 1:
      return p.q2_level ? LEVEL_LABELS[p.q2_level] : '—';
    case 2:
      return p.q3_segment ? SEGMENT_LABELS[p.q3_segment] : '—';
    case 3:
      return p.q4_age ? AGE_BRACKET_LABELS[p.q4_age] : '—';
    case 4:
      return p.q5_moment ?? '—';
    case 5:
      return p.q6_time ? TIME_LABELS[p.q6_time] : '—';
    case 6:
      return p.q7_challenge
        ? `${p.q7_challenge.was_correct ? '✓ correct' : '✗ incorrect'} (challenge: ${p.q7_challenge.challenge_id}, picked ${p.q7_challenge.selected_option_id})`
        : '—';
    case 7: {
      if (!p.q8_coach) return '—';
      const c = COACHES[p.q8_coach];
      return `${c.name} — ${c.accent}, ${c.style}`;
    }
    case 8:
      return `${p.plan_name} — ${p.plan_tagline}`;
    case 9:
      return p.email;
    default:
      return '—';
  }
};

export const formatMessage = (p: TelegramNotifyPayload): string => {
  const lines: string[] = [
    `*New Loqui signup* — \\#${p.waitlist_position}`,
    `Timestamp: ${fmt(p.timestamp)}`,
    '',
  ];

  QUESTIONS.forEach((q, i) => {
    lines.push(`*${q.id} — ${escapeMd(q.label)}*`);
    lines.push(escapeMd(answerFor(p, i)));
    lines.push('');
  });

  // Back-compat debug footer: only emit prior-apps if a legacy session
  // still carries them. Keeps the main Q&A block clean.
  if (p.q4_prior_apps && p.q4_prior_apps.length > 0) {
    const joined = p.q4_prior_apps
      .map((a) => PRIOR_APP_LABELS[a])
      .join(', ');
    lines.push(`*Legacy Q4 \\(prior apps\\)*`);
    lines.push(escapeMd(joined));
    lines.push('');
  }

  lines.push('\\-\\-\\-');
  lines.push('Sent by Loqui');

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
          age: payload.q4_age,
          coach: payload.q8_coach,
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
