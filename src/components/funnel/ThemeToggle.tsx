'use client';

import { useCallback, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Theme toggle — flips `.dark` on `<html>`. Zero deps (we could pull in
 * `next-themes` later if we need FOUC protection + SSR hydration guards, but
 * this class-strategy toggle is enough for MVP).
 *
 * Persists preference to localStorage under `loqui-theme`. The inline script
 * in `layout.tsx` reads that key before React hydrates so the initial paint
 * matches the user's saved choice and doesn't flash the wrong theme.
 */

type Theme = 'light' | 'dark';

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const saved =
      (typeof window !== 'undefined' &&
        (localStorage.getItem('loqui-theme') as Theme | null)) ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light');
    setTheme(saved);
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', next === 'dark');
      try {
        localStorage.setItem('loqui-theme', next);
      } catch {
        /* storage may be blocked */
      }
      return next;
    });
  }, []);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-muted text-ink transition-colors hover:bg-surface-elevated',
        className,
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
