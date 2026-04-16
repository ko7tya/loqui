import type {
  FunnelState,
  GeneratedPlan,
  PlanCoachBlock,
  PlanWeek,
  Segment,
  TimeCommitment,
  WhoTalkingTo,
  CoachId,
} from './types';
import { LEVEL_LABELS } from './types';
import { PLAN_TEMPLATES } from '@/content/plans';
import { COACHES, coachByStyle } from '@/content/coaches';

/**
 * Deterministic plan generator — pure, sync, <50ms.
 *
 * Picks a template from the 4×3 segment/time matrix, then slot-fills
 * `{{moment}}`, `{{level}}`, and `{{who}}` with the user's actual answers.
 *
 * Slot substitution is intentionally simple: exact-match `{{key}}` only, no
 * loops, no conditionals. Copywriters can reason about a template visually.
 *
 * v2: the returned plan carries an optional `coach` block resolved from
 * `q8_coach` (preferred) or `q8_style` (fallback for stale sessions). The
 * Q9 reveal and Success screen both read this block directly, so clients
 * never need to re-derive the coach from answers.
 */

const WHO_LABELS: Record<WhoTalkingTo, string> = {
  colleague: 'a colleague in a meeting',
  stranger_abroad: 'a stranger at a bar abroad',
  partner_family: "your partner's family",
  interviewer: 'an interviewer across the table',
};

const DEFAULT_SEGMENT: Segment = 'career';
const DEFAULT_TIME: TimeCommitment = 20;

/** Replace every `{{key}}` token in `str` with the matching value in `vars`. */
const sub = (str: string, vars: Record<string, string>): string =>
  str.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    key in vars ? vars[key] : `{{${key}}}`,
  );

/** Deep-clone + slot-fill a GeneratedPlan. Keeps the template pristine. */
const fillSlots = (
  template: GeneratedPlan,
  answers: FunnelState,
): GeneratedPlan => {
  const vars: Record<string, string> = {
    moment: answers.q5_moment ?? 'the moment you described',
    level: answers.q2_level
      ? LEVEL_LABELS[answers.q2_level]
      : 'your level',
    who: answers.q1_who_talking_to
      ? WHO_LABELS[answers.q1_who_talking_to]
      : 'the person across from you',
  };

  const weeks: PlanWeek[] = template.weeks.map((w) => ({
    week: w.week,
    title: sub(w.title, vars),
    theme: sub(w.theme, vars),
    sessions: w.sessions.map((s) => ({
      name: sub(s.name, vars),
      duration_min: s.duration_min,
      type: s.type,
    })),
  }));

  return {
    plan_name: sub(template.plan_name, vars),
    tagline: sub(template.tagline, vars),
    the_moment: sub(template.the_moment, vars),
    focus_axes: template.focus_axes.map((fx) => ({
      axis: fx.axis,
      why_for_you: sub(fx.why_for_you, vars),
    })),
    weeks,
    outcome: sub(template.outcome, vars),
  };
};

/**
 * Derive the `PlanCoachBlock` that rides along with a generated plan. Reads
 * `q8_coach` first; falls back to `q8_style` → matching coach id; returns
 * undefined when neither is present (the reveal then shows a neutral intro).
 */
export function resolveCoachBlock(
  answers: FunnelState,
): PlanCoachBlock | undefined {
  const coachId: CoachId | undefined =
    answers.q8_coach ?? coachByStyle(answers.q8_style);
  if (!coachId) return undefined;
  const c = COACHES[coachId];
  const segment: Segment = answers.q3_segment ?? DEFAULT_SEGMENT;
  return {
    id: c.id,
    name: c.name,
    accent: c.accent,
    quote: c.quotes[segment],
  };
}

/**
 * Public entry point — used by the API route when Claude is disabled or fails.
 * Must complete synchronously and well under 50ms.
 */
export function generateDeterministicPlan(
  answers: FunnelState,
): GeneratedPlan {
  const segment: Segment = answers.q3_segment ?? DEFAULT_SEGMENT;
  const time: TimeCommitment = answers.q6_time ?? DEFAULT_TIME;
  const template =
    PLAN_TEMPLATES[segment]?.[time] ??
    PLAN_TEMPLATES[DEFAULT_SEGMENT][DEFAULT_TIME];
  const plan = fillSlots(template, answers);
  const coach = resolveCoachBlock(answers);
  if (coach) plan.coach = coach;
  return plan;
}
