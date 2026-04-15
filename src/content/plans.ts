import type {
  GeneratedPlan,
  Segment,
  TimeCommitment,
} from '@/lib/types';

/**
 * 12 deterministic plan templates — 4 segments × 3 time commitments.
 *
 * Voice: confident-premium. Adult, composed, smart. No exclamation marks,
 * no "AI-powered," no "supercharge," no gamified language.
 *
 * Slot placeholders resolved at render-time by `plan-generator.fillSlots`:
 *   {{moment}}  — the user's Q5 moment string (verbatim)
 *   {{level}}   — the user's Q2 level label (e.g. "Conversational")
 *   {{who}}     — the user's Q1 who-they-are-talking-to label
 *
 * Session counts per time band:
 *   10 min/day → 3 sessions/week, 10 min each
 *   20 min/day → 4 sessions/week, 20 min each
 *   45 min/day → 5 sessions/week, 45 min each (includes one long-form scenario)
 *
 * Each plan carries exactly 2 `focus_axes` and exactly 4 `weeks`.
 * Week 1 has named sessions; Weeks 2-4 leave sessions empty by design — the
 * Q9 reveal card surfaces Week 1 detail and the 4-week theme outline only.
 */

// ---------- Career ---------------------------------------------------------

const careerShared = {
  plan_name: 'The Stand-Up Plan',
  tagline: 'Four weeks to the moment you described.',
  the_moment: 'For: {{moment}}',
  focus_axes: [
    {
      axis: 'register' as const,
      why_for_you:
        "At {{level}}, the grammar's there. What's missing is tone — and that's what stops promotions.",
    },
    {
      axis: 'lexical_range' as const,
      why_for_you:
        "You know the words. We're building the second-choice word — the one that makes you sound precise.",
    },
  ],
  outcome:
    "By the end of Week 4, you'll walk into {{moment}} knowing exactly how you sound.",
};

const career10: GeneratedPlan = {
  ...careerShared,
  weeks: [
    {
      week: 1,
      title: 'Clean baseline',
      theme: 'Three workplace openers, drilled to automatic.',
      sessions: [
        { name: 'The stand-up opener', duration_min: 10, type: 'drill' },
        {
          name: 'Saying no without apologizing',
          duration_min: 10,
          type: 'drill',
        },
        {
          name: 'Asking a clarifying question that lands',
          duration_min: 10,
          type: 'drill',
        },
      ],
    },
    {
      week: 2,
      title: 'Thinking on your feet',
      theme: 'Stalling phrases, reframes, buying time without sounding lost.',
      sessions: [],
    },
    {
      week: 3,
      title: 'The hard conversation',
      theme: 'Pushback, constructive disagreement, the difficult ask.',
      sessions: [],
    },
    {
      week: 4,
      title: 'Your moment',
      theme: 'Full rehearsal of {{moment}}, recorded and coached.',
      sessions: [],
    },
  ],
};

const career20: GeneratedPlan = {
  ...careerShared,
  weeks: [
    {
      week: 1,
      title: 'Clean baseline',
      theme: 'Five workplace scripts, spoken until they are automatic.',
      sessions: [
        { name: 'The stand-up opener', duration_min: 20, type: 'drill' },
        {
          name: 'Disagreeing without softening too much',
          duration_min: 20,
          type: 'dialogue',
        },
        {
          name: 'Asking for what you need — three registers',
          duration_min: 20,
          type: 'drill',
        },
        {
          name: 'The update nobody wants to give',
          duration_min: 20,
          type: 'scenario',
        },
      ],
    },
    {
      week: 2,
      title: 'Thinking on your feet',
      theme: 'Stalling phrases, reframes, buying time without sounding lost.',
      sessions: [],
    },
    {
      week: 3,
      title: 'The hard conversation',
      theme: 'Pushback, constructive disagreement, the difficult ask.',
      sessions: [],
    },
    {
      week: 4,
      title: 'Your moment',
      theme: 'Full rehearsal of {{moment}}, recorded and coached.',
      sessions: [],
    },
  ],
};

const career45: GeneratedPlan = {
  ...careerShared,
  weeks: [
    {
      week: 1,
      title: 'Clean baseline',
      theme: 'Register drills, role-plays, and one long-form workplace scene.',
      sessions: [
        { name: 'The stand-up opener', duration_min: 45, type: 'drill' },
        {
          name: 'Disagreeing without softening too much',
          duration_min: 45,
          type: 'dialogue',
        },
        {
          name: 'Asking for what you need — three registers',
          duration_min: 45,
          type: 'drill',
        },
        {
          name: 'The 1-on-1 you have been putting off',
          duration_min: 45,
          type: 'dialogue',
        },
        {
          name: 'Cross-team escalation — the long version',
          duration_min: 45,
          type: 'scenario',
        },
      ],
    },
    {
      week: 2,
      title: 'Thinking on your feet',
      theme:
        'Stalling phrases, reframes, the recovery line after a wrong turn.',
      sessions: [],
    },
    {
      week: 3,
      title: 'The hard conversation',
      theme: 'Pushback, constructive disagreement, the difficult ask.',
      sessions: [],
    },
    {
      week: 4,
      title: 'Your moment',
      theme: 'Full rehearsal of {{moment}}, recorded, coached, iterated.',
      sessions: [],
    },
  ],
};

