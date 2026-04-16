'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';
import { ProgressBar } from './ProgressBar';
import { cn } from '@/lib/utils';

/**
 * Question shell — the chrome every Q1-Q10 screen sits inside.
 *
 * Handles:
 *   - sticky header with back + progress
 *   - per-step slide/fade transition (direction-aware); fade-only when
 *     `prefers-reduced-motion`
 *   - sticky CTA footer with safe-area padding
 *   - optional section overline above the headline
 *
 * Content slot = `children`. CTA slot = `cta` prop. Callers stay stateless;
 * the shell owns presentation, not logic.
 */

export interface QuestionShellProps {
  /** 1-indexed step. Drives ProgressBar fill. */
  step: number;
  /** 1 = forward, -1 = back. Drives the slide direction. */
  direction?: 1 | -1;
  /** Optional overline above the headline — e.g. "YOUR CADENCE". */
  section?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  onBack?: () => void;
  cta?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Suppress default ProgressBar — used by interstitials + plan reveal. */
  hideProgress?: boolean;
  /** Suppress the title heading — used when screen owns its own hero. */
  hideTitle?: boolean;
}

const EASE_OUT_EXPO: number[] = [0.16, 1, 0.3, 1];

// Slide variants: translate + fade only. Dropped `scale` — layering scale on
// both enter and exit created a visible wobble on the final exit frame.
// Range kept short (18px) so the slide reads as a cut, not a drawer.
// Timing tuned 30% slower than the original snap so the transition reads as
// deliberate rather than flicky; entry still lags exit so the incoming
// screen dominates attention.
const slideVariants: Variants = {
  enter: (dir: number) => ({
    x: dir * 18,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.36, ease: EASE_OUT_EXPO },
  },
  exit: (dir: number) => ({
    x: dir * -18,
    opacity: 0,
    transition: { duration: 0.21, ease: EASE_OUT_EXPO },
  }),
};

const reducedVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

export function QuestionShell({
  step,
  direction = 1,
  section,
  title,
  subtitle,
  onBack,
  cta,
  children,
  className,
  hideProgress = false,
  hideTitle = false,
}: QuestionShellProps) {
  const reduceMotion = useReducedMotion();
  const variants = reduceMotion ? reducedVariants : slideVariants;

  return (
    <section
      className={cn(
        // No min-height here — the parent funnel container owns viewport
        // height so both the exiting and entering shell stay the same size
        // during AnimatePresence swap. This is what fixes the transition jump.
        'relative mx-auto flex w-full max-w-[480px] flex-col px-5 pb-[calc(96px+env(safe-area-inset-bottom))] pt-4 sm:max-w-[520px] sm:px-6',
        className,
      )}
    >
      {/* Sticky header */}
      <header className="sticky top-0 z-20 -mx-5 bg-surface/85 px-5 pb-3 pt-2 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <div className="flex h-8 items-center justify-between">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="rounded-md px-2 py-1 text-body-sm font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:shadow-focus"
              aria-label="Back to previous question"
            >
              <span aria-hidden>←</span> Back
            </button>
          ) : (
            <span aria-hidden className="h-6 w-6" />
          )}
        </div>
        {!hideProgress && <ProgressBar currentStep={step} />}
      </header>

      {/* Main content */}
      <motion.div
        key={step}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        className="flex flex-1 flex-col gap-6 pt-6"
      >
        {!hideTitle && (
          <div className="flex flex-col gap-2">
            {section && (
              <span className="text-overline font-semibold uppercase text-ember">
                {section}
              </span>
            )}
            <h1 className="font-serif text-h1 text-ink text-balance">
              {title}
            </h1>
            {subtitle && (
              <p className="text-body-lg text-ink-muted text-balance">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="flex flex-1 flex-col gap-5">{children}</div>
      </motion.div>

      {/* Sticky CTA footer */}
      {cta && (
        <footer className="sticky bottom-0 z-20 -mx-5 bg-gradient-to-t from-surface via-surface/95 to-transparent px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4 sm:-mx-6 sm:px-6">
          {cta}
        </footer>
      )}
    </section>
  );
}
