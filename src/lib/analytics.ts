/**
 * Analytics wrapper — console.log today, Amplitude-swap-ready tomorrow.
 *
 * Swap-in procedure:
 *   1. Add `@amplitude/analytics-browser` dep.
 *   2. Replace the `console.log` branch with `amplitude.track(event, props)`.
 *   3. Keep this file the only touch-point; callers do not change.
 */

export type AnalyticsEvent =
  | 'funnel_started'
  | 'question_viewed'
  | 'question_answered'
  | 'segment_detected'
  | 'interstitial_viewed'
  | 'plan_generation_started'
  | 'plan_generated'
  | 'plan_fallback_used'
  | 'email_submitted'
  | 'submit_succeeded'
  | 'submit_failed';

export const track = (
  event: AnalyticsEvent,
  props?: Record<string, unknown>,
) => {
  if (typeof window === 'undefined') return;
  console.log(`[ANALYTICS] ${event}`, props ?? {});
  // FUTURE: amplitude.track(event, props)
};
