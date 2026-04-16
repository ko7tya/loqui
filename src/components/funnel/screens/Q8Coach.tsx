'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { QuestionShell } from '../QuestionShell';
import { RadioGroupKeys } from '../RadioGroupKeys';
import { Button } from '@/components/ui/button';
import { Q8, SEGMENT_Q8_SUBCOPY } from '@/content/questions';
import { COACHES, COACHES_ORDER } from '@/content/coaches';
import { useFunnelStore } from '@/lib/state';
import { track } from '@/lib/analytics';
import type { CoachId } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface Q8Props {
  direction: 1 | -1;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Q8 (v2) — Pick your coach.
 *
 * 2×2 grid on sm+, stacked on xs. Each card shows the coach's name (serif),
 * accent chip, tagline, and a short vibe line. Four coaches each get a
 * subtle-but-distinct typographic/accent treatment so the grid feels alive
 * without inventing new colors:
 *
 *   Marcus  — sharper borders (thicker rule)
 *   Elena   — warmer fill (ember wash)
 *   Aiko    — playful ember rhythm-mark
 *   David   — serif underline under the name
 *
 * All four treatments are sourced from existing design-system tokens.
 *
 * Selection writes both `q8_coach` and the matching `q8_style` via
 * `setQ8Coach`, so the plan-template matrix continues to read from the
 * legacy style key unchanged.
 */
export function Q8Coach({ direction, onNext, onBack }: Q8Props) {
  const segment = useFunnelStore((s) => s.answers.segment ?? 'career');
  const answer = useFunnelStore((s) => s.answers.q8_coach);
  const setQ8Coach = useFunnelStore((s) => s.setQ8Coach);
  const reduce = useReducedMotion();

  const subCopy = SEGMENT_Q8_SUBCOPY[segment];

  useEffect(() => {
    track('question_viewed', { question_id: Q8.id, segment });
  }, [segment]);

  const pick = (id: CoachId) => {
    setQ8Coach(id);
    track('question_answered', { q: 'Q8', value: id, segment });
    track('coach_selected', { coach: id, segment });
  };

  return (
    <QuestionShell
      step={8}
      direction={direction}
      title={Q8.headline}
      subtitle={subCopy}
      onBack={onBack}
      cta={
        <Button className="w-full" disabled={!answer} onClick={onNext}>
          Build my plan <span aria-hidden>→</span>
        </Button>
      }
    >
      <p className="text-body-sm text-ink-subtle">{Q8.sub_copy}</p>
      <RadioGroupKeys
        label={Q8.headline}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {COACHES_ORDER.map((id, i) => {
          const coach = COACHES[id];
          const selected = answer === id;
          return (
            <motion.button
              key={coach.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${coach.name} — ${coach.accent}, ${coach.tagline}`}
              onClick={() => pick(coach.id)}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduce ? 0.18 : 0.35,
                ease: [0.16, 1, 0.3, 1],
                delay: reduce ? 0 : (i * 70) / 1000,
              }}
              whileTap={reduce ? undefined : { scale: 0.985 }}
              className={cn(
                'group relative flex w-full flex-col gap-2 rounded-md px-4 py-4 text-left',
                'focus-visible:outline-none focus-visible:shadow-focus',
                'transition-colors duration-150 ease-out-quart',
                'min-h-[148px]',
                // Variant treatment by coach — pulled from existing tokens.
                variantClass(coach.id, selected),
              )}
            >
              {/* Name row */}
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={cn(
                    'font-serif text-h2 text-ink',
                    coach.id === 'david' && 'underline decoration-ember/60 decoration-1 underline-offset-[6px]',
                  )}
                >
                  {coach.name}
                </span>
                <span className="rounded-full bg-ember/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ember-deep">
                  {coach.accent}
                </span>
              </div>

              {/* Tagline */}
              <p className="text-body-sm font-medium text-ink">
                {coach.tagline}
              </p>

              {/* Vibe */}
              <p className="text-body-sm text-ink-muted">{coach.vibe}</p>

              {/* Aiko's playful rhythm-mark */}
              {coach.id === 'aiko' && (
                <span
                  aria-hidden
                  className="absolute bottom-3 right-3 flex items-center gap-1"
                >
                  <span className="block h-1.5 w-1.5 rounded-full bg-ember" />
                  <span className="block h-1.5 w-1.5 rounded-full bg-ember/60" />
                  <span className="block h-1.5 w-1.5 rounded-full bg-ember/30" />
                </span>
              )}

              {/* Selected indicator */}
              {selected && (
                <motion.span
                  layoutId="q8-coach-selected"
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-ember"
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </motion.button>
          );
        })}
      </RadioGroupKeys>
    </QuestionShell>
  );
}

// --- Variant class helper ---------------------------------------------------

/**
 * Coach-specific card treatment. All classes use existing tokens
 * (surface, ember, ink) so no new color is invented.
 *
 *   Marcus — sharper border (2px rule on the outer edge)
 *   Elena  — ember wash as the idle background
 *   Aiko   — neutral surface, the rhythm-mark in the corner (rendered above)
 *   David  — serif underline on the name (rendered above)
 */
function variantClass(id: CoachId, selected: boolean): string {
  const base = 'border bg-surface-muted hover:bg-surface-elevated hover:shadow-sm';
  const selectedShared = 'border-2 border-ember bg-surface-elevated shadow-sm';

  if (selected) {
    // All coaches share the selected shell — the variant flavor lives in the
    // body content so selection remains visually unambiguous.
    return selectedShared;
  }

  switch (id) {
    case 'marcus':
      // Sharper, slightly heavier border to read as direct.
      return `${base} border-ink/25`;
    case 'elena':
      // Ember wash — warmer idle state.
      return `${base} border-ink/10 bg-ember-wash/60`;
    case 'aiko':
      // Neutral surface, the corner mark carries the personality.
      return `${base} border-ink/10`;
    case 'david':
      // Neutral surface; the serif underline on the name carries it.
      return `${base} border-ink/10`;
  }
}
