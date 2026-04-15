/**
 * Funnel state model — single source of truth for the 10-question flow.
 *
 * Shapes mirror question-spec.md §"State Model" verbatim, with a couple of
 * scaffolding helpers (`Plan` alias for `GeneratedPlan`, `PhraseChallenge`
 * for Q7 seed content).
 */

// --- Discriminated unions ---------------------------------------------------

export type Segment = 'career' | 'test_prep' | 'immigration' | 'travel_social';
export type Level =
  | 'getting_by'
  | 'conversational'
  | 'fluent_with_gaps'
  | 'near_native';
export type TimeCommitment = 10 | 20 | 45;
export type LearningStyle =
  | 'drills'
  | 'conversations'
  | 'stories'
  | 'structured';
export type PriorApp =
  | 'duolingo'
  | 'babbel'
  | 'busuu'
  | 'italki_preply'
  | 'none';
export type ReadinessAxis =
  | 'pronunciation'
  | 'lexical_range'
  | 'listening_speed'
  | 'register'
  | 'cultural_fluency';
export type WhoTalkingTo =
  | 'colleague'
  | 'stranger_abroad'
  | 'partner_family'
  | 'interviewer';
export type SessionType = 'drill' | 'dialogue' | 'scenario' | 'lesson';

export type PlanSource = 'claude' | 'fallback';

// --- Funnel state -----------------------------------------------------------

export interface FunnelState {
  q1_who_talking_to?: WhoTalkingTo;
  q2_level?: Level;
  q3_segment?: Segment;
  q4_prior_apps?: PriorApp[];
  q5_moment?: string;
  q5_moment_id?: string;
  q6_time?: TimeCommitment;
  /** Q7 migrated to Phrase Challenge (deterministic, no Claude). */
  q7_challenge?: Q7Answer;
  q8_style?: LearningStyle;
  q10_email?: string;

  segment?: Segment;
  generated_plan?: GeneratedPlan;
  plan_source: PlanSource;

  waitlist_position?: number;
  session_id: string;
  started_at: string;
  completed_at?: string;
}

// --- Q7 Phrase Challenge ----------------------------------------------------

/**
 * @deprecated-for-now-see-Q7Answer
 *
 * Legacy "type a phrase → AI feedback" shape. Kept for future Claude-powered
 * coaching mode; the live product renders the deterministic Phrase Challenge
 * (see `PhraseChallenge` below).
 */
export interface Q7AIResponse {
  what_worked: string;
  sharper_version: string;
  one_habit: string;
}

export interface Q7Answer {
  challenge_id: string;
  selected_option_id: string;
  was_correct: boolean;
}

// --- Plan schema ------------------------------------------------------------

export interface FocusAxis {
  axis: ReadinessAxis;
  why_for_you: string;
}

export interface PlanSession {
  name: string;
  duration_min: number;
  type: SessionType;
}

export interface PlanWeek {
  week: 1 | 2 | 3 | 4;
  title: string;
  theme: string;
  sessions: PlanSession[];
}

export interface GeneratedPlan {
  plan_name: string;
  tagline: string;
  the_moment: string;
  /** Exactly 2 focus axes. Enforced at runtime, loose at type level to avoid
   *  tuple friction when generators build the array piece by piece. */
  focus_axes: FocusAxis[];
  /** Exactly 4 weeks. Same looseness rationale as `focus_axes`. */
  weeks: PlanWeek[];
  outcome: string;
}

/** Convenience alias consumed by Claude + fallback integrations. */
export type Plan = GeneratedPlan;

// --- Claude request/response shape -----------------------------------------

export interface ClaudePlanRequest {
  segment: Segment;
  level_label: string;
  q5_moment: string;
  time_per_day: TimeCommitment;
  learning_style: LearningStyle;
  prior_apps: PriorApp[];
  user_phrase: string;
  q1_who: WhoTalkingTo;
}

export interface ClaudePlanResponse {
  plan: GeneratedPlan;
  model: string;
  latency_ms: number;
}

// --- Content authoring helpers ---------------------------------------------

/**
 * A Q7 Phrase Challenge seed.
 *
 * Users see a `context` sentence and three `options` — one natural, two off
 * in realistic ways. After they pick, we reveal `correct_explanation` plus
 * `takeaway`. Deterministic: no Claude round-trip, no spinner death.
 */
export interface PhraseChallengeOption {
  id: string;
  text: string;
  isCorrect: boolean;
  /** Shown when this option is wrong or as color on the correct one. */
  why?: string;
}

export interface PhraseChallenge {
  id: string;
  segment: Segment;
  /** Which levels this seed is appropriate for. */
  level_match: Level[];
  /** Setup sentence, e.g. "You're introducing yourself to a new client." */
  context: string;
  options: [PhraseChallengeOption, PhraseChallengeOption, PhraseChallengeOption];
  /** Revealed after any pick. */
  correct_explanation: string;
  /** "This is what a daily Loqui lesson feels like" variant. */
  takeaway: string;
}

/** Question definition used by the funnel screens. */
export interface QuestionDefinition<
  TAnswer extends string | number | string[] = string,
> {
  id: string;
  section: 'profile' | 'moment' | 'plan';
  headline: string;
  sub_copy?: string;
  input: 'single' | 'multi' | 'slider' | 'text' | 'email';
  options?: ReadonlyArray<{
    id: string;
    label: string;
    description?: string;
    value: TAnswer;
  }>;
}

export const SEGMENTS: readonly Segment[] = [
  'career',
  'test_prep',
  'immigration',
  'travel_social',
] as const;

export const LEVELS: readonly Level[] = [
  'getting_by',
  'conversational',
  'fluent_with_gaps',
  'near_native',
] as const;

export const LEVEL_LABELS: Record<Level, string> = {
  getting_by: 'Getting by',
  conversational: 'Conversational',
  fluent_with_gaps: 'Fluent with gaps',
  near_native: 'Near-native',
};

export const SEGMENT_LABELS: Record<Segment, string> = {
  career: 'For work',
  test_prep: 'For a test',
  immigration: 'For a move',
  travel_social: 'For life',
};
