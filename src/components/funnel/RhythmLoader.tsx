'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * The rhythm mark — three ember dots pulsing in sequence. Design-system.md §4.9.
 *
 * Three sizes: `sm` (6px, button-sized), `md` (8px, inline), `lg` (12px, hero).
 * When `prefers-reduced-motion` is set, we render static ember circles.
 */
export interface RhythmLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const DOT_SIZE = { sm: 6, md: 8, lg: 12 } as const;
const GAP = { sm: 8, md: 12, lg: 20 } as const;

export function RhythmLoader({
  size = 'md',
  className,
  label = 'Loading',
}: RhythmLoaderProps) {
  const reduce = useReducedMotion();
  const diameter = DOT_SIZE[size];

  return (
    <div
      className={cn('inline-flex items-center', className)}
      style={{ gap: GAP[size] }}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block rounded-full bg-ember"
          style={{ width: diameter, height: diameter }}
          animate={
            reduce
              ? { opacity: 0.8 }
              : { scale: [1, 1.25, 1], opacity: [0.4, 1, 0.4] }
          }
          transition={
            reduce
              ? undefined
              : {
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.15,
                }
          }
        />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}
