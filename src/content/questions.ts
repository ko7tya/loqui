import type {
  Segment,
  QuestionDefinition,
  WhoTalkingTo,
  Level,
  PriorApp,
  TimeCommitment,
  LearningStyle,
} from '@/lib/types';

/**
 * Question catalog.
 *
 * Day 1 deliverable: structural placeholders that mirror question-spec.md
 * §§Q1–Q10. Each question is typed by its answer so downstream renderers can
 * enforce correct shapes. Q5 is segment-aware (see `Q5_VARIANTS`).
 */

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
      description:
        'I work in English, but words slip away under pressure.',
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
      description:
        "Travel, my partner's family, friends, social confidence.",
      value: 'travel_social',
    },
  ],
};

export const Q4: QuestionDefinition<PriorApp> = {
  id: 'Q4_PRIOR_APPS',
  section: 'profile',
  headline: 'Have you tried English apps before?',
  sub_copy: 'No judgment — most of us have.',
  input: 'multi',
  options: [
    { id: 'duolingo', label: 'Duolingo', value: 'duolingo' },
    { id: 'babbel', label: 'Babbel', value: 'babbel' },
    { id: 'busuu', label: 'Busuu', value: 'busuu' },
    {
      id: 'italki_preply',
      label: 'A tutor on italki or Preply',
      value: 'italki_preply',
    },
    { id: 'none', label: 'None of these', value: 'none' },
  ],
};

/** Q5 is segment-aware: each segment has its own set of 4 moment options. */
export const Q5_VARIANTS: Record<
  Segment,
  ReadonlyArray<{ id: string; label: string }>
> = {
  career: [
    {
      id: 'standup',
      label: 'A stand-up where I can think on my feet',
    },
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
    {
      id: 'speaking',
      label: 'The speaking section of IELTS / TOEFL',
    },
    {
      id: 'writing',
      label: 'The writing section — clean, precise, on-brief',
    },
    {
      id: 'listening',
      label: 'Listening to native speakers at full speed',
    },
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

export const Q7 = {
  id: 'Q7_PHRASE_CHALLENGE',
  section: 'moment' as const,
  headline: 'Which one sounds most natural?',
  sub_copy: 'This is how a daily Loqui lesson feels.',
  input: 'phrase_challenge' as const,
};

export const Q8: QuestionDefinition<LearningStyle> = {
  id: 'Q8_LEARNING_STYLE',
  section: 'moment',
  headline: 'One more.',
  // sub_copy is segment-aware; see SEGMENT_Q8_SUBCOPY
  input: 'single',
  options: [
    {
      id: 'drills',
      label: 'Short, sharp drills',
      description: '5-minute focus bursts.',
      value: 'drills',
    },
    {
      id: 'conversations',
      label: 'Real conversations',
      description: 'I want to speak, not study.',
      value: 'conversations',
    },
    {
      id: 'stories',
      label: 'Stories and scenarios',
      description: 'I learn by being somewhere.',
      value: 'stories',
    },
    {
      id: 'structured',
      label: 'Structured lessons',
      description: 'Give me a syllabus.',
      value: 'structured',
    },
  ],
};

export const SEGMENT_Q8_SUBCOPY: Record<Segment, string> = {
  career: 'How do you learn best under work pressure?',
  test_prep: 'How should we drill this?',
  immigration: "What's going to fit into a messy week?",
  travel_social: 'What keeps it fun enough to stick with?',
};

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
