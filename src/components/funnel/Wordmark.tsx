import { cn } from '@/lib/utils';

/**
 * Loqui wordmark — serif with ember tittle.
 *
 * The dot over the `i` is replaced by a filled ember circle sized at 22% of
 * the cap height. See design-system.md §2.
 */
export function Wordmark({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const dotSize = Math.round(size * 0.22);
  return (
    <span
      className={cn(
        'inline-flex items-end font-serif font-normal text-ink',
        className,
      )}
      style={{ fontSize: size, letterSpacing: '-0.02em', lineHeight: 1 }}
      aria-label="Loqui"
    >
      <span aria-hidden>Loqu</span>
      <span className="relative inline-block" aria-hidden>
        {/* Keep the `i` stem but hide its tittle behind the ember disc */}
        <span className="relative">i</span>
        <span
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-ember"
          style={{
            width: dotSize,
            height: dotSize,
            top: -Math.round(size * 0.04),
          }}
        />
      </span>
    </span>
  );
}
