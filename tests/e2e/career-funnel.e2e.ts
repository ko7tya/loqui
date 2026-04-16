import { test, expect } from '@playwright/test';

/**
 * End-to-end career-learner walkthrough.
 *
 * Drives Q1 → Q10 exactly as a real user would, then verifies:
 *   - success screen renders (waitlist position + coach reference)
 *   - POST /api/submit was hit with the expected payload shape
 *
 * Interstitials use the "Keep going" CTA; real question screens use
 * "Continue" or "Build my plan". The test keys off the text literally
 * rather than picking the first button, so the flow stays robust to
 * layout changes.
 */

const advance = async (page: import('@playwright/test').Page, label: RegExp) => {
  await page.getByRole('button', { name: label }).click();
};

test('career funnel — complete Q1..Q10 and see success', async ({ page }) => {
  await page.goto('/');

  // Intercept the submit call so we can assert payload shape.
  const submitPromise = page.waitForRequest(
    (req) => req.url().includes('/api/submit') && req.method() === 'POST',
  );

  await page.getByRole('button', { name: /start your plan/i }).click();

  // Q1 — who you're talking to
  await expect(
    page.getByRole('radio', { name: /a colleague in a meeting/i }),
  ).toBeVisible();
  await page.getByRole('radio', { name: /a colleague in a meeting/i }).click();
  await advance(page, /^continue$/i);

  // Q2 — level (pick Conversational)
  await expect(
    page.getByRole('radio', { name: /conversational/i }).first(),
  ).toBeVisible();
  await page.getByRole('radio', { name: /conversational/i }).first().click();
  await advance(page, /^continue$/i);

  // Interstitial A — Readiness score preview (CTA: "Keep going")
  await advance(page, /keep going/i);

  // Q3 — why (career)
  await expect(page.getByRole('radio', { name: /for work/i })).toBeVisible();
  await page.getByRole('radio', { name: /for work/i }).click();
  await advance(page, /^continue$/i);

  // Q4 — age (35–44)
  await expect(
    page.getByRole('radio', { name: /35.*44|35[-–]44/i }),
  ).toBeVisible();
  await page.getByRole('radio', { name: /35.*44|35[-–]44/i }).click();
  await advance(page, /^continue$/i);

  // Q5 — specific moment (first career option)
  await expect(page.getByRole('radio').first()).toBeVisible();
  await page.getByRole('radio').first().click();
  await advance(page, /^continue$/i);

  // Interstitial B — Social proof map (CTA: "Keep going")
  await advance(page, /keep going/i);

  // Q6 — time (pick 20 min)
  const twentyMin = page.getByRole('radio', { name: /20\s*min/i });
  await twentyMin.first().click();
  await advance(page, /^continue$/i);

  // Q7 — phrase challenge (pick any option, reveal, then continue)
  await expect(page.getByRole('radio').first()).toBeVisible();
  await page.getByRole('radio').first().click();
  await advance(page, /^continue$/i);

  // Q8 — pick Helen coach
  await expect(page.getByRole('radio', { name: /helen/i })).toBeVisible();
  await page.getByRole('radio', { name: /helen/i }).click();
  await advance(page, /build my plan/i);

  // Q9 — plan reveal. Wait for the loading choreography to finish (~4.8s)
  // then the "Lock in my plan" CTA to appear.
  await page.getByRole('button', { name: /lock in my plan/i }).waitFor({
    timeout: 20_000,
  });
  await advance(page, /lock in my plan/i);

  // Q10 — enter email + submit. The submit button lives in the sticky
  // footer with form="email-form", not inside the form element.
  const emailInput = page.getByRole('textbox').first();
  await emailInput.fill('e2e-test@loqui.app');
  await page.getByRole('button', { name: /send me my plan/i }).click();

  const submitRequest = await submitPromise;
  const bodyText = submitRequest.postData() ?? '';
  expect(bodyText).toContain('e2e-test@loqui.app');
  expect(bodyText).toContain('"q3_segment":"career"');
  expect(bodyText).toContain('"q8_coach":"helen"');

  // Success screen — waitlist position visible
  await expect(
    page.getByText(/you're #|waitlist|position/i).first(),
  ).toBeVisible({ timeout: 15_000 });
});
