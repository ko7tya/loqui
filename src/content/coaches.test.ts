import { describe, it, expect } from 'vitest';
import { COACHES, COACHES_ORDER, coachByStyle } from './coaches';
import { SEGMENTS, COACH_IDS, type LearningStyle } from '@/lib/types';

/**
 * Coach content integrity — ensures the plan reveal never crashes on a
 * missing quote, order is exact, and style→coach mapping is bijective.
 */

describe('COACHES content integrity', () => {
  it('every coach has a quote for every segment (4 × 4 = 16 combos)', () => {
    let combos = 0;
    for (const id of COACH_IDS) {
      const coach = COACHES[id];
      expect(coach).toBeDefined();
      for (const seg of SEGMENTS) {
        const quote = coach.quotes[seg];
        expect(quote).toBeTruthy();
        expect(typeof quote).toBe('string');
        expect(quote.length).toBeGreaterThan(5);
        combos += 1;
      }
    }
    expect(combos).toBe(16);
  });

  it('COACHES_ORDER has exactly 4 ids matching the keys of COACHES', () => {
    expect(COACHES_ORDER).toHaveLength(4);
    for (const id of COACHES_ORDER) {
      expect(COACHES[id]).toBeDefined();
    }
    const ordered = [...COACHES_ORDER].sort();
    const keys = Object.keys(COACHES).sort();
    expect(ordered).toEqual(keys);
  });
});

describe('coachByStyle', () => {
  it('returns the right coach for each of the 4 styles', () => {
    const styleToCoach: Record<LearningStyle, string> = {
      drills: 'marcus',
      conversations: 'helen',
      stories: 'aiko',
      structured: 'david',
    };
    for (const [style, expected] of Object.entries(styleToCoach)) {
      expect(coachByStyle(style as LearningStyle)).toBe(expected);
    }
  });

  it('returns undefined when style is undefined', () => {
    expect(coachByStyle(undefined)).toBeUndefined();
  });
});
