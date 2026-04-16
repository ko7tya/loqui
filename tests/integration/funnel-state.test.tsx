import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFunnelStore } from '@/lib/state';

/**
 * End-to-end funnel-state walkthrough + persist behavior.
 *
 * Drives the store through all 10 questions, then checks prev/reset +
 * localStorage rehydration.
 */

beforeEach(() => {
  useFunnelStore.getState().reset();
  // Clear any pre-seeded persist record.
  try {
    localStorage.removeItem('loqui-funnel-v2');
  } catch {
    /* ignore */
  }
});

describe('walk forward through all 10 questions', () => {
  it('state grows correctly as each setter is called', () => {
    const { result } = renderHook(() => useFunnelStore());

    act(() => {
      result.current.setStep(1);
      result.current.setQ1('colleague');
    });
    expect(result.current.answers.q1_who_talking_to).toBe('colleague');

    act(() => {
      result.current.nextStep();
      result.current.setQ2('conversational');
    });
    expect(result.current.currentStep).toBe(2);

    act(() => {
      result.current.nextStep();
      result.current.setQ3('career');
    });
    expect(result.current.answers.segment).toBe('career');

    act(() => {
      result.current.nextStep();
      result.current.setQ4Age('35_44');
    });

    act(() => {
      result.current.nextStep();
      result.current.setQ5('the Monday stand-up', 'career_0');
    });

    act(() => {
      result.current.nextStep();
      result.current.setQ6(20);
    });

    act(() => {
      result.current.nextStep();
      result.current.setQ7({
        challenge_id: 'career_conv_intro',
        selected_option_id: 'a',
        was_correct: true,
      });
    });

    act(() => {
      result.current.nextStep();
      result.current.setQ8Coach('helen');
    });

    act(() => {
      result.current.nextStep();
      // Q9 is the reveal step — nothing to set.
    });

    act(() => {
      result.current.nextStep();
      result.current.setEmail('walker@example.com');
    });

    expect(result.current.currentStep).toBe(10);
    const ans = result.current.answers;
    expect(ans.q1_who_talking_to).toBe('colleague');
    expect(ans.q2_level).toBe('conversational');
    expect(ans.q3_segment).toBe('career');
    expect(ans.q4_age).toBe('35_44');
    expect(ans.q5_moment).toBe('the Monday stand-up');
    expect(ans.q6_time).toBe(20);
    expect(ans.q7_challenge?.was_correct).toBe(true);
    expect(ans.q8_coach).toBe('helen');
    expect(ans.q10_email).toBe('walker@example.com');
  });
});

describe('backward navigation preserves answers', () => {
  it('prevStep walks back without dropping any answer', () => {
    const { result } = renderHook(() => useFunnelStore());
    act(() => {
      result.current.setQ1('colleague');
      result.current.setQ2('conversational');
      result.current.setQ3('career');
      result.current.setStep(3);
    });
    act(() => {
      result.current.prevStep();
      result.current.prevStep();
    });
    expect(result.current.currentStep).toBe(1);
    expect(result.current.answers.q1_who_talking_to).toBe('colleague');
    expect(result.current.answers.q2_level).toBe('conversational');
    expect(result.current.answers.q3_segment).toBe('career');
  });
});

describe('reset after complete', () => {
  it('goes back to fresh state with new session_id', () => {
    const { result } = renderHook(() => useFunnelStore());
    const firstId = result.current.answers.session_id;
    act(() => {
      result.current.setQ1('colleague');
      result.current.setEmail('a@b.com');
      result.current.markCompleted();
      result.current.setStep(11);
      result.current.reset();
    });
    expect(result.current.answers.q1_who_talking_to).toBeUndefined();
    expect(result.current.answers.q10_email).toBeUndefined();
    expect(result.current.currentStep).toBe(0);
    expect(result.current.answers.session_id).not.toBe(firstId);
  });
});

describe('persist middleware rehydration', () => {
  it('writes to localStorage under loqui-funnel-v2', async () => {
    const { result } = renderHook(() => useFunnelStore());
    act(() => {
      result.current.setQ1('colleague');
      result.current.setQ2('near_native');
    });

    // Zustand persist writes async — force a flush.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const persistApi = (useFunnelStore as any).persist;
    await persistApi.rehydrate();

    const raw = localStorage.getItem('loqui-funnel-v2');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.answers.q1_who_talking_to).toBe('colleague');
    expect(parsed.state.answers.q2_level).toBe('near_native');
    expect(parsed.version).toBe(2);
  });
});
