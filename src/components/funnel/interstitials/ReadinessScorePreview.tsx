'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { QuestionShell } from '../QuestionShell';
import { Button } from '@/components/ui/button';
import { track } from '@/lib/analytics';
import type { ReadinessAxis } from '@/lib/types';

export interface ReadinessScorePreviewProps {
  direction: 1 | -1;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Interstitial A — Readiness Score Preview (after Q2).
 *
 * Pentagon radar chart with 1 axis lit in ember, 4 dim in ink-plum with
 * lock glyphs. See question-spec.md §Interstitial A.
 */

const AXES: { axis: ReadinessAxis; label: string; lit: boolean }[] = [
  { axis: 'lexical_range', label: 'Lexical range', lit: true },
  { axis: 'pronunciation', label: 'Pronunciation', lit: false },
  { axis: 'listening_speed', label: 'Listening speed', lit: false },
  { axis: 'register', label: 'Register', lit: false },
  { axis: 'cultural_fluency', label: 'Cultural fluency', lit: false },
];

// Build a regular pentagon inside the unit circle.
// Returns [x, y] in [-1, 1] coordinate space.
const PENTAGON_POINTS = AXES.map((_, i) => {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / AXES.length;
  return [Math.cos(angle), Math.sin(angle)] as const;
});

export function ReadinessScorePreview({
  direction,
  onNext,
  onBack,
}: ReadinessScorePreviewProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    track('interstitial_viewed', { interstitial_id: 'readiness_score' });
  }, []);

  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 40;

  // Build the outer pentagon path and the single-axis "lit" polygon
  const outerPath =
    PENTAGON_POINTS.map(
      ([px, py], i) =>
        `${i === 0 ? 'M' : 'L'} ${(cx + px * r).toFixed(2)} ${(cy + py * r).toFixed(2)}`,
    ).join(' ') + ' Z';

  // Lit polygon: draw only the first axis filled at 75%; the rest collapse to center.
  const litPath =
    PENTAGON_POINTS.map(([px, py], i) => {
      const factor = AXES[i].lit ? 0.78 : 0.05;
      return `${i === 0 ? 'M' : 'L'} ${(cx + px * r * factor).toFixed(2)} ${(cy + py * r * factor).toFixed(2)}`;
    }).join(' ') + ' Z';

  return (
    <QuestionShell
      step={2}
      direction={direction}
      hideProgress
      section="READINESS FORMING"
      title={
        <>
          Your Conversational <em className="italic">Readiness</em> Score is
          forming.
        </>
      }
      subtitle="Five axes. Keep going to fill it in."
      onBack={onBack}
      cta={
        <Button className="w-full" onClick={onNext}>
          Keep going <span aria-hidden>→</span>
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-6 py-4">
        <motion.svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          role="img"
          aria-label="Readiness radar chart, one axis filled"
        >
          {/* Rings */}
          {[0.25, 0.5, 0.75, 1].map((factor) => (
            <polygon
              key={factor}
              points={PENTAGON_POINTS.map(
                ([px, py]) =>
                  `${(cx + px * r * factor).toFixed(2)},${(cy + py * r * factor).toFixed(2)}`,
              ).join(' ')}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.08}
              className="text-ink"
            />
          ))}

          {/* Axis lines */}
          {PENTAGON_POINTS.map(([px, py], i) => (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + px * r}
              y2={cy + py * r}
              stroke="currentColor"
              strokeOpacity={0.12}
              className="text-ink"
            />
          ))}

          {/* Outer pentagon */}
          <path
            d={outerPath}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.2}
            strokeWidth={1.5}
            className="text-ink"
          />

          {/* Lit polygon (ember) */}
          <motion.path
            d={litPath}
            initial={reduce ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
            animate={{
              opacity: 1,
              ...(reduce ? {} : { pathLength: 1 }),
            }}
            transition={{ duration: reduce ? 0.2 : 1, delay: 0.3 }}
            fill="hsl(var(--ember) / 0.2)"
            stroke="hsl(var(--ember))"
            strokeWidth={2}
          />

          {/* Axis endpoints */}
          {PENTAGON_POINTS.map(([px, py], i) => {
            const ax = cx + px * r;
            const ay = cy + py * r;
            const lit = AXES[i].lit;
            return (
              <circle
                key={i}
                cx={ax}
                cy={ay}
                r={lit ? 5 : 4}
                className={lit ? 'fill-ember' : 'fill-ink/40'}
              />
            );
          })}
        </motion.svg>

        {/* Axis legend */}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
          {AXES.map((a) => (
            <li
              key={a.axis}
              className="flex items-center gap-2 text-body-sm text-ink"
            >
              {a.lit ? (
                <span
                  className="h-2 w-2 rounded-full bg-ember"
                  aria-hidden
                />
              ) : (
                <Lock
                  className="h-3 w-3 text-ink-subtle"
                  aria-hidden
                  strokeWidth={2}
                />
              )}
              <span className={a.lit ? 'font-medium' : 'text-ink-muted'}>
                {a.label}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-2 text-center font-serif italic text-body text-ink-muted text-balance">
          Each question sharpens one more axis. You&apos;re 1 of 5.
        </p>
      </div>
    </QuestionShell>
  );
}
