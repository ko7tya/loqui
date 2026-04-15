'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { QuestionShell } from '../QuestionShell';
import { Button } from '@/components/ui/button';
import { useFunnelStore } from '@/lib/state';
import { track } from '@/lib/analytics';
import type { Segment } from '@/lib/types';

export interface SocialProofMapProps {
  direction: 1 | -1;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Interstitial B — Social Proof Map (after Q5).
 *
 * Segment-aware counts per the project brief (not the numbers in question-spec.md,
 * which were sketches — the brief locked these four).
 */
const COUNTS: Record<Segment, number> = {
  career: 47823,
  test_prep: 23914,
  immigration: 18447,
  travel_social: 31206,
};

const NOUNS: Record<Segment, string> = {
  career: 'professionals',
  test_prep: 'test-takers',
  immigration: 'newcomers',
  travel_social: 'travelers',
};

// 6 pin cities across the globe, roughly positioned on a 1000×500 grid.
// Coordinates are rough silhouette-map positions.
const PINS = [
  { name: 'Berlin', x: 530, y: 170 },
  { name: 'São Paulo', x: 330, y: 350 },
  { name: 'Jakarta', x: 800, y: 310 },
  { name: 'Mumbai', x: 700, y: 240 },
  { name: 'Mexico City', x: 205, y: 255 },
  { name: 'Istanbul', x: 580, y: 195 },
];

const fmt = (n: number) => n.toLocaleString('en-US');

export function SocialProofMap({
  direction,
  onNext,
  onBack,
}: SocialProofMapProps) {
  const reduce = useReducedMotion();
  const segment = useFunnelStore((s) => s.answers.segment ?? 'career');
  const count = COUNTS[segment];
  const noun = NOUNS[segment];

  useEffect(() => {
    track('interstitial_viewed', {
      interstitial_id: 'social_proof_map',
      segment,
    });
  }, [segment]);

  return (
    <QuestionShell
      step={5}
      direction={direction}
      hideProgress
      section="GOOD COMPANY"
      title={
        <>
          <span className="tabular-nums">{fmt(count)}</span> {noun} are
          building English with <em className="italic">Loqui</em>.
        </>
      }
      subtitle="You're in good company."
      onBack={onBack}
      cta={
        <Button className="w-full" onClick={onNext}>
          Keep going <span aria-hidden>→</span>
        </Button>
      }
    >
      <div className="rounded-lg border border-ink/10 bg-surface-elevated px-4 py-6 shadow-sm">
        <svg
          viewBox="0 0 1000 500"
          className="h-auto w-full text-ink"
          role="img"
          aria-label="World map with learner pins"
        >
          {/* Dotted-globe silhouette — a scatter of tiny dots inside an ellipse. */}
          <defs>
            <radialGradient id="spm-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--ember))" stopOpacity="0.55" />
              <stop offset="80%" stopColor="hsl(var(--ember))" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Faint dotted grid acting as a globe */}
          <g fill="currentColor" fillOpacity="0.12">
            {Array.from({ length: 40 }).map((_, row) =>
              Array.from({ length: 80 }).map((_, col) => {
                const cx = 20 + col * 12;
                const cy = 30 + row * 11;
                const nx = (cx - 500) / 480;
                const ny = (cy - 250) / 240;
                const inside = nx * nx + ny * ny < 1;
                if (!inside) return null;
                return (
                  <circle
                    key={`${row}-${col}`}
                    cx={cx}
                    cy={cy}
                    r={1.1}
                  />
                );
              }),
            )}
          </g>

          {/* Pins */}
          {PINS.map((pin, i) => (
            <g key={pin.name}>
              <motion.circle
                cx={pin.x}
                cy={pin.y}
                r={18}
                fill="url(#spm-glow)"
                initial={{ opacity: 0 }}
                animate={
                  reduce
                    ? { opacity: 0.8 }
                    : { opacity: [0.4, 0.9, 0.4] }
                }
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        duration: 2.4,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: 'easeInOut',
                      }
                }
              />
              <motion.circle
                cx={pin.x}
                cy={pin.y}
                r={4}
                className="fill-ember"
                initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: reduce ? 0 : 0.1 + i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            </g>
          ))}
        </svg>
        <p className="mt-3 text-center text-body-sm text-ink-subtle">
          Updated this morning. Rolling out by segment, not by region.
        </p>
      </div>
    </QuestionShell>
  );
}
