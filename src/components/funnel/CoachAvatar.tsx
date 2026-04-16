import { cn } from '@/lib/utils';
import type { CoachId } from '@/lib/types';
import { COACH_AVATAR_SVG } from '@/content/avatars';

/**
 * Coach avatar — portrait + live indicator.
 *
 * Uses the DiceBear "Personas" SVG inlined at build time (see
 * `src/content/avatars/index.ts`). Each coach has a stable seed → stable
 * identity across deploys and sessions.
 *
 * The small ember dot at top-right has `animate-ping` behind it to signal
 * "AI, live". Disabled under `prefers-reduced-motion`.
 *
 * Sizing is a single prop so the same component works on Q8 cards (56px),
 * the Q9 coach intro (72–80px), and the success screen.
 */

export interface CoachAvatarProps {
  coach: CoachId;
  size?: number;
  className?: string;
  /** Show a subtle pulsing ember dot — signals "AI, live". Default true. */
  live?: boolean;
}

export function CoachAvatar({
  coach,
  size = 56,
  className,
  live = true,
}: CoachAvatarProps) {
  const svg = COACH_AVATAR_SVG[coach];
  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div
        style={{ width: size, height: size }}
        className="overflow-hidden rounded-full ring-1 ring-ink/10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
        // Inlining the SVG lets us control size via width/height on the
        // wrapper and lets the portrait inherit the surface via its own
        // background rect. Source is trusted (static, build-time fetched).
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      {/* AI live indicator — tiny ember dot, pulses. Hidden when reduced
          motion is preferred (the static dot still reads correctly). */}
      {live && (
        <span
          className="pointer-events-none absolute right-0 top-0 flex h-3 w-3 items-center justify-center"
          aria-label="AI coach, live"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-55 motion-reduce:hidden" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ember ring-2 ring-surface" />
        </span>
      )}
    </div>
  );
}
