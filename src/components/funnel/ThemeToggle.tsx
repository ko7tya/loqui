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

const applyTheme = (next: Theme) => {
  const el = document.documentElement;
  el.classList.toggle('dark', next === 'dark');
  el.style.colorScheme = next;
};

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const saved =
      (localStorage.getItem('loqui-theme') as Theme | null) ||
      (mql.matches ? 'dark' : 'light');
    setTheme(saved);
    applyTheme(saved);

    // If the user hasn't explicitly chosen, track system changes live (e.g.
    // they flip iOS dark mode while the tab is open).
    const onSystemChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('loqui-theme')) return; // explicit choice wins
      const next: Theme = e.matches ? 'dark' : 'light';
      setTheme(next);
      applyTheme(next);
    };
    mql.addEventListener('change', onSystemChange);
    return () => mql.removeEventListener('change', onSystemChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light';
      applyTheme(next);
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
