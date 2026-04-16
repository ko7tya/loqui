'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { QuestionShell } from '../QuestionShell';
import { CoachAvatar } from '../CoachAvatar';
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

/**
 * Loading choreography. Each stage describes a separate beat of the
 * anticipation animation:
 *   1 — reading (0–0.9s): the answers get processed. Avatar unblurs.
 *   2 — calibrating (0.9–2.0s): the readiness-score axes pulse on.
 *   3 — drafting (2.0–3.2s): plan skeleton lines stroke in.
 *   4 — finalizing (3.2–3.8s): copy fades out, reveal takes over.
 * Total floor: 3800ms so even fast API responses earn the payoff.
 */
const LOADING_COPY = [
  { label: 'Reading your answers', duration: 900 },
  { label: 'Calibrating your readiness score', duration: 1100 },
  { label: 'Drafting your four weeks', duration: 1200 },
  { label: 'Finalizing', duration: 600 },
] as const;

const MIN_LOADING_MS = LOADING_COPY.reduce((acc, s) => acc + s.duration, 0);

/** 5-axis readiness score, in reveal order. */
const READINESS_AXES: ReadinessAxis[] = [
  'pronunciation',
  'lexical_range',
  'listening_speed',
  'register',
  'cultural_fluency',
];

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

  // Advance loading stages on their individual durations, not a fixed
  // interval. Keeps the copy in sync with the visual beat below.
  useEffect(() => {
    if (stage !== 'loading') return;
    let cancelled = false;
    let idx = 0;
    const advance = () => {
      if (cancelled) return;
      if (idx >= LOADING_COPY.length - 1) return;
      idx += 1;
      setCopyIndex(idx);
      setTimeout(advance, LOADING_COPY[idx].duration);
    };
    const t = setTimeout(advance, LOADING_COPY[0].duration);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [stage]);

  // Fetch plan — once per mount. Skips when we already have one.
  useEffect(() => {
    if (existingPlan) return;
    const snapshot = answersRef.current;

    let cancelled = false;
    const minDelay = new Promise<void>((res) => setTimeout(res, MIN_LOADING_MS));

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
        <LoadingChoreography
          copyIndex={copyIndex}
          coach={coachBlock}
          segment={segment}
        />
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
            Your AI coach
          </p>
          <div className="mt-2 flex items-center gap-4">
            <CoachAvatar coach={coach.id} size={64} />
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-serif text-h1 text-ink">
                  Meet {coach.name}.
                </h2>
                <span className="rounded-full bg-ember/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ember-deep">
                  {coach.accent}
                </span>
              </div>
            </div>
          </div>
          <blockquote className="mt-4 border-l-2 border-ember pl-3 font-serif text-body-lg italic text-ink">
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

// ─────────────────────────────────────────────────────────────────────────────
// Loading choreography — the fancy multi-beat build-up before plan reveal.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 4-beat loading animation designed to FEEL like the plan is being built.
 *
 *   Beat 1 (0–0.9s):  Coach avatar materializes (blur → focus). Copy: "Reading your answers"
 *   Beat 2 (0.9–2.0s): 5 readiness-score axis bars fill in sequentially.
 *                      Copy: "Calibrating your readiness score"
 *   Beat 3 (2.0–3.2s): 4 week-skeleton cards line-stroke in. Copy: "Drafting your four weeks"
 *   Beat 4 (3.2–3.8s): Everything gently fades; copy: "Finalizing"
 *
 * All timing is driven by `copyIndex` coming from the parent, so we stay in
 * lockstep with the copy rotation. Respects `prefers-reduced-motion` — the
 * whole thing collapses to a static placeholder.
 */
function LoadingChoreography({
  copyIndex,
  coach,
  segment,
}: {
  copyIndex: number;
  coach: PlanCoachBlock | undefined;
  segment: Segment;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-1 flex-col items-center justify-start gap-7 py-6">
      {/* Beat 1: avatar materializes */}
      {coach && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, filter: 'blur(12px)' }}
          animate={{
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
          }}
          transition={{
            duration: reduce ? 0.3 : 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative"
        >
          <CoachAvatar coach={coach.id} size={88} />
        </motion.div>
      )}

      {/* Current-beat copy (animated swap) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={copyIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-2 text-center"
        >
          <p className="font-serif text-h2 text-ink text-balance">
            {LOADING_COPY[copyIndex].label}
            <span className="inline-block" aria-hidden>
              {!reduce && <TypingDots />}
            </span>
          </p>
          {coach && copyIndex === 0 && (
            <p className="text-body-sm text-ink-muted">
              Getting {coach.name} ready for you.
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Beat 2: readiness axes — appear while copyIndex >= 1 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{
          opacity: copyIndex >= 1 ? 1 : 0,
          y: copyIndex >= 1 ? 0 : 12,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex w-full max-w-[340px] flex-col gap-2.5"
        aria-hidden
      >
        {READINESS_AXES.map((axis, i) => (
          <AxisBar
            key={axis}
            label={AXIS_LABELS[axis]}
            active={copyIndex >= 1}
            delay={copyIndex >= 1 ? i * 0.18 : 0}
            reduce={reduce ?? false}
          />
        ))}
      </motion.div>

      {/* Beat 3: plan week skeleton — appears while copyIndex >= 2 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: copyIndex >= 2 ? 0.7 : 0 }}
        transition={{ duration: 0.4 }}
        className="flex w-full max-w-[340px] flex-col gap-2"
        aria-hidden
      >
        {[0, 1, 2, 3].map((i) => (
          <WeekSkeleton
            key={i}
            week={i + 1}
            active={copyIndex >= 2}
            delay={copyIndex >= 2 ? i * 0.12 : 0}
            reduce={reduce ?? false}
          />
        ))}
      </motion.div>
      {/* hidden — but referenced so `segment` stays in the closure */}
      <span className="sr-only">{segment}</span>
    </div>
  );
}

/** Single readiness-axis bar. Fill animates from 0 to a pseudo-random width. */
function AxisBar({
  label,
  active,
  delay,
  reduce,
}: {
  label: string;
  active: boolean;
  delay: number;
  reduce: boolean;
}) {
  // Deterministic pseudo-random fill derived from the label hash.
  const fill = useMemo(() => {
    let h = 0;
    for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) >>> 0;
    return 50 + (h % 40); // 50% to 90%
  }, [label]);

  return (
    <div className="flex items-center gap-3">
      <span className="w-[110px] shrink-0 text-overline font-semibold uppercase text-ink-muted text-right">
        {label}
      </span>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
        <motion.div
          className="h-full rounded-full bg-ember"
          initial={{ width: 0 }}
          animate={{ width: active ? `${fill}%` : 0 }}
          transition={
            reduce
              ? { duration: 0.3, delay }
              : { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }
          }
        />
      </div>
    </div>
  );
}

/** Week card skeleton — stroked line + 2 dashes simulating session bullets. */
function WeekSkeleton({
  week,
  active,
  delay,
  reduce,
}: {
  week: number;
  active: boolean;
  delay: number;
  reduce: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{
        opacity: active ? 1 : 0,
        x: active ? 0 : -12,
      }}
      transition={
        reduce
          ? { duration: 0.3, delay }
          : { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }
      }
      className="flex items-center gap-3 rounded-md border border-ink/10 bg-surface-muted/60 px-3 py-2.5"
    >
      <span className="text-overline font-semibold uppercase text-ember shrink-0">
        W{week}
      </span>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-1.5 w-[70%] rounded-full bg-ink/15" />
        <div className="h-1 w-[55%] rounded-full bg-ink/10" />
      </div>
    </motion.div>
  );
}

/** Three blinking dots after the current stage label, for "…" feel. */
function TypingDots() {
  return (
    <span className="ml-1 inline-flex items-end gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-1 w-1 rounded-full bg-ink"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.18,
            ease: 'easeInOut',
          }}
        />
      ))}
    </span>
  );
}
