import { describe, it, expect, afterEach, vi } from 'vitest';
import { track, type AnalyticsEvent } from './analytics';

/**
 * Analytics wrapper tests — SSR guard, console.log shape, compile-time event
 * name typing.
 */

describe('track', () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    (globalThis as unknown as { window: Window | undefined }).window = originalWindow;
    vi.restoreAllMocks();
  });

  it('is a no-op when window is undefined (SSR)', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    // @ts-expect-error — simulate SSR
    delete globalThis.window;
    track('funnel_started');
    expect(spy).not.toHaveBeenCalled();
  });

  it('logs with [ANALYTICS] prefix + event + props', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    track('question_answered', { q: 'Q1', value: 'colleague' });
    expect(spy).toHaveBeenCalledWith('[ANALYTICS] question_answered', {
      q: 'Q1',
      value: 'colleague',
    });
  });

  it('passes an empty object when props omitted', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    track('funnel_started');
    expect(spy).toHaveBeenCalledWith('[ANALYTICS] funnel_started', {});
  });

  it('is typesafe — event names are checked at compile time', () => {
    // Reading the union gives us a compile-time smoke check. Any rename of
    // the AnalyticsEvent union that dropped these members would trip tsc.
    const valid: AnalyticsEvent[] = [
      'funnel_started',
      'question_viewed',
      'question_answered',
      'segment_detected',
      'age_selected',
      'coach_selected',
      'interstitial_viewed',
      'plan_generation_started',
      'plan_generated',
      'plan_fallback_used',
      'email_submitted',
      'submit_succeeded',
      'submit_failed',
    ];
    // Length acts as a runtime sanity check that the list wasn't cut short.
    expect(valid.length).toBe(13);
  });
});
