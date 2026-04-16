'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
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
          const complete = fill >= 1;
          return (
            // Outer wrapper has NO overflow-hidden so the checkmark badge can sit
            // cleanly on top of the bar without being clipped into half-circles.
            <div
              key={section.label}
              className="relative h-2 flex-1"
            >
              {/* Track — clips the fill, not the checkmark. */}
              <div className="absolute inset-0 overflow-hidden rounded-full bg-ink/10">
                <motion.div
                  className="h-full rounded-full bg-ember"
                  initial={false}
                  animate={{ width: `${fill * 100}%` }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 260, damping: 30 }
                  }
                />
              </div>
              {/* Checkmark floats above the track; never clipped. */}
              {complete && (
                <motion.span
                  className="absolute right-0 top-1/2 flex h-3.5 w-3.5 -translate-y-1/2 items-center justify-center rounded-full bg-surface-elevated text-ember shadow-[0_0_0_1px_hsl(var(--ember))_inset]"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.15,
                    type: 'spring',
                    stiffness: 400,
                    damping: 20,
                  }}
                  aria-hidden
                >
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </motion.span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
