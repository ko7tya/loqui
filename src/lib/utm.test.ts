import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readUtmFromLocation } from './utm';

/**
 * UTM/ad-network reader.
 *
 * The parser validates age + segment + lang against canonical enums and
 * drops anything unknown. Also needs to be SSR-safe.
 */

const setSearch = (search: string) => {
  // jsdom gives us a writable URL via history.replaceState
  window.history.replaceState({}, '', `/?${search.replace(/^\?/, '')}`);
};

describe('readUtmFromLocation', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('parses valid utm_source, campaign, medium, content', () => {
    setSearch(
      'utm_source=fb&utm_campaign=fluency-q1&utm_medium=cpc&utm_content=hero-a',
    );
    const ctx = readUtmFromLocation();
    expect(ctx.utm_source).toBe('fb');
    expect(ctx.utm_campaign).toBe('fluency-q1');
    expect(ctx.utm_medium).toBe('cpc');
    expect(ctx.utm_content).toBe('hero-a');
  });

  it('maps age to age_hint only when value matches AgeBracket enum', () => {
    setSearch('age=25_34');
    expect(readUtmFromLocation().age_hint).toBe('25_34');

    setSearch('age=toddler');
    expect(readUtmFromLocation().age_hint).toBeUndefined();

    setSearch('age=');
    expect(readUtmFromLocation().age_hint).toBeUndefined();
  });

  it('maps segment to segment_hint only when valid Segment', () => {
    setSearch('segment=career');
    expect(readUtmFromLocation().segment_hint).toBe('career');

    setSearch('segment=nonsense');
    expect(readUtmFromLocation().segment_hint).toBeUndefined();
  });

  it('lowercases lang and takes first 2 chars', () => {
    setSearch('lang=EN');
    expect(readUtmFromLocation().lang_hint).toBe('en');

    setSearch('lang=Fr-CA');
    expect(readUtmFromLocation().lang_hint).toBe('fr');

    // Non-ascii rejected
    setSearch('lang=zz1');
    // first two chars "zz" still two ascii letters, so that IS accepted.
    expect(readUtmFromLocation().lang_hint).toBe('zz');

    setSearch('lang=1a');
    // first two chars "1a" — not matching [a-z]{2}
    expect(readUtmFromLocation().lang_hint).toBeUndefined();
  });

  it('passes persona through as-is (capped at 64 chars)', () => {
    setSearch('persona=busy-exec');
    expect(readUtmFromLocation().persona).toBe('busy-exec');
  });

  it('returns empty object when no query string', () => {
    setSearch('');
    const ctx = readUtmFromLocation();
    expect(ctx).toEqual({});
  });
});

describe('readUtmFromLocation — SSR safety', () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    (globalThis as unknown as { window: Window | undefined }).window = originalWindow;
  });

  it('does not throw when window is undefined', () => {
    // @ts-expect-error — simulate SSR
    delete globalThis.window;
    expect(() => readUtmFromLocation()).not.toThrow();
    expect(readUtmFromLocation()).toEqual({});
  });
});
