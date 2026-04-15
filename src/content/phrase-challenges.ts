import type { PhraseChallenge, Segment, Level } from '@/lib/types';

/**
 * Q7 Phrase Challenge library — deterministic multiple-choice seeds.
 *
 * Each seed gives the user a tiny, realistic situation and three English
 * phrasings attempting the same intent. One sounds natural; two are off in
 * ways real learners actually confuse — wrong preposition, awkward register,
 * overliteral translation. Picking is cheap; the *reveal* teaches.
 *
 * Coverage:
 *   career × conversational
 *   career × fluent_with_gaps
 *   test_prep × conversational
 *   immigration × getting_by
 *   immigration × conversational
 *   travel_social × conversational
 */
export const PHRASE_CHALLENGES: readonly PhraseChallenge[] = [
  // ── CAREER × CONVERSATIONAL ─────────────────────────────────────────────
  {
    id: 'career_conv_intro',
    segment: 'career',
    level_match: ['conversational', 'fluent_with_gaps'],
    context:
      "You're introducing yourself to a new client on your first video call.",
    options: [
      {
        id: 'a',
        text: "Hi, I'm Maya. I will be your main contact going forward.",
        isCorrect: true,
        why: 'Warm, confident, and sets expectations in one line.',
      },
      {
        id: 'b',
        text: "Hello, I'm Maya. I am responsible for you from now.",
        isCorrect: false,
        why: '"Responsible for you" sounds like you\'re their manager, not their contact.',
      },
      {
        id: 'c',
        text: "Hi, I'm Maya. I will be the contact person of you henceforth.",
        isCorrect: false,
        why: '"Of you henceforth" is two small register mistakes at once — preposition and an overly formal word.',
      },
    ],
    correct_explanation:
      '"I\'ll be your main contact going forward" is the phrasing a native professional would reach for. It positions you as helpful, not hierarchical.',
    takeaway:
      'A Loqui lesson breaks one of these moments down until it feels obvious.',
  },

  // ── CAREER × FLUENT_WITH_GAPS ───────────────────────────────────────────
  {
    id: 'career_fluent_pushback',
    segment: 'career',
    level_match: ['fluent_with_gaps', 'near_native'],
    context:
      'Your manager asks if you can deliver the report by Friday. You need more time — without sounding resistant.',
    options: [
      {
        id: 'a',
        text: 'I can, but the quality will suffer. Monday would be safer.',
        isCorrect: true,
        why: 'States the trade-off and proposes a fix in one breath.',
      },
      {
        id: 'b',
        text: "I'm afraid it's impossible for me to do that until Friday.",
        isCorrect: false,
        why: '"Impossible" is absolute and shuts the door. "Until" should be "by" here.',
      },
      {
        id: 'c',
        text: "Friday is a bit tight on me. Can we discuss?",
        isCorrect: false,
        why: '"A bit tight on me" sounds translated. Native phrasing is "tight for me" — and "discuss" without an object is stiff.',
      },
    ],
    correct_explanation:
      'Pushback works best when it frames the trade-off honestly and offers an alternative. "Monday would be safer" lets your manager choose the quality bar.',
    takeaway:
      'This is the register work we do every week — moments where grammar is fine but tone decides outcomes.',
  },

  // ── TEST_PREP × CONVERSATIONAL ──────────────────────────────────────────
  {
    id: 'test_prep_conv_skill',
    segment: 'test_prep',
    level_match: ['conversational', 'fluent_with_gaps'],
    context:
      'IELTS Speaking Part 2. You\'re describing a skill you would like to learn. You have two minutes.',
    options: [
      {
        id: 'a',
        text: "I'd like to learn to cook properly — not recipes, but the instincts behind them.",
        isCorrect: true,
        why: 'Specific, structured, and shows range — examiners score exactly this.',
      },
      {
        id: 'b',
        text: 'I want to learn the cooking because it is a very useful skill in life.',
        isCorrect: false,
        why: '"The cooking" is a direct-translation slip; "a very useful skill" is the kind of filler that pulls bands down.',
      },
      {
        id: 'c',
        text: 'I would want to learn cooking so that I can cook food for my family.',
        isCorrect: false,
        why: '"Would want" is non-standard for preferences; the reason circles back on itself.',
      },
    ],
    correct_explanation:
      'Speaking Part 2 rewards specificity and structure over vocabulary. Open with the skill, add a contrast ("not recipes, but…"), and you already sound like a Band 7 response.',
    takeaway:
      'Every Loqui drill has the same shape — small, specific, and aimed at the score criteria.',
  },

  // ── IMMIGRATION × GETTING_BY ────────────────────────────────────────────
  {
    id: 'immigration_getting_by_doctor',
    segment: 'immigration',
    level_match: ['getting_by', 'conversational'],
    context:
      "At a doctor's appointment. You want to explain that the pain started two days ago.",
    options: [
      {
        id: 'a',
        text: "It started two days ago — it's a dull ache, not sharp.",
        isCorrect: true,
        why: 'Clear, specific, and gives the doctor exactly what they need.',
      },
      {
        id: 'b',
        text: 'Since two days I have this pain, it is not so sharp.',
        isCorrect: false,
        why: '"Since two days" is a common slip — native speakers say "for two days" or "It started two days ago."',
      },
      {
        id: 'c',
        text: 'The pain is from two days before and is a little dull one.',
        isCorrect: false,
        why: '"From two days before" mixes up time phrases; "a little dull one" drifts away from the subject.',
      },
    ],
    correct_explanation:
      'Doctors in English-speaking countries expect "It started [time] ago" plus one sensory word (dull, sharp, throbbing, burning). That single frame handles most appointments.',
    takeaway:
      'A Loqui daily scenario is exactly this — five minutes to own one appointment-sized moment.',
  },

  // ── IMMIGRATION × CONVERSATIONAL ────────────────────────────────────────
  {
    id: 'immigration_conv_neighbor',
    segment: 'immigration',
    level_match: ['conversational', 'fluent_with_gaps'],
    context:
      'Your new neighbor asks how you are settling in. You want the conversation to keep going.',
    options: [
      {
        id: 'a',
        text: "Slowly but steadily — the bakery down the road is keeping me sane. Have you tried it?",
        isCorrect: true,
        why: 'Answers the question, offers a detail, returns a question. Classic rally.',
      },
      {
        id: 'b',
        text: 'It is going well, thank you very much for asking about it.',
        isCorrect: false,
        why: 'Polite but closed. The conversation ends right here.',
      },
      {
        id: 'c',
        text: "I'm settling myself, yes. The neighborhood has many nice things.",
        isCorrect: false,
        why: '"Settling myself" isn\'t quite idiomatic; "many nice things" is vague and sounds translated.',
      },
    ],
    correct_explanation:
      'Small talk is a rally, not a serve. Answer, offer one concrete detail, then lob a question back. You\'ve just turned a greeting into a relationship.',
    takeaway:
      'This is the cultural-fluency axis of your Loqui plan — the moves that make people remember you.',
  },

  // ── TRAVEL_SOCIAL × CONVERSATIONAL ──────────────────────────────────────
  {
    id: 'travel_conv_cafe',
    segment: 'travel_social',
    level_match: ['conversational', 'fluent_with_gaps'],
    context:
      "You're at a café in London. You want a flat white with oat milk, and to sit by the window.",
    options: [
      {
        id: 'a',
        text: "Could I get a flat white with oat milk — and is that window seat free?",
        isCorrect: true,
        why: 'Polite, natural rhythm, bundles both requests into one easy exchange.',
      },
      {
        id: 'b',
        text: 'I would like to order one flat white on oat milk, please. Also the window seat, is it possible?',
        isCorrect: false,
        why: '"On oat milk" should be "with"; "is it possible" is over-formal for a café.',
      },
      {
        id: 'c',
        text: 'Give me a flat white with the oat milk. I will take that seat near the window.',
        isCorrect: false,
        why: '"Give me" reads as a command in English; "the oat milk" treats it like a specific known item.',
      },
    ],
    correct_explanation:
      '"Could I get…" is the native default for ordering. Stacking related requests ("— and is that window seat free?") sounds fluent, not rehearsed.',
    takeaway:
      'Scenarios like this are what a Loqui session feels like — five minutes, one moment, earned by the end of it.',
  },
];

/**
 * Pick the best seed for a user. Prefers exact (segment, level) match, then
 * same-segment fallback, then first seed overall so the UI never renders
 * empty.
 */
export const getSeedFor = (
  segment: Segment | undefined,
  level: Level | undefined,
): PhraseChallenge => {
  if (segment && level) {
    const exact = PHRASE_CHALLENGES.find(
      (s) => s.segment === segment && s.level_match.includes(level),
    );
    if (exact) return exact;
  }
  const bySegment = PHRASE_CHALLENGES.find((s) => s.segment === segment);
  return bySegment ?? PHRASE_CHALLENGES[0];
};
