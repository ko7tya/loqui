import { test, expect } from '@playwright/test';

/**
 * Dark-mode toggle + system-preference reconciliation.
 *
 * - Loading with `colorScheme: dark` applies `.dark` on <html>.
 * - Toggling from the UI flips the class and writes loqui-theme to localStorage.
 * - Reloading with the same colorScheme=dark, but with the user having chosen
 *   "light", should NOT re-apply .dark (user choice wins).
 */

test.use({ colorScheme: 'dark' });

test('system dark → UI toggle → reload respects user choice', async ({ page }) => {
  await page.goto('/');

  // Initial state: OS in dark, no localStorage → .dark applied.
  const initialDark = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(initialDark).toBe(true);

  // Click theme toggle (aria-label includes "Switch to ... mode")
  await page.getByRole('button', { name: /switch to light mode/i }).click();

  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.classList.contains('dark')),
    )
    .toBe(false);

  const stored = await page.evaluate(() => localStorage.getItem('loqui-theme'));
  expect(stored).toBe('light');

  // Reload with the same dark colorScheme — user pick (light) should stick.
  await page.reload();
  await page.waitForLoadState('networkidle');

  const afterReload = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(afterReload).toBe(false);
});
