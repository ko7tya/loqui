'use client';

import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Thin wrapper that adds arrow-key navigation to any group of `role="radio"`
 * buttons. Listens for ArrowUp/Down/Left/Right on capture and moves focus to
 * the previous / next focusable radio child.
 *
 * Home/End jump to first/last.
 */
export interface RadioGroupKeysProps {
  children: ReactNode;
  className?: string;
  label: string;
}

export function RadioGroupKeys({
  children,
  className,
  label,
}: RadioGroupKeysProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!rootRef.current) return;
    const keys = ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(e.key)) return;

    const radios = Array.from(
      rootRef.current.querySelectorAll<HTMLElement>('[role="radio"]'),
    ).filter((el) => !el.hasAttribute('disabled'));
    if (radios.length === 0) return;

    const currentIndex = radios.indexOf(document.activeElement as HTMLElement);
    let nextIndex = currentIndex;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % radios.length;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      nextIndex =
        currentIndex === -1
          ? radios.length - 1
          : (currentIndex - 1 + radios.length) % radios.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = radios.length - 1;
    }

    e.preventDefault();
    radios[nextIndex]?.focus();
  };

  return (
    <div
      ref={rootRef}
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKey}
      className={cn(className)}
    >
      {children}
    </div>
  );
}
