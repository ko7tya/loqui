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

// Continent silhouettes as polygon point strings — rough but recognizable at
// 1000×500. Each polygon gets filled with a dot pattern (see <defs>) so the
// whole map reads as an "earth skeleton" made of dots.
const CONTINENTS = [
  // North America (including Greenland + Central America)
  '90,95 160,80 240,85 290,110 310,175 290,220 255,255 225,260 205,285 185,300 150,285 130,240 105,210 85,170 78,130',
  // South America
  '270,280 320,285 345,340 340,395 310,430 280,435 260,400 255,350 260,310',
  // Europe
  '450,130 510,120 560,130 580,155 590,195 555,215 505,220 470,210 450,175',
  // Africa
  '495,220 560,215 605,250 600,320 580,370 540,400 510,400 485,370 475,320 480,260',
  // Middle East + South Asia
  '580,185 640,180 700,205 720,250 700,285 660,280 625,255 595,225',
  // Asia (large landmass)
  '590,105 680,95 780,105 860,130 870,180 835,220 770,240 720,225 670,215 625,195 600,160',
  // South-East Asia / Indonesia
  '755,270 810,275 840,295 810,315 770,310 755,290',
  // Australia
  '770,340 830,335 870,345 880,380 860,400 810,405 775,395',
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
          aria-label="Earth skeleton made of dots, with learner activity pins"
        >
          <defs>
            {/* Dot pattern — every continent polygon is filled with it, so the
                world map reads as a skeleton of dots. 9×9 cell, single centered
                dot, reuses the ink color at low opacity. */}
            <pattern
              id="spm-dot-grid"
              x="0"
              y="0"
              width="9"
              height="9"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="4.5" cy="4.5" r="1.1" fill="currentColor" opacity="0.38" />
            </pattern>

            <radialGradient id="spm-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--ember))" stopOpacity="0.55" />
              <stop offset="80%" stopColor="hsl(var(--ember))" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Continents */}
          <g>
            {CONTINENTS.map((points, i) => (
              <polygon
                key={i}
                points={points}
                fill="url(#spm-dot-grid)"
              />
            ))}
          </g>

          {/* Pins with radar-ping ripple + core blink */}
          {PINS.map((pin, i) => (
            <g key={pin.name}>
              {/* Ambient glow */}
              <motion.circle
                cx={pin.x}
                cy={pin.y}
                r={22}
                fill="url(#spm-glow)"
                initial={{ opacity: 0 }}
                animate={
                  reduce
                    ? { opacity: 0.7 }
                    : { opacity: [0.25, 0.7, 0.25] }
                }
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.28,
                        ease: 'easeInOut',
                      }
                }
              />
              {/* Radar ripple — expands outward, fades */}
              {!reduce && (
                <motion.circle
                  cx={pin.x}
                  cy={pin.y}
                  stroke="hsl(var(--ember))"
                  strokeWidth={1.5}
                  fill="none"
                  initial={{ r: 4, opacity: 0.8 }}
                  animate={{ r: [4, 26], opacity: [0.8, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.28,
                    ease: 'easeOut',
                  }}
                />
              )}
              {/* Core dot — blinks in scale with the glow */}
              <motion.circle
                cx={pin.x}
                cy={pin.y}
                className="fill-ember"
                initial={{ r: reduce ? 4 : 3.5, opacity: reduce ? 1 : 0 }}
                animate={
                  reduce
                    ? { r: 4, opacity: 1 }
                    : { r: [3.5, 5, 3.5], opacity: 1 }
                }
                transition={
                  reduce
                    ? { duration: 0.4, delay: 0.1 + i * 0.05 }
                    : {
                        r: {
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.28,
                          ease: 'easeInOut',
                        },
                        opacity: {
                          duration: 0.35,
                          delay: 0.1 + i * 0.06,
                          ease: [0.16, 1, 0.3, 1],
                        },
                      }
                }
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
