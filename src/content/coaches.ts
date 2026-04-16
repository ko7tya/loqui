import type { Coach, CoachId } from '@/lib/types';

/**
 * Coach content for the v2 Q8 coach-selection screen and the Q9 plan reveal
 * introduction block.
 *
 * Each coach maps to one of the four underlying `LearningStyle` archetypes
 * so the plan-template matrix keeps working. The Q8 setter writes both
 * `q8_coach` (new) and `q8_style` (legacy, plan-keyed) in lockstep.
 *
 * Voice: confident-premium. No gamification. No exclamation marks. Lines
 * are written to sound like someone you'd trust, not a category archetype.
 */

export const COACHES: Record<CoachId, Coach> = {
  marcus: {
    id: 'marcus',
    name: 'Marcus',
    accent: 'American',
    tagline: 'Fast, sharp, no warm-up.',
    vibe: 'Direct. Respects your time. Fixes mistakes on the spot.',
    style: 'drills',
    quotes: {
      career:
        "No warm-up. We start with the phrases that'll catch you out tomorrow.",
      test_prep:
        'Every minute has a job. You walk in knowing what\'s coming.',
      immigration:
        "You know enough. We sharpen what you have until it's sharp enough.",
      travel_social:
        'We skip the small talk. We build the lines that unlock real conversation.',
    },
  },
  elena: {
    id: 'elena',
    name: 'Elena',
    accent: 'British',
    tagline: 'Warm. Patient. Loves a good chat.',
    vibe:
      'Encouraging. The grammar sorts itself out when you stop worrying about it.',
    style: 'conversations',
    quotes: {
      career:
        "You know more than you think. We're going to chat until you hear it yourself.",
      test_prep:
        "The test is a conversation in disguise. We'll practice until it feels like one.",
      immigration:
        "Your first week is listening — to the conversations you'll actually have.",
      travel_social:
        'We start at the dinner table. Everything good comes from there.',
    },
  },
  aiko: {
    id: 'aiko',
    name: 'Aiko',
    accent: 'Australian',
    tagline: 'Every lesson is a scene.',
    vibe:
      'Playful. Role-plays. You learn by being somewhere, not memorising a list.',
    style: 'stories',
    quotes: {
      career:
        "Week 1 you're the customer. Week 2 you're the vendor. By week 4, nothing rattles you.",
      test_prep:
        'Every question is a role to step into. Own the role, the words arrive.',
      immigration:
        'The pharmacy. The school pickup. The Saturday barbecue. Real rooms, practised.',
      travel_social:
        "You're the new friend at the party. Let's make sure you get invited back.",
    },
  },
  david: {
    id: 'david',
    name: 'David',
    accent: 'Canadian',
    tagline: 'System first. Fluency follows.',
    vibe:
      'Methodical. Shows the pattern before the phrase. Nothing is ever random.',
    style: 'structured',
    quotes: {
      career:
        'Week 1 is the grammar backbone. Week 4 is polish. Everything stacks.',
      test_prep:
        'We rebuild the foundation first. Then every band-score increment is inevitable.',
      immigration:
        'System before vocabulary. Understand the pattern, own the phrases.',
      travel_social:
        'We start with the 80 verbs that carry 90% of English. Then we branch.',
    },
  },
};

export const COACHES_ORDER: readonly CoachId[] = [
  'marcus',
  'elena',
  'aiko',
  'david',
];

/**
 * Look up the coach id whose style matches a given learning style.
 * Used as a fallback on the Q9 reveal when `q8_coach` is missing but
 * `q8_style` is present (legacy saved sessions).
 */
export const coachByStyle = (
  style: Coach['style'] | undefined,
): CoachId | undefined => {
  if (!style) return undefined;
  return COACHES_ORDER.find((id) => COACHES[id].style === style);
};
