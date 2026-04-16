import type {
  Segment,
  QuestionDefinition,
  WhoTalkingTo,
  Level,
  AgeBracket,
  TimeCommitment,
} from '@/lib/types';
import { AGE_BRACKETS_CONTENT } from './age-brackets';

/**
 * Question catalog.
 *
 * v2 shifts:
 *   - Q4 now captures `AgeBracket` (see `age-brackets.ts`) instead of prior
 *     app usage. The old multi-select is retired.
 *   - Q8 is a coach picker (see `coaches.ts`). No `QuestionDefinition<>`
 *     shape — coaches render with their own card UI.
 *   - Dual copy: every top-of-funnel question has a `_SIMPLE_*` variant that
 *     the `pickCopy` helper swaps in when Q2 level is `getting_by`.
 */

// --- Q1: Vision opener ------------------------------------------------------

export const Q1: QuestionDefinition<WhoTalkingTo> = {
  id: 'Q1_WHO_TALKING_TO',
  section: 'profile',
  headline: 'When you imagine speaking fluently, who are you talking to?',
  input: 'single',
  options: [
    { id: 'colleague', label: 'A colleague in a meeting', value: 'colleague' },
    {
      id: 'stranger_abroad',
      label: 'A stranger at a bar abroad',
      value: 'stranger_abroad',
    },
    {
      id: 'partner_family',
      label: "My partner's family",
      value: 'partner_family',
    },
    {
      id: 'interviewer',
      label: 'An interviewer across the table',
      value: 'interviewer',
    },
  ],
};

/** Simple-English variant for Q1 (shown when Q2 level === 'getting_by'). */
export const Q1_SIMPLE_HEADLINE =
  'Who do you want to talk to in English?';

// --- Q2: Current level ------------------------------------------------------

export const Q2: QuestionDefinition<Level> = {
  id: 'Q2_CURRENT_LEVEL',
  section: 'profile',
  headline: 'Where are you right now?',
  sub_copy: 'Be honest — the plan adapts.',
  input: 'single',
  options: [
    {
      id: 'getting_by',
      label: 'Getting by',
      description: 'I can order food and ask for directions.',
      value: 'getting_by',
    },
    {
      id: 'conversational',
      label: 'Conversational',
      description: 'I can hold a chat, but I lose the thread fast.',
      value: 'conversational',
    },
    {
      id: 'fluent_with_gaps',
      label: 'Fluent with gaps',
      description: 'I work in English, but words slip away under pressure.',
      value: 'fluent_with_gaps',
    },
    {
      id: 'near_native',
      label: 'Near-native',
      description: 'I want polish, idiom, and register.',
      value: 'near_native',
    },
  ],
};

/**
 * Short-sentence, common-verb descriptions used when the user has already
 * picked `getting_by` — the shell swaps in these when available. The labels
 * stay the same; only the helper descriptions simplify.
 *
 * (Q2 is shown BEFORE the level is known, but we still offer a simple set
 * for pages that render Q2 after a restart.)
 */
export const Q2_SIMPLE_DESCRIPTIONS: Record<Level, string> = {
  getting_by: 'I can order food. I can ask for the way.',
  conversational: 'I can talk, but I get lost sometimes.',
  fluent_with_gaps: 'I use English at work. Sometimes words are hard to find.',
  near_native: 'I want to sound better. Small mistakes, big polish.',
};

// --- Q3: Segment detector ---------------------------------------------------

export const Q3: QuestionDefinition<Segment> = {
  id: 'Q3_WHY_LEARNING',
  section: 'profile',
  headline: 'Why are you learning English?',
  sub_copy: 'Your plan shifts based on this one.',
  input: 'single',
  options: [
    {
      id: 'career',
      label: 'For work',
      description:
        'I need English for my job, career moves, or doing business.',
      value: 'career',
    },
    {
      id: 'test_prep',
      label: 'For a test',
      description: 'IELTS, TOEFL, Cambridge, or Duolingo English Test.',
      value: 'test_prep',
    },
    {
      id: 'immigration',
      label: 'For a move',
      description: "I'm relocating, already abroad, or planning a visa.",
      value: 'immigration',
    },
    {
      id: 'travel_social',
      label: 'For life',
      description: "Travel, my partner's family, friends, social confidence.",
      value: 'travel_social',
    },
  ],
};

// --- Q4 (v2): Age bracket ---------------------------------------------------

export const Q4: QuestionDefinition<AgeBracket> = {
  id: 'Q4_AGE',
  section: 'profile',
  headline: 'How old are you?',
  sub_copy: 'We lean the plan on what people like you care about most.',
  input: 'single',
  options: AGE_BRACKETS_CONTENT.map((b) => ({
    id: b.id,
    label: b.label,
    description: b.description,
    value: b.id,
  })),
};

// --- Q5: Specific moment (segment-aware) -----------------------------------

