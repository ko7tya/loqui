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
  AgeBracket,
  CoachId,
  UtmContext,
} from './types';
import { COACHES } from '@/content/coaches';

/**
 * Funnel store.
 *
 * - Persists to localStorage under `loqui-funnel-v1` so a refresh mid-funnel
 *   doesn't lose the user's progress.
 * - `reset()` clears the persisted payload but keeps the zustand subscription
 *   tree intact — callers don't need to re-subscribe.
 * - Waitlist counter starts at 2,487 per project brief.
 *
 * v2 additions:
 *   - `setQ4Age` replaces `setQ4` as the primary Q4 setter. `setQ4` is kept
 *     as a no-op so old saved sessions loading old code paths don't crash.
 *   - `setQ8Coach` writes both `q8_coach` (new) and `q8_style` (legacy) so
 *     the plan-template matrix keeps working off the old key.
 *   - `setUtm` + `hydrateFromUtm` preseed Q3 / Q4 when the landing URL
 *     carries `age` / `segment` hints. Order-independent — the UI still
 *     shows every question; we just pre-fill the answer.
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
  /**
   * @deprecated v2 — age replaced prior-apps. Kept as a no-op writer so
   * stale imports don't crash; new call sites use `setQ4Age`.
   */
  setQ4: (apps: PriorApp[]) => void;
  /** v2: age bracket — the live Q4 setter. */
  setQ4Age: (age: AgeBracket) => void;
  setQ5: (moment: string, momentId: string) => void;
  setQ6: (time: TimeCommitment) => void;
  setQ7: (answer: Q7Answer) => void;
  /**
   * @deprecated Direct learning-style setter. v2 hydrates q8_style via
   * `setQ8Coach`. Still exposed so old tests + the plan-generator type
   * shape stay stable.
   */
  setQ8: (style: LearningStyle) => void;
  /** v2: pick a coach. Writes both `q8_coach` and the matching `q8_style`. */
  setQ8Coach: (coach: CoachId) => void;
  setEmail: (email: string) => void;

  // --- v2: UTM / locale hydration ---
  setUtm: (utm: UtmContext) => void;
  hydrateFromUtm: () => void;
  setUiLocaleHint: (locale: string) => void;

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
    (set, get) => ({
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
      setQ4: () => {
        // v2 no-op — the old multi-select is retired. Kept so any stale
        // import doesn't crash the bundle.
      },
      setQ4Age: (age) =>
        set((s) => ({ answers: { ...s.answers, q4_age: age } })),
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
      setQ8Coach: (coach) =>
        set((s) => ({
          answers: {
            ...s.answers,
            q8_coach: coach,
            // Write the matching learning style too so the plan-template
            // matrix (which keys off style) keeps working unchanged.
            q8_style: COACHES[coach].style,
          },
        })),
      setEmail: (email) =>
        set((s) => ({ answers: { ...s.answers, q10_email: email } })),

      setUtm: (utm) =>
        set((s) => ({ answers: { ...s.answers, utm } })),
      hydrateFromUtm: () => {
        const { utm, q3_segment, q4_age } = get().answers;
        if (!utm) return;
        set((s) => {
          const next = { ...s.answers };
          // Only preseed when the user hasn't already answered — UTM hints
          // never overwrite a real answer.
          if (utm.segment_hint && !q3_segment) {
            next.q3_segment = utm.segment_hint;
            next.segment = utm.segment_hint;
          }
          if (utm.age_hint && !q4_age) {
            next.q4_age = utm.age_hint;
          }
          if (utm.lang_hint && !next.ui_locale_hint) {
            next.ui_locale_hint = utm.lang_hint;
          }
          return { answers: next };
        });
      },
      setUiLocaleHint: (locale) =>
        set((s) => ({
          answers: { ...s.answers, ui_locale_hint: locale },
        })),

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
