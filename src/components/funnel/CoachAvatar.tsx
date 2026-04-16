import { cn } from '@/lib/utils';
import type { CoachId } from '@/lib/types';

/**
 * Coach avatar — circular SVG representation of each AI coach.
 *
 * Brand-coherent abstract marks (not stock portraits, not cheesy
 * AI-robot iconography). Each coach gets a distinct motif tied to
 * their personality:
 *
 *   Marcus — cropped serif initial over sharp diagonal bars (direct, fast)
 *   Helen  — soft serif initial cradled by an arced wave (warm, flowing)
 *   Aiko   — bold initial with rhythm-mark orbit (playful, scene-based)
 *   David  — centered serif initial over structured grid (methodical)
 *
 * A small ember "live" dot at top-right signals this is an AI coach,
 * pulsing subtly when `live` prop is true. Sizing is a single prop so
 * the same component works at 40, 56, 72, and 96 (Q8 cards → Q9 intro).
 */

type AvatarMark = {
  initial: 'M' | 'E' | 'A' | 'D';
  bgStart: string; // hsl() css string
  bgEnd: string;
  inkColor: string; // hsl() css
  accent: string; // hsl() css
};

const MARKS: Record<CoachId, AvatarMark> = {
  marcus: {
    initial: 'M',
    bgStart: 'hsl(270 17% 18%)',
    bgEnd: 'hsl(270 17% 10%)',
    inkColor: 'hsl(36 48% 93%)',
    accent: 'hsl(19 65% 54%)',
  },
  helen: {
    initial: 'E',
    bgStart: 'hsl(22 65% 87%)',
    bgEnd: 'hsl(19 55% 75%)',
    inkColor: 'hsl(270 17% 14%)',
    accent: 'hsl(19 67% 41%)',
  },
  aiko: {
    initial: 'A',
    bgStart: 'hsl(36 48% 93%)',
    bgEnd: 'hsl(22 65% 87%)',
    inkColor: 'hsl(270 17% 14%)',
    accent: 'hsl(19 65% 54%)',
  },
  david: {
    initial: 'D',
    bgStart: 'hsl(36 40% 88%)',
    bgEnd: 'hsl(36 30% 78%)',
    inkColor: 'hsl(270 17% 14%)',
    accent: 'hsl(270 17% 14%)',
  },
};

export interface CoachAvatarProps {
  coach: CoachId;
  size?: number;
  className?: string;
  /** Show a subtle pulsing ember dot — signals "AI, live". */
  live?: boolean;
}

export function CoachAvatar({
  coach,
  size = 56,
  className,
  live = true,
}: CoachAvatarProps) {
  const mark = MARKS[coach];
  const id = `coach-avatar-${coach}`;

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="block"
      >
        <defs>
          <radialGradient id={`${id}-bg`} cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor={mark.bgStart} />
            <stop offset="100%" stopColor={mark.bgEnd} />
          </radialGradient>
          <clipPath id={`${id}-clip`}>
            <circle cx="50" cy="50" r="50" />
          </clipPath>
        </defs>

        {/* Circular background */}
        <circle cx="50" cy="50" r="50" fill={`url(#${id}-bg)`} />

        {/* Per-coach motif, clipped to the circle */}
        <g clipPath={`url(#${id}-clip)`}>
          {coach === 'marcus' && <MarcusMotif mark={mark} />}
          {coach === 'helen' && <HelenMotif mark={mark} />}
          {coach === 'aiko' && <AikoMotif mark={mark} />}
          {coach === 'david' && <DavidMotif mark={mark} />}
        </g>

        {/* Thin ring for definition */}
        <circle
          cx="50"
          cy="50"
          r="49.5"
          fill="none"
          stroke={mark.inkColor}
          strokeOpacity={0.1}
          strokeWidth={1}
        />
      </svg>

      {/* AI live indicator — tiny ember dot, pulses */}
      {live && (
        <span
          className="absolute right-0 top-0 flex h-3 w-3 items-center justify-center"
          aria-label="AI coach, live"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-50 motion-reduce:hidden" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ember ring-2 ring-surface" />
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Per-coach motifs. Each draws behind the initial, which sits on top.
// ─────────────────────────────────────────────────────────────────────────

function MarcusMotif({ mark }: { mark: AvatarMark }) {
  // Sharp diagonal bars — "fast, direct"
  return (
    <>
      <g opacity={0.22}>
        <rect x="-10" y="60" width="120" height="3" fill={mark.accent} transform="rotate(-18 50 50)" />
        <rect x="-10" y="72" width="120" height="2" fill={mark.accent} transform="rotate(-18 50 50)" />
        <rect x="-10" y="82" width="120" height="1.5" fill={mark.accent} transform="rotate(-18 50 50)" />
      </g>
      <text
        x="50"
        y="68"
        textAnchor="middle"
        fontFamily="'Source Serif 4', 'Tiempos', 'Source Serif Pro', serif"
        fontWeight={600}
        fontSize={58}
        fill={mark.inkColor}
        letterSpacing="-2"
      >
        {mark.initial}
      </text>
    </>
  );
}

function HelenMotif({ mark }: { mark: AvatarMark }) {
  // Soft wave arc — "warm, flowing conversations"
  return (
    <>
      <path
        d="M -10 65 Q 25 40 50 62 T 110 55"
        fill="none"
        stroke={mark.accent}
        strokeOpacity={0.28}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <path
        d="M -10 78 Q 25 58 50 75 T 110 70"
        fill="none"
        stroke={mark.accent}
        strokeOpacity={0.18}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <text
        x="50"
        y="66"
        textAnchor="middle"
        fontFamily="'Source Serif 4', 'Tiempos', 'Source Serif Pro', serif"
        fontStyle="italic"
        fontWeight={500}
        fontSize={56}
        fill={mark.inkColor}
        letterSpacing="-1.5"
      >
        {mark.initial}
      </text>
    </>
  );
}

function AikoMotif({ mark }: { mark: AvatarMark }) {
  // Rhythm-mark orbit — "playful, scene-based lessons"
  return (
    <>
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke={mark.accent}
        strokeOpacity={0.15}
        strokeWidth={1}
        strokeDasharray="2 4"
      />
      <circle cx="20" cy="50" r="2.5" fill={mark.accent} />
      <circle cx="50" cy="20" r="2" fill={mark.accent} opacity={0.7} />
      <circle cx="80" cy="50" r="1.5" fill={mark.accent} opacity={0.5} />
      <text
        x="50"
        y="68"
        textAnchor="middle"
        fontFamily="'Source Serif 4', 'Tiempos', 'Source Serif Pro', serif"
        fontWeight={600}
        fontSize={56}
        fill={mark.inkColor}
        letterSpacing="-1.5"
      >
        {mark.initial}
      </text>
    </>
  );
}

function DavidMotif({ mark }: { mark: AvatarMark }) {
  // Structured grid — "methodical, system first"
  return (
    <>
      <g opacity={0.16} stroke={mark.accent} strokeWidth={0.8}>
        <line x1="0" y1="33" x2="100" y2="33" />
        <line x1="0" y1="66" x2="100" y2="66" />
        <line x1="33" y1="0" x2="33" y2="100" />
        <line x1="66" y1="0" x2="66" y2="100" />
      </g>
      <text
        x="50"
        y="68"
        textAnchor="middle"
        fontFamily="'Source Serif 4', 'Tiempos', 'Source Serif Pro', serif"
        fontWeight={600}
        fontSize={56}
        fill={mark.inkColor}
        letterSpacing="-1"
      >
        {mark.initial}
      </text>
    </>
  );
}
