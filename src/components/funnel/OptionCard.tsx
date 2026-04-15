'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { forwardRef, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Option card — shared component for every single-choice / multi-choice
 * question. Renders a `<button>` with `role="radio"` (or `"checkbox"`) so
 * keyboard + screen readers behave naturally.
 *
 * Design reference: design-system.md §4.3.
 * States: default → hover → focus → active → selected → disabled.
 */

export interface OptionCardProps {
  selected: boolean;
  onSelect: () => void;
  /** `radio` for single-choice, `checkbox` for multi. */
  role?: 'radio' | 'checkbox';
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  /** Enables arrow-key navigation between cards. */
  onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
  className?: string;
  chip?: ReactNode;
  disabled?: boolean;
  /** Stagger delay (ms) for enter animation. */
  delay?: number;
}

export const OptionCard = forwardRef<HTMLButtonElement, OptionCardProps>(
  function OptionCard(
    {
      selected,
      onSelect,
      role = 'radio',
      title,
      description,
      trailing,
      onKeyDown,
      className,
      chip,
      disabled,
      delay = 0,
    },
    ref,
  ) {
    const reduce = useReducedMotion();

    return (
      <motion.button
        ref={ref}
        type="button"
        role={role}
        aria-checked={selected}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={() => !disabled && onSelect()}
        onKeyDown={onKeyDown}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{
          duration: reduce ? 0.18 : 0.32,
          ease: [0.25, 1, 0.35, 1],
          delay: reduce ? 0 : delay / 1000,
        }}
        whileTap={reduce || disabled ? undefined : { scale: 0.98 }}
        className={cn(
          'group relative w-full rounded-md border px-4 py-4 text-left',
          'bg-surface-muted text-ink',
          'transition-colors duration-150 ease-out-quart',
          'focus-visible:outline-none focus-visible:shadow-focus',
          'min-h-16',
          selected
            ? 'border-ember border-2 bg-surface-elevated shadow-sm'
            : 'border-ink/10 hover:bg-surface-elevated hover:shadow-sm',
          disabled && 'opacity-40 pointer-events-none',
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className={cn(
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
              selected ? 'border-ember bg-surface-elevated' : 'border-ink/30',
              role === 'checkbox' && 'rounded-sm',
            )}
          >
            {selected && (
              <motion.span
                initial={reduce ? { scale: 1 } : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 0.25,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                className={cn(
                  'block bg-ember',
                  role === 'checkbox' ? 'h-2.5 w-2.5 rounded-[2px]' : 'h-2.5 w-2.5 rounded-full',
                )}
              />
            )}
          </span>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-body-lg font-medium text-ink">{title}</span>
              {chip && (
                <span className="rounded-full bg-ember/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ember-deep">
                  {chip}
                </span>
              )}
            </div>
            {description && (
              <span className="text-body-sm text-ink-muted">{description}</span>
            )}
          </div>
          {trailing && <div className="ml-2">{trailing}</div>}
        </div>
      </motion.button>
    );
  },
);