// ---------- Test prep ------------------------------------------------------

const testPrepShared = {
  plan_name: 'The Band Score Plan',
  tagline: 'Built backwards from your test date.',
  the_moment: 'For: {{moment}}',
  focus_axes: [
    {
      axis: 'listening_speed' as const,
      why_for_you:
        'Most test losses are comprehension losses. We train the ear before the mouth.',
    },
    {
      axis: 'register' as const,
      why_for_you:
        'Examiners reward range and control. We build both without padding.',
    },
  ],
  outcome:
    "By the end of Week 4, you'll walk into {{moment}} with a scoring strategy, not a wish.",
};

const testPrep10: GeneratedPlan = {
  ...testPrepShared,
  weeks: [
    {
      week: 1,
      title: 'Scoring map',
      theme: 'Three targeted drills on the sections that move your band most.',
      sessions: [
        {
          name: 'Part 1 warm-up — 20 questions, tight answers',
          duration_min: 10,
          type: 'drill',
        },
        {
          name: 'Listening — one transcript, one replay, one diff',
          duration_min: 10,
          type: 'drill',
        },
        {
          name: 'Writing Task 1 — opener, body, register check',
          duration_min: 10,
          type: 'drill',
        },
      ],
    },
    {
      week: 2,
      title: 'Range under pressure',
      theme: 'Synonyms, linkers, and the band 7 vocabulary band.',
      sessions: [],
    },
    {
      week: 3,
      title: 'Timing and nerve',
      theme: 'Section-length rehearsals at full pace, no restarts.',
      sessions: [],
    },
    {
      week: 4,
      title: 'Test week',
      theme: 'Mock {{moment}} under real conditions, then a tight debrief.',
      sessions: [],
    },
  ],
};

const testPrep20: GeneratedPlan = {
  ...testPrepShared,
  weeks: [
    {
      week: 1,
      title: 'Scoring map',
      theme: 'Diagnose the gaps that actually move your band.',
      sessions: [
        {
          name: 'Speaking Part 1 — fluency over fact',
          duration_min: 20,
          type: 'drill',
        },
        {
          name: 'Listening — full-speed native dialogue',
          duration_min: 20,
          type: 'drill',
        },
        {
          name: 'Writing Task 2 — structure and stance',
          duration_min: 20,
          type: 'lesson',
        },
        {
          name: 'Reading — scanning under the clock',
          duration_min: 20,
          type: 'drill',
        },
      ],
    },
    {
      week: 2,
      title: 'Range under pressure',
      theme: 'Band 7+ vocabulary and the linkers that signal control.',
      sessions: [],
    },
    {
      week: 3,
      title: 'Timing and nerve',
      theme: 'Section-length rehearsals at full pace, no restarts.',
      sessions: [],
    },
    {
      week: 4,
      title: 'Test week',
      theme: 'Mock {{moment}} under real conditions, then a tight debrief.',
      sessions: [],
    },
  ],
};

const testPrep45: GeneratedPlan = {
  ...testPrepShared,
  weeks: [
    {
      week: 1,
      title: 'Scoring map',
      theme: 'Diagnostic mock, gap analysis, five drill types per day.',
      sessions: [
        {
          name: 'Speaking Parts 1 and 2 — back to back',
          duration_min: 45,
          type: 'drill',
        },
        {
          name: 'Listening — two full sections with transcript review',
          duration_min: 45,
          type: 'drill',
        },
        {
          name: 'Writing Task 2 — full answer with coached revision',
          duration_min: 45,
          type: 'lesson',
        },
        {
          name: 'Reading — one full passage under the clock',
          duration_min: 45,
          type: 'drill',
        },
        {
          name: 'Full section rehearsal — exam pacing only',
          duration_min: 45,
          type: 'scenario',
        },
      ],
    },
    {
      week: 2,
      title: 'Range under pressure',
      theme: 'Band 7+ vocabulary, linkers, and the pronunciation that scores.',
      sessions: [],
    },
    {
      week: 3,
      title: 'Timing and nerve',
      theme: 'Back-to-back sections at full pace, recorded and reviewed.',
      sessions: [],
    },
    {
      week: 4,
      title: 'Test week',
      theme: 'Mock {{moment}} under real conditions, then a tight debrief.',
      sessions: [],
    },
  ],
};

