import { test, expect } from '@playwright/test';

/**
 * Verifies the zustand-persist middleware rehydrates after a hard refresh.
 *
 * Strategy: answer Q1 + Q2 + interstitial + Q3, then reload. Read
 * localStorage directly (persist key = loqui-funnel-v2, version 2) and
 * assert the saved answers match what we picked.
 */

test('answers persist after a hard refresh', async ({ page }) => {
  await page.goto('/funnel');

  // Q1 — colleague
  await expect(
    page.getByRole('radio', { name: /a colleague in a meeting/i }),
  ).toBeVisible({ timeout: 10_000 });
  await page.getByRole('radio', { name: /a colleague in a meeting/i }).click();
  await page.getByRole('button', { name: /^continue$/i }).click();

  // Q2 — conversational
  await page.getByRole('radio', { name: /conversational/i }).first().click();
  await page.getByRole('button', { name: /^continue$/i }).click();

  // Interstitial A uses "Keep going" as the CTA.
  await page.getByRole('button', { name: /keep going/i }).click();

  // Q3 — career. DO NOT click continue so we exercise persist mid-funnel.
  await page.getByRole('radio', { name: /for work/i }).click();

  // Force a hard refresh.
  await page.reload();
  await page.waitForLoadState('networkidle');

  const persisted = await page.evaluate(() =>
    localStorage.getItem('loqui-funnel-v2'),
  );
  expect(persisted).toBeTruthy();
  const parsed = JSON.parse(persisted!);
  expect(parsed.version).toBe(2);
  expect(parsed.state.answers.q1_who_talking_to).toBe('colleague');
  expect(parsed.state.answers.q2_level).toBe('conversational');
  expect(parsed.state.answers.q3_segment).toBe('career');
});
