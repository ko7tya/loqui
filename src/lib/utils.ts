import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Conditional class merger used across the UI layer.
 * Combines `clsx` (toggles) with `tailwind-merge` (last-write-wins for
 * conflicting Tailwind utilities).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