export const Q5_VARIANTS: Record<
  Segment,
  ReadonlyArray<{ id: string; label: string }>
> = {
  career: [
    { id: 'standup', label: 'A stand-up where I can think on my feet' },
    {
      id: 'negotiation',
      label: "A negotiation where I don't lose the argument",
    },
    {
      id: 'presentation',
      label: 'A presentation where I sound like the expert I am',
    },
    {
      id: 'review',
      label: 'A performance review where I advocate for myself',
    },
  ],
  test_prep: [
    { id: 'speaking', label: 'The speaking section of IELTS / TOEFL' },
    {
      id: 'writing',
      label: 'The writing section — clean, precise, on-brief',
    },
    { id: 'listening', label: 'Listening to native speakers at full speed' },
    { id: 'band_score', label: 'The whole thing — I want the band score' },
  ],
  immigration: [
    { id: 'visa', label: 'A visa or immigration interview' },
    {
      id: 'smalltalk',
      label: 'Small talk with neighbors, colleagues, the school pickup',
    },
    {
      id: 'appointment',
      label: "A doctor's appointment or a lease signing",
    },
    { id: 'belonging', label: 'Just sounding like I belong' },
  ],
  travel_social: [
    { id: 'family_dinner', label: "Dinner with my partner's family" },
    {
      id: 'conversation',
      label: 'A conversation that goes past "where are you from?"',
    },
    { id: 'party_story', label: 'A story I tell well at a party' },
    {
      id: 'travel_friction',
      label: 'Travel — hotels, trains, a problem at the airport',
    },
  ],
};

/** Simple-English variant for Q5 headline (shown when level === 'getting_by'). */
export const Q5_SIMPLE_HEADLINE = 'Which moment do you want to be good at?';

// --- Q6: Time commitment ----------------------------------------------------

export const Q6: QuestionDefinition<TimeCommitment> = {
  id: 'Q6_TIME_COMMITMENT',
  section: 'moment',
  headline: 'How much time can you actually give this?',
  sub_copy: 'Be realistic. The plan only works if you show up.',
  input: 'single',
  options: [
    {
      id: '10',
      label: '10 min / day',
      description: 'Small, consistent, background-level.',
      value: 10,
    },
    {
      id: '20',
      label: '20 min / day',
      description: 'A real habit. Most people pick this.',
      value: 20,
    },
    {
      id: '45',
      label: '45 min / day',
      description: 'Accelerated. You want this finished.',
      value: 45,
    },
  ],
};

export const Q6_SIMPLE_HEADLINE = 'How many minutes a day?';

// --- Q7: Phrase challenge (meta, renders its own UI) ------------------------

export const Q7 = {
  id: 'Q7_PHRASE_CHALLENGE',
  section: 'moment' as const,
  headline: 'Which one sounds most natural?',
  sub_copy: 'This is how a daily Loqui lesson feels.',
  input: 'phrase_challenge' as const,
};

export const Q7_SIMPLE_SUBCOPY = 'This is how a Loqui lesson works.';

// --- Q8 (v2): Pick your coach ----------------------------------------------

export const Q8 = {
  id: 'Q8_COACH' as const,
  section: 'moment' as const,
  headline: 'Pick your coach.',
  sub_copy: 'Four people. Four ways to teach you. One is for you.',
  input: 'coach' as const,
};

/**
 * Segment-aware framing line that sits above the coach grid. Rewritten for
 * v2 to match the coach-selection mental model rather than the retired
 * learning-style mental model.
 */
export const SEGMENT_Q8_SUBCOPY: Record<Segment, string> = {
  career: 'Pick who keeps you honest under work pressure.',
  test_prep: 'Pick who gets you to the band you came for.',
  immigration: 'Pick who fits into a messy week.',
  travel_social: 'Pick who makes this fun enough to stick with.',
};

// --- Q10: Email capture -----------------------------------------------------

export const Q10 = {
  id: 'Q10_EMAIL' as const,
  section: 'plan' as const,
  headline: 'Where should we send it?',
  input: 'email' as const,
  submit_label: 'Send me my plan',
  fine_print: 'No spam. Unsubscribe in one click.',
};

export const SEGMENT_Q10_SUBCOPY: Record<Segment, string> = {
  career: "Your plan, plus Monday's first session.",
  test_prep: "Your plan, plus this week's drills.",
  immigration: "Your plan, plus tomorrow's first step.",
  travel_social: 'Your plan, plus your first scenario.',
};

// --- Helper ----------------------------------------------------------------

/**
 * Pick between standard and simple copy. Simple copy is shown to users who
 * answered Q2 with `getting_by` — shorter sentences, common verbs only.
 *
 * Usage:
 *   const title = pickCopy(level, Q5.headline, Q5_SIMPLE_HEADLINE);
 */
export function pickCopy<T>(level: Level | undefined, standard: T, simple: T): T {
  return level === 'getting_by' ? simple : standard;
}
