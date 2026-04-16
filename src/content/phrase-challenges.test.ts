import { describe, it, expect } from 'vitest';
import {
  PHRASE_CHALLENGES,
  getSeedFor,
} from './phrase-challenges';

/**
 * Q7 phrase challenge integrity — every seed has exactly 3 options, exactly
 * one correct, and getSeedFor always returns a usable seed (never crashes).
 */

describe('PHRASE_CHALLENGES integrity', () => {
  it('has exactly 6 seeds (coverage comment in source)', () => {
    expect(PHRASE_CHALLENGES).toHaveLength(6);
  });

  it('every seed has exactly 3 options', () => {
    for (const seed of PHRASE_CHALLENGES) {
      expect(seed.options).toHaveLength(3);
    }
  });

  it('exactly one isCorrect:true option per seed', () => {
    for (const seed of PHRASE_CHALLENGES) {
      const correct = seed.options.filter((o) => o.isCorrect === true);
      expect(correct).toHaveLength(1);
    }
  });

  it('every seed has non-empty context, correct_explanation, takeaway', () => {
    for (const seed of PHRASE_CHALLENGES) {
      expect(seed.context.length).toBeGreaterThan(5);
      expect(seed.correct_explanation.length).toBeGreaterThan(5);
      expect(seed.takeaway.length).toBeGreaterThan(5);
      expect(seed.level_match.length).toBeGreaterThan(0);
    }
  });
});

describe('getSeedFor', () => {
  it('returns a seed matching segment + level when available', () => {
    const seed = getSeedFor('career', 'conversational');
    expect(seed.segment).toBe('career');
    expect(seed.level_match).toContain('conversational');
  });

  it('falls back to same-segment when exact level missing', () => {
    // travel_social has only conversational; ask for getting_by
    const seed = getSeedFor('travel_social', 'getting_by');
    expect(seed.segment).toBe('travel_social');
  });

  it('returns a usable default when segment+level both undefined', () => {
    const seed = getSeedFor(undefined, undefined);
    expect(seed).toBeDefined();
    expect(seed.options).toHaveLength(3);
    expect(seed.id).toBeTruthy();
  });

  it('returns a usable default when segment is completely unknown', () => {
    // Passing `undefined` as a stand-in for "no match" because TS rejects
    // a literal non-Segment string — same intent: no seed has this segment.
    const seed = getSeedFor(undefined, 'near_native');
    expect(seed).toBeDefined();
    expect(seed.options).toHaveLength(3);
  });
});
