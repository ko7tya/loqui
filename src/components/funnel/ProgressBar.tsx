'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * 3-section chunked progress bar: Profile (Q1-Q4) → Moment (Q5-Q8) → Plan (Q9-Q10).
 *
 * Each section fills based on `currentStep`, springs into place, and earns
 * a checkmark when fully filled. `aria-live="polite"` announces the step.
 *
 * See design-system.md §4.1.
 */

export interface ProgressBarProps {
  currentStep: number;
  className?: string;
}

const SECTIONS = [
  { label: 'Profile', start: 1, end: 4 },
  { label: 'Moment', start: 5, end: 8 },
  { label: 'Plan', start: 9, end: 10 },
] as const;

function sectionFill(step: number, start: number, end: number): number {
  if (step < start) return 0;
  if (step >= end) return 1;
  // `step` is 1-indexed; once the user is *past* question `start`, that slot
  // counts as a point of progress.
  return (step - start + 1) / (end - start + 1);
}

export function ProgressBar({ currentStep, className }: ProgressBarProps) {
  const reduce = useReducedMotion();
  const clamped = Math.max(0, Math.min(10, currentStep));
  const activeSection =
    SECTIONS.find((s) => clamped >= s.start && clamped <= s.end) ?? null;

  return (
    <div
      className={cn('flex flex-col gap-2', className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={10}
      aria-label={`Step ${clamped} of 10`}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-overline font-semibold uppercase text-ember">
          {activeSection?.label ?? 'Start'}
        </span>
        <span
          className="text-overline font-semibold uppercase text-ink-muted"
          aria-live="polite"
        >
          {clamped} / 10
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {SECTIONS.map((section) => {
          const fill = sectionFill(clamped, section.start, section.end);
          return (
            <div
              key={section.label}
              className="relative h-2 flex-1 overflow-hidden rounded-full bg-ink/10"
            >
              <motion.div
                className="h-full rounded-full bg-ember"
                initial={false}
                animate={{ width: `${fill * 100}%` }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        // Tween with ease-out — smooth, monotonic, no
                        // overshoot. Spring was causing a tiny settle
                        // wobble at the end of the fill that read as
                        // "jittery" on mid-range phones.
                        type: 'tween',
                        duration: 0.6,
                        ease: [0.16, 1, 0.3, 1],
                      }
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
