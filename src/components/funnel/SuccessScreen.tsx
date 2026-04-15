'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Wordmark } from './Wordmark';
import { useFunnelStore } from '@/lib/state';
import { SEGMENT_DEFS } from '@/content/segments';
import type { Segment } from '@/lib/types';

export interface SuccessScreenProps {
  onRestart?: () => void;
}

// Segment-aware headlines from question-spec.md §"Success Screen Copy"
const HEADLINES: Record<Segment, { body: string; list: string }> = {
  career: {
    body: "Your plan's in your inbox. First session lands Monday at 7am local time.",
    list: "You're #{pos} on the list — we're rolling out by segment so feedback stays sharp.",
  },
  test_prep: {
    body: "Your plan's in your inbox. Your first drill is waiting.",
    list: "You're #{pos} on the list. Test-prep access opens in cohorts — yours is soon.",
  },
  immigration: {
    body: "Your plan's in your inbox. Tomorrow's first step is a five-minute scenario.",
    list: "You're #{pos} on the list — we prioritize newcomers with nearest deadlines.",
  },
  travel_social: {
    body: "Your plan's in your inbox. Your first scenario is a dinner — and you'll feel different by the end of it.",
    list: "You're #{pos} on the list. We're opening access in waves.",
  },
};

export function SuccessScreen({ onRestart }: SuccessScreenProps) {
  const reduce = useReducedMotion();
  const answers = useFunnelStore((s) => s.answers);
  const waitlistBase = useFunnelStore((s) => s.waitlistBase);

  const segment = answers.segment ?? 'career';
  const segmentDef = SEGMENT_DEFS[segment];
  const plan = answers.generated_plan;
  const position = answers.waitlist_position ?? waitlistBase;
  const copy = HEADLINES[segment];

  useEffect(() => {
    // Fire on mount — parent already fired submit_succeeded.
  }, []);

  // Confetti-ish "rhythm-mark particles" positions
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        x: (i % 4) * 24 - 36 + (i > 3 ? 10 : 0),
        y: -8 - Math.floor(i / 4) * 20,
        delay: (i * 80) / 1000,
      })),
    [],
  );

  const posFormatted = position.toLocaleString('en-US');

  return (
    <section className="relative mx-auto flex min-h-[100svh] w-full max-w-[520px] flex-col items-center gap-8 px-6 pb-16 pt-16">
      {/* Wordmark centered */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Wordmark size={48} />
      </motion.div>

      {/* Confetti-ish rhythm-mark particles */}
      <div
        aria-hidden
        className="pointer-events-none relative mx-auto h-16 w-32 overflow-visible"
      >
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute left-1/2 top-8 block h-1.5 w-1.5 rounded-full bg-ember"
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, x: 0, y: 0, scale: 0.4 }
            }
            animate={
              reduce
                ? { opacity: [0, 1, 0.8] }
                : {
                    opacity: [0, 1, 0.9, 0.4],
                    x: p.x,
                    y: [0, p.y, p.y + 20, p.y + 40],
                    scale: [0.4, 1, 1, 0.8],
                  }
            }
            transition={{
              duration: reduce ? 0.4 : 1.6,
              delay: p.delay,
              ease: [0.25, 1, 0.35, 1],
            }}
          />
        ))}
      </div>

      {/* Headline */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col items-center gap-3 text-center"
      >
        <h1 className="font-serif text-display text-ink">
          You&apos;re <em className="italic">in</em>.
        </h1>
        <p className="text-body-lg text-ink-muted text-balance">{copy.body}</p>
      </motion.div>

      {/* Plan summary card */}
      {plan && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="w-full rounded-lg border border-ink/10 bg-surface-elevated px-5 py-5 shadow-md"
        >
          <p className="text-overline font-semibold uppercase text-ember">
            Your plan
          </p>
          <p className="mt-1 font-serif text-h2 text-ink">{plan.plan_name}</p>
          <p className="mt-1 text-body-sm text-ink-muted italic font-serif">
            {plan.the_moment}
          </p>
          <ul className="mt-4 space-y-1.5 border-t border-ink/10 pt-4">
            {plan.weeks.map((w) => (
              <li
                key={w.week}
                className="flex items-baseline gap-3 text-body-sm text-ink"
              >
                <span className="text-overline font-semibold text-ink-subtle">
                  W{w.week}
                </span>
                <span className="flex-1">{w.title}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Waitlist position */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="flex flex-col items-center gap-2 text-center"
      >
        <p className="font-serif text-h1 text-ink tabular-nums">
          #{posFormatted}
        </p>
        <p className="text-body-sm text-ink-muted text-balance">
          {copy.list.replace('{pos}', posFormatted)}
        </p>
      </motion.div>

      {/* Rhythm-mark closing motif */}
      <div
        aria-hidden
        className="mt-2 flex items-center gap-3"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-ember"
          />
        ))}
      </div>

      <p className="mt-2 font-serif text-body-sm italic text-ink-subtle">
        Find your rhythm in English.
      </p>

      {/* Footer actions */}
      <div className="mt-2 flex flex-col items-center gap-2">
        <Button asChild variant="link" size="sm">
          <Link href="/">Back to Loqui</Link>
        </Button>
        {onRestart && (
          <button
            type="button"
            onClick={onRestart}
            className="text-body-sm text-ink-subtle underline-offset-4 hover:text-ink hover:underline"
          >
            Plan another moment
          </button>
        )}
      </div>

      {/* Segment badge (analytics hint, invisible visually — debug-only) */}
      <span className="sr-only">
        Segment: {segmentDef.label}. Plan source: {answers.plan_source}.
      </span>
    </section>
  );
}
