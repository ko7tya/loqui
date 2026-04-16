import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

/**
 * Global test setup.
 *
 * Stubs the browser APIs jsdom doesn't implement so components that touch
 * them (ThemeToggle → matchMedia; Framer Motion → IntersectionObserver;
 * Radix UI → ResizeObserver) can render without throwing.
 *
 * `cleanup()` after each test prevents leaked DOM nodes across tests.
 */

// --- matchMedia stub ------------------------------------------------------

if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {}, // deprecated
      removeListener: () => {}, // deprecated
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// --- IntersectionObserver stub -------------------------------------------

class IntersectionObserverStub {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
if (typeof globalThis.IntersectionObserver === 'undefined') {
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    IntersectionObserverStub;
}

// --- ResizeObserver stub -------------------------------------------------

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof globalThis.ResizeObserver === 'undefined') {
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver =
    ResizeObserverStub;
}

// --- crypto.randomUUID guard ---------------------------------------------

if (typeof globalThis.crypto === 'undefined') {
  // @ts-expect-error — test stub for very old runtimes
  globalThis.crypto = {};
}
if (typeof globalThis.crypto.randomUUID !== 'function') {
  const rand = () =>
    Math.random().toString(16).slice(2, 10) +
    '-' +
    Math.random().toString(16).slice(2, 6) +
    '-4' +
    Math.random().toString(16).slice(2, 5) +
    '-a' +
    Math.random().toString(16).slice(2, 5) +
    '-' +
    Math.random().toString(16).slice(2, 14);
  // @ts-expect-error — augment crypto for jsdom.
  globalThis.crypto.randomUUID = rand;
}

// --- scrollTo stub -------------------------------------------------------

if (typeof window !== 'undefined' && !window.scrollTo) {
  window.scrollTo = () => {};
}

afterEach(() => {
  cleanup();
});
