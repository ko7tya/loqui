'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { QuestionShell } from '../QuestionShell';
import { RadioGroupKeys } from '../RadioGroupKeys';
import { CoachAvatar } from '../CoachAvatar';
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
 * Q8 — Meet your AI coach.
 *
 * The AI-avatar product pitch lives here. Each card shows:
 *   - A CoachAvatar (SVG with per-coach motif + live-AI pulse dot)
 *   - The coach's name, accent chip, tagline, and vibe
 *
 * Stacks vertically on mobile (one big card at a time so the avatars
 * breathe and tapping is obvious); 2-up on sm+. Selected state is
 * explicit: thick ember ring + ember wash + check badge. No more
 * "did my tap register?" ambiguity.
 *
 * Selection writes both `q8_coach` and the matching `q8_style`, so the
 * plan-template matrix keeps working on the legacy style key.
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
      subtitle={Q8.sub_copy}
      onBack={onBack}
      cta={
        <Button className="w-full" disabled={!answer} onClick={onNext}>
          Build my plan <span aria-hidden>→</span>
        </Button>
      }
    >
      {/* Segment-aware hint above the grid */}
      <p className="text-body-sm text-ink-muted">{subCopy}</p>

      <RadioGroupKeys
        label="Meet your AI coach"
        className="grid grid-cols-1 gap-3"
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
                'group relative flex w-full items-start gap-4 rounded-lg border-2 px-4 py-4 text-left',
                'focus-visible:outline-none focus-visible:shadow-focus',
                'transition-colors duration-150 ease-out-quart',
                selected
                  ? 'border-ember bg-ember-wash/60 shadow-sm'
                  : 'border-ink/10 bg-surface-muted hover:bg-surface-elevated hover:border-ink/20 hover:shadow-sm',
              )}
            >
              {/* Avatar — carries the "AI" signal via the live dot */}
              <CoachAvatar coach={coach.id} size={56} />

              <div className="flex flex-1 flex-col gap-1.5 pt-0.5">
                {/* Name + accent chip */}
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-serif text-h2 text-ink">
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
              </div>

              {/* Selected check — a concrete, immediate visual. */}
              {selected && (
                <motion.span
                  initial={reduce ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 460,
                    damping: 22,
                  }}
                  aria-hidden
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-ember text-surface-elevated shadow-sm"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </RadioGroupKeys>

      {/* Reassurance row — quietly explains why AI coaches matter. */}
      <div className="mt-2 grid grid-cols-3 gap-3 rounded-md border border-ink/10 bg-surface-muted/60 px-3 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-overline font-semibold uppercase text-ember">
            Adapt
          </span>
          <span className="text-body-sm text-ink-muted">
            Tunes to your voice.
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-overline font-semibold uppercase text-ember">
            Remember
          </span>
          <span className="text-body-sm text-ink-muted">
            Picks up where you left off.
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-overline font-semibold uppercase text-ember">
            Available
          </span>
          <span className="text-body-sm text-ink-muted">
            Whenever you are.
          </span>
        </div>
      </div>
    </QuestionShell>
  );
}
