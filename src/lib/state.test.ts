import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFunnelStore } from './state';
import { COACHES } from '@/content/coaches';

/**
 * Zustand funnel store behavior — setters, navigation bounds, UTM hydration,
 * reset, and persist configuration.
 */

describe('per-question setters', () => {
  beforeEach(() => {
    // Fresh store state each test.
    useFunnelStore.getState().reset();
  });

  it('setQ1 writes q1_who_talking_to', () => {
    const { result } = renderHook(() => useFunnelStore());
    act(() => result.current.setQ1('colleague'));
    expect(result.current.answers.q1_who_talking_to).toBe('colleague');
  });

  it('setQ2 writes q2_level', () => {
    const { result } = renderHook(() => useFunnelStore());
    act(() => result.current.setQ2('fluent_with_gaps'));
    expect(result.current.answers.q2_level).toBe('fluent_with_gaps');
  });

  it('setQ3 writes both q3_segment and derived segment', () => {
    const { result } = renderHook(() => useFunnelStore());
    act(() => result.current.setQ3('immigration'));
    expect(result.current.answers.q3_segment).toBe('immigration');
    expect(result.current.answers.segment).toBe('immigration');
  });

  it('setQ4Age writes q4_age', () => {
    const { result } = renderHook(() => useFunnelStore());
    act(() => result.current.setQ4Age('35_44'));
    expect(result.current.answers.q4_age).toBe('35_44');
  });

  it('setQ5 writes moment and moment_id', () => {
    const { result } = renderHook(() => useFunnelStore());
    act(() => result.current.setQ5('the Friday demo', 'career_0'));
    expect(result.current.answers.q5_moment).toBe('the Friday demo');
    expect(result.current.answers.q5_moment_id).toBe('career_0');
  });

  it('setQ6 writes q6_time', () => {
    const { result } = renderHook(() => useFunnelStore());
    act(() => result.current.setQ6(45));
    expect(result.current.answers.q6_time).toBe(45);
  });

  it('setQ7 writes q7_challenge', () => {
    const { result } = renderHook(() => useFunnelStore());
    act(() =>
      result.current.setQ7({
        challenge_id: 'career_conv_intro',
        selected_option_id: 'a',
        was_correct: true,
      }),
    );
    expect(result.current.answers.q7_challenge?.was_correct).toBe(true);
  });

  it('setQ8Coach writes q8_coach AND matching q8_style', () => {
    const { result } = renderHook(() => useFunnelStore());
    act(() => result.current.setQ8Coach('aiko'));
    expect(result.current.answers.q8_coach).toBe('aiko');
    expect(result.current.answers.q8_style).toBe(COACHES.aiko.style);
  });

  it('setEmail writes q10_email', () => {
    const { result } = renderHook(() => useFunnelStore());
    act(() => result.current.setEmail('user@example.com'));
    expect(result.current.answers.q10_email).toBe('user@example.com');
  });
});

describe('navigation', () => {
  beforeEach(() => {
    useFunnelStore.getState().reset();
  });

  it('nextStep increments currentStep', () => {
    const { result } = renderHook(() => useFunnelStore());
    act(() => result.current.setStep(3));
    act(() => result.current.nextStep());
    expect(result.current.currentStep).toBe(4);
  });

  it('prevStep decrements currentStep', () => {
    const { result } = renderHook(() => useFunnelStore());
    act(() => result.current.setStep(5));
    act(() => result.current.prevStep());
    expect(result.current.currentStep).toBe(4);
  });

  it('prevStep does not go below 0', () => {
    const { result } = renderHook(() => useFunnelStore());
    act(() => result.current.setStep(0));
    act(() => result.current.prevStep());
    expect(result.current.currentStep).toBe(0);
  });
});

describe('hydrateFromUtm', () => {
  beforeEach(() => {
    useFunnelStore.getState().reset();
  });

  it('preseeds q3_segment only when undefined AND utm has segment_hint', () => {
    const { result } = renderHook(() => useFunnelStore());
    act(() => result.current.setUtm({ segment_hint: 'test_prep' }));
    act(() => result.current.hydrateFromUtm());
    expect(result.current.answers.q3_segment).toBe('test_prep');
    expect(result.current.answers.segment).toBe('test_prep');
  });

  it('never overwrites an existing answer', () => {
    const { result } = renderHook(() => useFunnelStore());
    act(() => result.current.setQ3('career'));
    act(() =>
      result.current.setUtm({
        segment_hint: 'test_prep',
        age_hint: '25_34',
      }),
    );
    act(() => result.current.setQ4Age('45_54'));
    act(() => result.current.hydrateFromUtm());
    // q3 remains the user's pick, not the UTM hint
    expect(result.current.answers.q3_segment).toBe('career');
    expect(result.current.answers.q4_age).toBe('45_54');
  });

  it('preseeds age when no user answer yet', () => {
    const { result } = renderHook(() => useFunnelStore());
    act(() => result.current.setUtm({ age_hint: '18_24' }));
    act(() => result.current.hydrateFromUtm());
    expect(result.current.answers.q4_age).toBe('18_24');
  });

  it('preseeds ui_locale_hint from lang_hint when empty', () => {
    const { result } = renderHook(() => useFunnelStore());
    act(() => result.current.setUtm({ lang_hint: 'fr' }));
    act(() => result.current.hydrateFromUtm());
    expect(result.current.answers.ui_locale_hint).toBe('fr');
  });

  it('no-op when utm is missing entirely', () => {
    const { result } = renderHook(() => useFunnelStore());
    const before = result.current.answers;
    act(() => result.current.hydrateFromUtm());
    expect(result.current.answers).toEqual(before);
  });
});

describe('reset', () => {
  it('returns state to a fresh session with a new session_id', () => {
    const { result } = renderHook(() => useFunnelStore());
    const firstId = result.current.answers.session_id;
    act(() => result.current.setQ1('colleague'));
    act(() => result.current.setStep(5));
    act(() => result.current.reset());
    expect(result.current.answers.q1_who_talking_to).toBeUndefined();
    expect(result.current.currentStep).toBe(0);
    expect(result.current.answers.session_id).not.toBe(firstId);
  });
});

describe('persist config', () => {
  it('uses storage key loqui-funnel-v2 with version 2', async () => {
    // Zustand persist writes to localStorage. Poke the store and verify the
    // key + version land where expected.
    try {
      localStorage.removeItem('loqui-funnel-v2');
    } catch {
      /* ignore */
    }
    const { result } = renderHook(() => useFunnelStore());
    act(() => result.current.setQ1('colleague'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const persistApi = (useFunnelStore as any).persist;
    // Force a rehydrate which flushes any pending writes under v5.
    if (persistApi?.rehydrate) {
      await persistApi.rehydrate();
    }
    const raw = localStorage.getItem('loqui-funnel-v2');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.version).toBe(2);
    expect(parsed.state.answers.q1_who_talking_to).toBe('colleague');
  });
});
