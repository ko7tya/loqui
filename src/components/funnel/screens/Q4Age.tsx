'use client';

import { useEffect } from 'react';
import { QuestionShell } from '../QuestionShell';
import { OptionCard } from '../OptionCard';
import { RadioGroupKeys } from '../RadioGroupKeys';
import { Button } from '@/components/ui/button';
import { Q4 } from '@/content/questions';
import { AGE_BRACKETS_CONTENT } from '@/content/age-brackets';
import { useFunnelStore } from '@/lib/state';
import { track } from '@/lib/analytics';
import type { AgeBracket } from '@/lib/types';

export interface Q4Props {
  direction: 1 | -1;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Q4 (v2) — Age bracket.
 *
 * Single-choice cards. Two-column grid on `sm+`, single column on xs.
 * Displays each bracket's label with its one-line description as helper copy.
 */
export function Q4Age({ direction, onNext, onBack }: Q4Props) {
  const answer = useFunnelStore((s) => s.answers.q4_age);
  const setQ4Age = useFunnelStore((s) => s.setQ4Age);

  useEffect(() => {
    track('question_viewed', { question_id: Q4.id });
  }, []);

  const pick = (value: AgeBracket) => {
    setQ4Age(value);
    track('question_answered', { q: 'Q4', value });
    track('age_selected', { age: value });
  };

  return (
    <QuestionShell
      step={4}
      direction={direction}
      title={Q4.headline}
      subtitle={Q4.sub_copy}
      onBack={onBack}
      cta={
        <Button className="w-full" disabled={!answer} onClick={onNext}>
          Continue <span aria-hidden>→</span>
        </Button>
      }
    >
      <RadioGroupKeys
        label={Q4.headline}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {AGE_BRACKETS_CONTENT.map((bracket, i) => (
          <OptionCard
            key={bracket.id}
            role="radio"
            selected={answer === bracket.id}
            onSelect={() => pick(bracket.id)}
            title={bracket.label}
            description={bracket.description}
            delay={i * 50}
          />
        ))}
      </RadioGroupKeys>
    </QuestionShell>
  );
}
