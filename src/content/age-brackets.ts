import type { AgeBracket } from '@/lib/types';

/**
 * Age bracket content. Six brackets, each with a short description used
 * only on the Q4 cards — nothing reads the description in the plan or the
 * Telegram payload. Labels are the canonical rendering everywhere else.
 *
 * Voice: adult, composed. "For love of the language, or a late chapter."
 * is intentionally warm — it reframes "55+" as a choice, not a category.
 */

export interface AgeBracketContent {
  id: AgeBracket;
  label: string;
  description: string;
}

export const AGE_BRACKETS_CONTENT: readonly AgeBracketContent[] = [
  {
    id: 'under_18',
    label: 'Under 18',
    description: 'Still in school.',
  },
  {
    id: '18_24',
    label: '18–24',
    description: 'College or starting out.',
  },
  {
    id: '25_34',
    label: '25–34',
    description: 'Career climb.',
  },
  {
    id: '35_44',
    label: '35–44',
    description: 'Career and family.',
  },
  {
    id: '45_54',
    label: '45–54',
    description: 'Established.',
  },
  {
    id: '55_plus',
    label: '55 or over',
    description: 'For love of the language, or a late chapter.',
  },
];