// ---------- Immigration ----------------------------------------------------

const immigrationShared = {
  plan_name: 'The Settled-In Plan',
  tagline: 'Four weeks. One better week at a time.',
  the_moment: 'For: {{moment}}',
  focus_axes: [
    {
      axis: 'cultural_fluency' as const,
      why_for_you:
        'Words are only half of belonging. The other half is reading the room, and that is trainable.',
    },
    {
      axis: 'lexical_range' as const,
      why_for_you:
        'At {{level}}, the next unlock is the everyday word most textbooks skip — the one that sounds like home.',
    },
  ],
  outcome:
    "By the end of Week 4, you'll walk into {{moment}} sounding like someone who lives here.",
};

const immigration10: GeneratedPlan = {
  ...immigrationShared,
  weeks: [
    {
      week: 1,
      title: 'The first week out',
      theme: 'Three everyday scripts you will use within seven days.',
      sessions: [
        {
          name: 'The small-talk opener that actually lands',
          duration_min: 10,
          type: 'drill',
        },
        {
          name: 'Asking for something at a counter',
          duration_min: 10,
          type: 'drill',
        },
        {
          name: 'The polite no, the polite follow-up',
          duration_min: 10,
          type: 'drill',
        },
      ],
    },
    {
      week: 2,
      title: 'Everyday bureaucracy',
      theme: 'The vocabulary of forms, appointments, and phone queues.',
      sessions: [],
    },
    {
      week: 3,
      title: 'Social texture',
      theme: 'Humor, context, the right amount of warmth.',
      sessions: [],
    },
    {
      week: 4,
      title: 'Your moment',
      theme: 'Rehearsal of {{moment}}, played forward with the right register.',
      sessions: [],
    },
  ],
};

const immigration20: GeneratedPlan = {
  ...immigrationShared,
  weeks: [
    {
      week: 1,
      title: 'The first week out',
      theme: 'The daily scripts that make the new city feel navigable.',
      sessions: [
        {
          name: 'The small-talk opener that actually lands',
          duration_min: 20,
          type: 'dialogue',
        },
        {
          name: 'At the counter — pharmacy, bank, post office',
          duration_min: 20,
          type: 'scenario',
        },
        {
          name: 'The school pickup, without the awkward silence',
          duration_min: 20,
          type: 'dialogue',
        },
        {
          name: 'The polite no, the polite follow-up',
          duration_min: 20,
          type: 'drill',
        },
      ],
    },
    {
      week: 2,
      title: 'Everyday bureaucracy',
      theme: 'Appointments, leases, forms — the language that unblocks life.',
      sessions: [],
    },
    {
      week: 3,
      title: 'Social texture',
      theme: 'Humor, context, the right amount of warmth.',
      sessions: [],
    },
    {
      week: 4,
      title: 'Your moment',
      theme: 'Full rehearsal of {{moment}}, with the register of the place you live.',
      sessions: [],
    },
  ],
};

const immigration45: GeneratedPlan = {
  ...immigrationShared,
  weeks: [
    {
      week: 1,
      title: 'The first week out',
      theme: 'Daily scripts, a long-form scene, and a listening-speed climb.',
      sessions: [
        {
          name: 'The small-talk opener that actually lands',
          duration_min: 45,
          type: 'dialogue',
        },
        {
          name: 'At the counter — pharmacy, bank, post office',
          duration_min: 45,
          type: 'scenario',
        },
        {
          name: 'The school pickup, without the awkward silence',
          duration_min: 45,
          type: 'dialogue',
        },
        {
          name: 'The polite no, the polite follow-up',
          duration_min: 45,
          type: 'drill',
        },
        {
          name: 'A full morning in the neighborhood — long-form scenario',
          duration_min: 45,
          type: 'scenario',
        },
      ],
    },
    {
      week: 2,
      title: 'Everyday bureaucracy',
      theme: 'Appointments, leases, forms — the language that unblocks life.',
      sessions: [],
    },
    {
      week: 3,
      title: 'Social texture',
      theme: 'Humor, context, the right amount of warmth.',
      sessions: [],
    },
    {
      week: 4,
      title: 'Your moment',
      theme: 'Full rehearsal of {{moment}}, recorded and coached end to end.',
      sessions: [],
    },
  ],
};

// ---------- Travel / social ------------------------------------------------

