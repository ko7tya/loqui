import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  FunnelState,
  Segment,
  Level,
  TimeCommitment,
  LearningStyle,
  PriorApp,
  WhoTalkingTo,
  Q7Answer,
  GeneratedPlan,
  PlanSource,
} from './types';

/**
 * Funnel store.
 *
 * - Persists to localStorage under `loqui-funnel-v1` so a refresh mid-funnel
 *   doesn't lose the user's progress.
 * - `reset()` clears the persisted payload but keeps the zustand subscription
 *   tree intact — callers don't need to re-subscribe.
 * - Waitlist counter starts at 2,487 per project brief.
 */

const WAITLIST_BASE = 2487;

const freshSession = (): Pick<
  FunnelState,
  'session_id' | 'started_at' | 'plan_source'
> => ({
  session_id:
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
  started_at: new Date().toISOString(),
  plan_source: 'fallback',
});

export interface FunnelStore {
  // --- state ---
  answers: FunnelState;
  currentStep: number; // 0 = landing, 1..10 = Q1..Q10, 11 = success

  // --- per-question setters ---
  setQ1: (who: WhoTalkingTo) => void;
  setQ2: (level: Level) => void;
  setQ3: (segment: Segment) => void;
  setQ4: (apps: PriorApp[]) => void;
  setQ5: (moment: string, momentId: string) => void;
  setQ6: (time: TimeCommitment) => void;
  setQ7: (answer: Q7Answer) => void;
  setQ8: (style: LearningStyle) => void;
  setEmail: (email: string) => void;

  // --- plan/flow mutations ---
  setPlan: (plan: GeneratedPlan, source: PlanSource) => void;
  setWaitlistPosition: (position: number) => void;
  markCompleted: () => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // --- helpers ---
  reset: () => void;
  waitlistBase: number;
}

export const useFunnelStore = create<FunnelStore>()(
  persist(
    (set) => ({
      answers: freshSession(),
      currentStep: 0,
      waitlistBase: WAITLIST_BASE,

      setQ1: (who) =>
        set((s) => ({ answers: { ...s.answers, q1_who_talking_to: who } })),
      setQ2: (level) =>
        set((s) => ({ answers: { ...s.answers, q2_level: level } })),
      setQ3: (segment) =>
        set((s) => ({
          answers: { ...s.answers, q3_segment: segment, segment },
        })),
      setQ4: (apps) =>
        set((s) => ({ answers: { ...s.answers, q4_prior_apps: apps } })),
      setQ5: (moment, momentId) =>
        set((s) => ({
          answers: {
            ...s.answers,
            q5_moment: moment,
            q5_moment_id: momentId,
          },
        })),
      setQ6: (time) =>
        set((s) => ({ answers: { ...s.answers, q6_time: time } })),
      setQ7: (answer) =>
        set((s) => ({
          answers: { ...s.answers, q7_challenge: answer },
        })),
      setQ8: (style) =>
        set((s) => ({ answers: { ...s.answers, q8_style: style } })),
      setEmail: (email) =>
        set((s) => ({ answers: { ...s.answers, q10_email: email } })),

      setPlan: (plan, source) =>
        set((s) => ({
          answers: {
            ...s.answers,
            generated_plan: plan,
            plan_source: source,
          },
        })),
      setWaitlistPosition: (position) =>
        set((s) => ({
          answers: { ...s.answers, waitlist_position: position },
        })),
      markCompleted: () =>
        set((s) => ({
          answers: {
            ...s.answers,
            completed_at: new Date().toISOString(),
          },
        })),

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
      prevStep: () =>
        set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),

      reset: () =>
        set({
          answers: freshSession(),
          currentStep: 0,
        }),
    }),
    {
      name: 'loqui-funnel-v1',
      storage: createJSONStorage(() =>
        typeof window === 'undefined'
          ? // SSR no-op storage
            {
              getItem: () => null,
              setItem: () => undefined,
              removeItem: () => undefined,
            }
          : localStorage,
      ),
      version: 1,
      partialize: (state) => ({
        answers: state.answers,
        currentStep: state.currentStep,
      }),
    },
  ),
);
