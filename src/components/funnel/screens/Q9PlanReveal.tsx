'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { QuestionShell } from '../QuestionShell';
import { RhythmLoader } from '../RhythmLoader';
import { Button } from '@/components/ui/button';
import { useFunnelStore } from '@/lib/state';
import { generateDeterministicPlan } from '@/lib/plan-generator';
import { SEGMENT_DEFS } from '@/content/segments';
import { COACHES, coachByStyle } from '@/content/coaches';
import { track } from '@/lib/analytics';
import type {
  FunnelState,
  GeneratedPlan,
  PlanCoachBlock,
  ReadinessAxis,
  Segment,
} from '@/lib/types';
import { cn } from '@/lib/utils';

export interface Q9Props {
  direction: 1 | -1;
  onNext: () => void;
  onBack: () => void;
}

type Stage = 'loading' | 'ready' | 'failed';

const LOADING_COPY = [
  'Reading your answers…',
  'Sharpening your plan…',
  'Writing your cadence…',
] as const;

const AXIS_LABELS: Record<ReadinessAxis, string> = {
  pronunciation: 'Pronunciation',
  lexical_range: 'Lexical range',
  listening_speed: 'Listening speed',
  register: 'Register',
  cultural_fluency: 'Cultural fluency',
};

/**
 * Plan reveal.
 *
 * Flow:
 *   1. Mount → start 3-stage loading (~2.5s) + fetch /api/plan in parallel.
 *   2. Once BOTH the min loading time has elapsed AND the API returns, we
 *      show the plan. Perceived effort anchors value (design-system.md §5.5).
 *   3. If the first request fails, retry once. If still failing, fall back
 *      to `generateDeterministicPlan` client-side and flag `plan_fallback_used`.
 *
 * v2: the reveal opens with a coach introduction block — name, accent chip,
 * segment-specific italic quote — animated in first, then focus axes, then
 * weeks, then outcome. If neither `q8_coach` nor `q8_style` resolves a coach
 * we skip the block and fall back to a neutral one-line intro.
 */