const travelSocialShared = {
  plan_name: 'The Host-Table Plan',
  tagline: "Four weeks. By the end, you'll sound like you.",
  the_moment: 'For: {{moment}}',
  focus_axes: [
    {
      axis: 'cultural_fluency' as const,
      why_for_you:
        'Fluency in a room is half language, half read. We train the read alongside the words.',
    },
    {
      axis: 'pronunciation' as const,
      why_for_you:
        'At {{level}}, the content is there. A cleaner delivery is what makes a story land.',
    },
  ],
  outcome:
    "By the end of Week 4, you'll walk into {{moment}} talking with people, not at them.",
};

const travelSocial10: GeneratedPlan = {
  ...travelSocialShared,
  weeks: [
    {
      week: 1,
      title: 'Warm openers',
      theme: 'Three ways to start a conversation that does not stall.',
      sessions: [
        {
          name: 'The three-second opener',
          duration_min: 10,
          type: 'drill',
        },
        {
          name: 'A follow-up question that earns a real answer',
          duration_min: 10,
          type: 'drill',
        },
        {
          name: 'The soft exit — leave without it being awkward',
          duration_min: 10,
          type: 'drill',
        },
      ],
    },
    {
      week: 2,
      title: 'Stories that land',
      theme: 'Telling a short story with shape — setup, turn, payoff.',
      sessions: [],
    },
    {
      week: 3,
      title: 'Hosts and guests',
      theme: 'Gratitude, jokes, deflections — the social glue vocabulary.',
      sessions: [],
    },
    {
      week: 4,
      title: 'Your moment',
      theme: 'Rehearsal of {{moment}}, from the first hello to the last laugh.',
      sessions: [],
    },
  ],
};

const travelSocial20: GeneratedPlan = {
  ...travelSocialShared,
  weeks: [
    {
      week: 1,
      title: 'Warm openers',
      theme: 'Openers, follow-ups, and the rhythm of a real back-and-forth.',
      sessions: [
        {
          name: 'The three-second opener',
          duration_min: 20,
          type: 'drill',
        },
        {
          name: 'A follow-up question that earns a real answer',
          duration_min: 20,
          type: 'dialogue',
        },
        {
          name: 'The soft exit — leave without it being awkward',
          duration_min: 20,
          type: 'drill',
        },
        {
          name: 'A five-minute dinner scene',
          duration_min: 20,
          type: 'scenario',
        },
      ],
    },
    {
      week: 2,
      title: 'Stories that land',
      theme: 'Telling a short story with shape — setup, turn, payoff.',
      sessions: [],
    },
    {
      week: 3,
      title: 'Hosts and guests',
      theme: 'Gratitude, jokes, deflections — the social glue vocabulary.',
      sessions: [],
    },
    {
      week: 4,
      title: 'Your moment',
      theme: 'Full rehearsal of {{moment}}, from the first hello to the last laugh.',
      sessions: [],
    },
  ],
};

const travelSocial45: GeneratedPlan = {
  ...travelSocialShared,
  weeks: [
    {
      week: 1,
      title: 'Warm openers',
      theme: 'Openers, follow-ups, and a long-form dinner-table rehearsal.',
      sessions: [
        {
          name: 'The three-second opener',
          duration_min: 45,
          type: 'drill',
        },
        {
          name: 'A follow-up question that earns a real answer',
          duration_min: 45,
          type: 'dialogue',
        },
        {
          name: 'The soft exit — leave without it being awkward',
          duration_min: 45,
          type: 'drill',
        },
        {
          name: 'A five-minute dinner scene',
          duration_min: 45,
          type: 'scenario',
        },
        {
          name: 'A full dinner — arrival, mains, the story you tell',
          duration_min: 45,
          type: 'scenario',
        },
      ],
    },
    {
      week: 2,
      title: 'Stories that land',
      theme: 'Telling a short story with shape — setup, turn, payoff.',
      sessions: [],
    },
    {
      week: 3,
      title: 'Hosts and guests',
      theme: 'Gratitude, jokes, deflections — the social glue vocabulary.',
      sessions: [],
    },
    {
      week: 4,
      title: 'Your moment',
      theme: 'Full rehearsal of {{moment}}, recorded and coached end to end.',
      sessions: [],
    },
  ],
};

// ---------- Matrix ---------------------------------------------------------

export const PLAN_TEMPLATES: Record<
  Segment,
  Record<TimeCommitment, GeneratedPlan>
> = {
  career: {
    10: career10,
    20: career20,
    45: career45,
  },
  test_prep: {
    10: testPrep10,
    20: testPrep20,
    45: testPrep45,
  },
  immigration: {
    10: immigration10,
    20: immigration20,
    45: immigration45,
  },
  travel_social: {
    10: travelSocial10,
    20: travelSocial20,
    45: travelSocial45,
  },
};
