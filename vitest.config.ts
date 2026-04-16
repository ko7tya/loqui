import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * Vitest configuration.
 *
 * - `jsdom` environment for component + hook tests (React + window globals).
 * - Global setup file stubs browser APIs that jsdom doesn't ship (matchMedia,
 *   IntersectionObserver, ResizeObserver) and extends expect with
 *   @testing-library/jest-dom matchers.
 * - Path alias `@/*` mirrors tsconfig so imports resolve identically.
 * - Playwright E2E specs (**\/*.e2e.*) are excluded so they don't run here.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'tests/integration/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/*.e2e.*',
      'tests/e2e/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        '**/node_modules/**',
        '**/.next/**',
        '**/*.config.{ts,js,mjs}',
        '**/*.d.ts',
        'tests/e2e/**',
        'scripts/**',
        'src/**/*.test.{ts,tsx}',
      ],
    },
  },
});
