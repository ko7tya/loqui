'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { QuestionShell } from '../QuestionShell';
import { Button } from '@/components/ui/button';
import { useFunnelStore } from '@/lib/state';
import { track } from '@/lib/analytics';
import { WORLD_MAP_PATHS, WORLD_MAP_VIEWBOX } from '@/content/world-map';
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

// 6 pin cities across the globe, positioned on the real Wikipedia world map
// (viewBox 950×620, Robinson-ish projection). Coordinates eyeballed against
// the actual continents so each pin lands where you'd expect it.
const PINS = [
  { name: 'Berlin', x: 510, y: 195 },
  { name: 'São Paulo', x: 340, y: 425 },
  { name: 'Jakarta', x: 765, y: 395 },
  { name: 'Mumbai', x: 675, y: 300 },
  { name: 'Mexico City', x: 210, y: 300 },
  { name: 'Istanbul', x: 545, y: 220 },
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
          viewBox={WORLD_MAP_VIEWBOX}
          className="h-auto w-full text-ink"
          role="img"
          aria-label="World map with learner activity pins"
        >
          <defs>
            {/* Dot pattern — every country path is filled with it, so the full
                world map reads as a dotted silhouette. 6×6 cell with a single
                centered dot at low opacity; identical across every country so
                borders vanish and the whole thing reads as continent shapes. */}
            <pattern
              id="spm-dot-grid"
              x="0"
              y="0"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="3" cy="3" r="0.9" fill="currentColor" opacity="0.42" />
            </pattern>

            <radialGradient id="spm-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--ember))" stopOpacity="0.55" />
              <stop offset="80%" stopColor="hsl(var(--ember))" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Continents — real Wikimedia Commons low-res world map, 340 country
              paths, all filled with the shared dot pattern so borders dissolve. */}
          <g
            fill="url(#spm-dot-grid)"
            stroke="none"
            dangerouslySetInnerHTML={{ __html: WORLD_MAP_PATHS }}
          />

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
