import { describe, it, expect } from 'vitest';
import { generateDeterministicPlan, resolveCoachBlock } from './plan-generator';
import { SEGMENTS, type FunnelState, type Segment, type TimeCommitment } from './types';
import { COACHES } from '@/content/coaches';

/**
 * Deterministic plan-generator behavior.
 *
 * Verifies the 4×3 template matrix, slot-fill, coach-block resolution,
 * and graceful fallback when segment is undefined.
 */

const baseAnswers = (overrides: Partial<FunnelState> = {}): FunnelState => ({
  session_id: 'sess_test',
  started_at: '2025-01-01T00:00:00Z',
  plan_source: 'fallback',
  q1_who_talking_to: 'colleague',
  q2_level: 'conversational',
  q5_moment: 'the Monday stand-up',
  ...overrides,
});

describe('generateDeterministicPlan — shape across 4 segments × 3 times', () => {
  const TIMES: TimeCommitment[] = [10, 20, 45];

  for (const segment of SEGMENTS) {
    for (const time of TIMES) {
      it(`returns valid plan for segment=${segment} time=${time}`, () => {
        const plan = generateDeterministicPlan(
          baseAnswers({ q3_segment: segment, q6_time: time }),
        );
        expect(plan.plan_name).toBeTruthy();
        expect(typeof plan.plan_name).toBe('string');
        expect(plan.tagline).toBeTruthy();
        expect(plan.outcome).toBeTruthy();
        expect(plan.focus_axes).toHaveLength(2);
        expect(plan.weeks).toHaveLength(4);
        const weekNumbers = plan.weeks.map((w) => w.week).sort();
        expect(weekNumbers).toEqual([1, 2, 3, 4]);
        expect(plan.focus_axes.every((fx) => fx.axis && fx.why_for_you)).toBe(true);
      });
    }
  }
});

describe('slot-fill', () => {
  it('injects q5_moment verbatim into the_moment', () => {
    const moment = 'the 9am weekly team meeting with Finance';
    const plan = generateDeterministicPlan(
      baseAnswers({ q3_segment: 'career', q6_time: 20, q5_moment: moment }),
    );
    expect(plan.the_moment).toContain(moment);
  });

  it('substitutes level label and who-talking-to across plan copy', () => {
    const plan = generateDeterministicPlan(
      baseAnswers({
        q3_segment: 'career',
        q6_time: 20,
        q2_level: 'fluent_with_gaps',
        q1_who_talking_to: 'interviewer',
        q5_moment: 'a product review meeting',
      }),
    );
    const weekText = plan.weeks
      .flatMap((w) => [w.title, w.theme, ...w.sessions.map((s) => s.name)])
      .join(' ');
    const fullText = [
      plan.outcome,
      plan.tagline,
      plan.the_moment,
      ...plan.focus_axes.map((fx) => fx.why_for_you),
      weekText,
    ].join(' ');
    // No unresolved slots should leak through.
    expect(fullText).not.toMatch(/\{\{[a-z_]+\}\}/);
    // And the user's moment should be spliced in where expected.
    expect(weekText).toContain('a product review meeting');
  });
});

describe('coach block attachment', () => {
  it('attaches coach block when q8_coach is set', () => {
    const plan = generateDeterministicPlan(
      baseAnswers({
        q3_segment: 'career',
        q6_time: 20,
        q8_coach: 'helen',
      }),
    );
    expect(plan.coach).toBeDefined();
    expect(plan.coach?.id).toBe('helen');
    expect(plan.coach?.name).toBe('Helen');
    expect(plan.coach?.accent).toBe('British');
    expect(plan.coach?.quote).toBe(COACHES.helen.quotes.career);
  });

  it('falls through to q8_style when q8_coach missing', () => {
    const plan = generateDeterministicPlan(
      baseAnswers({
        q3_segment: 'travel_social',
        q6_time: 10,
        q8_style: 'stories',
      }),
    );
    expect(plan.coach).toBeDefined();
    expect(plan.coach?.id).toBe('aiko');
    expect(plan.coach?.quote).toBe(COACHES.aiko.quotes.travel_social);
  });

  it('returns a plan with no coach block when neither q8_coach nor q8_style is set', () => {
    const plan = generateDeterministicPlan(
      baseAnswers({ q3_segment: 'career', q6_time: 20 }),
    );
    expect(plan.coach).toBeUndefined();
  });
});

describe('undefined-segment fallback', () => {
  it('returns a plan when segment is undefined (falls to career default)', () => {
    const plan = generateDeterministicPlan(
      baseAnswers({ q3_segment: undefined, q6_time: 20 }),
    );
    // career × 20 is the default — plan_name is "The Stand-Up Plan"
    expect(plan.plan_name).toBeTruthy();
    expect(plan.weeks).toHaveLength(4);
    expect(plan.focus_axes).toHaveLength(2);
  });

  it('returns a plan when everything is undefined (fully default)', () => {
    const plan = generateDeterministicPlan({
      session_id: 'x',
      started_at: 'y',
      plan_source: 'fallback',
    } as FunnelState);
    expect(plan.plan_name).toBeTruthy();
    expect(plan.weeks).toHaveLength(4);
  });
});

describe('resolveCoachBlock', () => {
  it('prefers q8_coach over q8_style', () => {
    const block = resolveCoachBlock(
      baseAnswers({
        q3_segment: 'career',
        q8_coach: 'marcus',
        q8_style: 'stories', // would map to aiko
      }),
    );
    expect(block?.id).toBe('marcus');
  });

  it('uses q3_segment to pick the quote', () => {
    const block = resolveCoachBlock(
      baseAnswers({
        q3_segment: 'immigration',
        q8_coach: 'david',
      }),
    );
    expect(block?.quote).toBe(COACHES.david.quotes.immigration);
  });

  it('defaults to career quote when segment is undefined', () => {
    const block = resolveCoachBlock(
      baseAnswers({
        q3_segment: undefined,
        q8_coach: 'helen',
      }),
    );
    expect(block?.quote).toBe(COACHES.helen.quotes.career);
  });

  it('returns undefined when neither coach nor style is set', () => {
    expect(
      resolveCoachBlock(baseAnswers({ q8_coach: undefined, q8_style: undefined })),
    ).toBeUndefined();
  });
});
