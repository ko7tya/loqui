import type { Segment, ReadinessAxis } from '@/lib/types';

/**
 * Segment definitions — the 4 canonical personas the funnel branches on.
 * Referenced by Q3 (segment detection), Q5 (moment menus), Q7 (seed
 * selection), and Q9 (plan naming + focus axes).
 */

export interface SegmentDefinition {
  id: Segment;
  label: string;
  description: string;
  q9_sub_copy: string;
  plan_name_template: string;
  default_focus_axes: ReadinessAxis[];
  social_proof_count: number;
  social_proof_noun: string;
  waitlist_base: number;
}

export const SEGMENT_DEFS: Record<Segment, SegmentDefinition> = {
  career: {
    id: 'career',
    label: 'For work',
    description:
      'I need English for my job, career moves, or doing business.',
    q9_sub_copy: 'Four weeks to the moment you described.',
    plan_name_template: 'The {{moment}} Plan',
    default_focus_axes: ['register', 'lexical_range'],
    social_proof_count: 47823,
    social_proof_noun: 'professionals',
    waitlist_base: 8412,
  },
  test_prep: {
    id: 'test_prep',
    label: 'For a test',
    description: 'IELTS, TOEFL, Cambridge, or Duolingo English Test.',
    q9_sub_copy: 'Built backwards from your test date.',
    plan_name_template: 'The {{band_goal}} Plan',
    default_focus_axes: ['listening_speed', 'register'],
    social_proof_count: 12408,
    social_proof_noun: 'test-takers',
    waitlist_base: 3207,
  },
  immigration: {
    id: 'immigration',
    label: 'For a move',
    description: "I'm relocating, already abroad, or planning a visa.",
    q9_sub_copy: 'Four weeks. One better week at a time.',
    plan_name_template: 'The First-{{n}}-Weeks Plan',
    default_focus_axes: ['cultural_fluency', 'lexical_range'],
    social_proof_count: 31576,
    social_proof_noun: 'newcomers',
    waitlist_base: 5891,
  },
  travel_social: {
    id: 'travel_social',
    label: 'For life',
    description: "Travel, my partner's family, friends, social confidence.",
    q9_sub_copy: "Four weeks. By the end, you'll sound like you.",
    plan_name_template: 'The {{moment}} Plan',
    default_focus_axes: ['cultural_fluency', 'pronunciation'],
    social_proof_count: 63219,
    social_proof_noun: 'travelers',
    waitlist_base: 11346,
  },
};