export function Q9PlanReveal({ direction, onNext, onBack }: Q9Props) {
  const answers = useFunnelStore((s) => s.answers);
  const setPlan = useFunnelStore((s) => s.setPlan);
  const existingPlan = answers.generated_plan;

  // Snapshot answers on mount so our fetch effect doesn't re-fire when setPlan
  // writes back into the store.
  const answersRef = useRef<FunnelState>(answers);
  const [stage, setStage] = useState<Stage>(existingPlan ? 'ready' : 'loading');
  const [copyIndex, setCopyIndex] = useState(0);
  const segmentOnMount = useRef(answers.segment);

  useEffect(() => {
    track('question_viewed', {
      question_id: 'Q9_PLAN_REVEAL',
      segment: segmentOnMount.current,
    });
    track('plan_generation_started', { segment: segmentOnMount.current });
  }, []);

  // Rotate loading copy
  useEffect(() => {
    if (stage !== 'loading') return;
    const interval = setInterval(() => {
      setCopyIndex((i) => (i + 1) % LOADING_COPY.length);
    }, 850);
    return () => clearInterval(interval);
  }, [stage]);

  // Fetch plan — once per mount. Skips when we already have one.
  useEffect(() => {
    if (existingPlan) return;
    const snapshot = answersRef.current;

    let cancelled = false;
    const minDelay = new Promise<void>((res) => setTimeout(res, 2500));

    const fetchPlan = async (): Promise<{
      plan: GeneratedPlan;
      source: 'claude' | 'fallback';
    } | null> => {
      try {
        const res = await fetch('/api/plan', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(snapshot),
        });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as {
          plan: GeneratedPlan;
          source: 'claude' | 'fallback';
        };
        return data;
      } catch {
        return null;
      }
    };

    (async () => {
      const first = await fetchPlan();
      const result = first ?? (await fetchPlan());
      await minDelay;
      if (cancelled) return;

      if (result) {
        setPlan(result.plan, result.source);
        track('plan_generated', {
          plan_source: result.source,
          plan_name: result.plan.plan_name,
          segment: snapshot.segment,
        });
        setStage('ready');
      } else {
        // Last-ditch client-side fallback so the user never sees a broken reveal.
        const plan = generateDeterministicPlan(snapshot);
        setPlan(plan, 'fallback');
        track('plan_fallback_used', { segment: snapshot.segment });
        track('plan_generated', {
          plan_source: 'fallback',
          plan_name: plan.plan_name,
          segment: snapshot.segment,
        });
        setStage('ready');
      }
    })();

    return () => {
      cancelled = true;
    };
    // Deliberately empty deps — snapshot on mount. setPlan is store-stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const plan = answers.generated_plan;
  const segment = answers.segment ?? 'career';
  const segmentDef = SEGMENT_DEFS[segment];

  // Resolve the coach block. Prefer the server-attached `plan.coach` (the
  // /api/plan route now enriches the plan with coach context). Fall back to
  // the store's `q8_coach`, then to `q8_style` → matching coach id, then
  // nothing (which the reveal renders as a neutral single-line intro).
  const coachBlock = resolveCoachBlock(answers, plan, segment);

  // Use the simplest-possible render for the loading stage so the user never
  // sees a blank screen: no opacity transition, no nested AnimatePresence on
  // the outer container. Copy rotation still animates, but the loader itself
  // is present from the very first paint.
  return (
    <QuestionShell
      step={9}
      direction={direction}
      section={stage === 'loading' ? 'BUILDING' : 'YOUR CADENCE'}
      title={stage === 'loading' ? 'Your plan is on the way.' : 'Your plan.'}
      subtitle={
        stage === 'loading'
          ? 'A few seconds — we only build this once.'
          : segmentDef.q9_sub_copy
      }
      onBack={onBack}
      cta={
        plan && stage === 'ready' ? (
          <Button className="w-full" onClick={onNext}>
            Lock in my plan <span aria-hidden>→</span>
          </Button>
        ) : undefined
      }
    >
      {stage === 'loading' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 py-12">
          <RhythmLoader size="lg" label="Generating your plan" />
          <AnimatePresence mode="wait">
            <motion.p
              key={copyIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="font-serif text-h2 text-ink text-center text-balance"
            >
              {LOADING_COPY[copyIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      )}

      {stage === 'ready' && plan && (
        <div className="flex flex-col gap-5">
          <PlanReveal plan={plan} coach={coachBlock} />
        </div>
      )}
    </QuestionShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Coach block resolution
// ─────────────────────────────────────────────────────────────────────────────

function resolveCoachBlock(
  answers: FunnelState,
  plan: GeneratedPlan | undefined,
  segment: Segment,
): PlanCoachBlock | undefined {
  // Preferred source: the API response already attached a coach.
  if (plan?.coach) return plan.coach;

  // Next: the store has a Q8 coach pick.
  if (answers.q8_coach) {
    const c = COACHES[answers.q8_coach];
    return {
      id: c.id,
      name: c.name,
      accent: c.accent,
      quote: c.quotes[segment],
    };
  }

  // Final: infer the coach from the legacy `q8_style` key (old saved sessions).
  const inferred = coachByStyle(answers.q8_style);
  if (inferred) {
    const c = COACHES[inferred];
    return {
      id: c.id,
      name: c.name,
      accent: c.accent,
      quote: c.quotes[segment],
    };
  }

  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan reveal body — staggered cascade from the spec §3.7
// ─────────────────────────────────────────────────────────────────────────────

function PlanReveal({
  plan,
  coach,
}: {
  plan: GeneratedPlan;
  coach: PlanCoachBlock | undefined;
}) {
  const reduce = useReducedMotion();
  const base = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
      };

  const step = (i: number) => ({
    ...base,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as number[],
      delay: reduce ? 0 : 0.12 * i,
    },
  });

  return (
    <>
      {/* Coach introduction — first in the stagger. */}
      {coach ? (
        <motion.aside
          {...step(0)}
          className="rounded-lg border border-ember/40 bg-ember-wash/70 px-5 py-5 shadow-sm"
          aria-label={`Your coach: ${coach.name}`}
        >
          <p className="text-overline font-semibold uppercase text-ember">
            Your coach
          </p>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-h1 text-ink">
              Meet {coach.name}.
            </h2>
            <span className="rounded-full bg-ember/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ember-deep">
              {coach.accent}
            </span>
          </div>
          <blockquote className="mt-3 border-l-2 border-ember pl-3 font-serif text-body-lg italic text-ink">
            &ldquo;{coach.quote}&rdquo;
          </blockquote>
        </motion.aside>
      ) : (
        <motion.p
          {...step(0)}
          className="font-serif text-h2 text-ink text-balance"
        >
          Here&apos;s your plan.
        </motion.p>
      )}

      {/* Plan name — hero. Tagline intentionally omitted; the Q9 outer subtitle
          already frames the plan, and repeating "Four weeks…" immediately
          below the plan name read as duplication on mobile. */}
      <motion.header {...step(1)} className="flex flex-col gap-2">
        <h2 className="font-serif text-display text-ink text-balance">
          {plan.plan_name}
        </h2>
      </motion.header>

      {/* Moment quote */}
      <motion.div
        {...step(2)}
        className="rounded-lg border-l-[3px] border-ember bg-surface-elevated px-4 py-3 shadow-sm"
      >
        <p className="text-overline font-semibold uppercase text-ember">
          The moment
        </p>
        <p className="mt-1 font-serif text-body-lg italic text-ink">
          {plan.the_moment}
        </p>
      </motion.div>

      {/* Focus axes */}
      <motion.section {...step(3)} className="flex flex-col gap-3">
        <h3 className="text-overline font-semibold uppercase text-ink-muted">
          Focus
        </h3>
        <div className="flex flex-col gap-3">
          {plan.focus_axes.map((axis) => (
            <div
              key={axis.axis}
              className="rounded-md border border-ink/10 bg-surface-muted px-4 py-3"
            >
              <p className="text-body-lg font-medium text-ink">
                {AXIS_LABELS[axis.axis] ?? axis.axis}
              </p>
              <p className="mt-1 text-body-sm text-ink-muted">
                {axis.why_for_you}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Weekly cards */}
      <motion.section {...step(4)} className="flex flex-col gap-3">
        <h3 className="text-overline font-semibold uppercase text-ink-muted">
          Four weeks
        </h3>
        <div className="flex flex-col gap-3">
          {plan.weeks.map((week, i) => (
            <motion.div
              key={week.week}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
                delay: reduce ? 0 : 0.6 + 0.1 * i,
              }}
              className={cn(
                'rounded-lg border border-ink/10 bg-surface-elevated px-4 py-4 shadow-sm',
              )}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-overline font-semibold uppercase text-ember">
                  Week {week.week}
                </span>
                <span className="text-overline text-ink-subtle">
                  {week.sessions.length || '–'} sessions
                </span>
              </div>
              <p className="mt-1 font-serif text-h3 text-ink">{week.title}</p>
              <p className="mt-1 text-body-sm text-ink-muted">{week.theme}</p>
              {week.sessions.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1.5 border-t border-ink/10 pt-3">
                  {week.sessions.map((session) => (
                    <li
                      key={session.name}
                      className="flex items-center gap-2 text-body-sm text-ink"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-ember"
                        aria-hidden
                      />
                      <span className="flex-1">{session.name}</span>
                      <span className="text-body-sm text-ink-subtle">
                        {session.duration_min} min · {session.type}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Outcome */}
      <motion.p
        {...step(5)}
        className="mt-2 font-serif text-body-lg italic text-ink-muted text-balance"
      >
        {plan.outcome}
      </motion.p>
    </>
  );
}
