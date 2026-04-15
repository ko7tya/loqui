'use client';

import { useEffect } from 'react';
import { QuestionShell } from '../QuestionShell';
import { OptionCard } from '../OptionCard';
import { RadioGroupKeys } from '../RadioGroupKeys';
import { Button } from '@/components/ui/button';
import { Q8, SEGMENT_Q8_SUBCOPY } from '@/content/questions';
import { useFunnelStore } from '@/lib/state';
import { track } from '@/lib/analytics';
import type { LearningStyle } from '@/lib/types';

export interface Q8Props {
  direction: 1 | -1;
  onNext: () => void;
  onBack: () => void;
}

export function Q8LearningStyle({ direction, onNext, onBack }: Q8Props) {
  const segment = useFunnelStore((s) => s.answers.segment ?? 'career');
  const answer = useFunnelStore((s) => s.answers.q8_style);
  const setQ8 = useFunnelStore((s) => s.setQ8);

  const subCopy = SEGMENT_Q8_SUBCOPY[segment];

  useEffect(() => {
    track('question_viewed', { question_id: Q8.id, segment });
  }, [segment]);

  const pick = (value: LearningStyle) => {
    setQ8(value);
    track('question_answered', { q: 'Q8', value, segment });
  };

  return (
    <QuestionShell
      step={8}
      direction={direction}
      title="One more."
      subtitle={subCopy}
      onBack={onBack}
      cta={
        <Button className="w-full" disabled={!answer} onClick={onNext}>
          Build my plan <span aria-hidden>→</span>
        </Button>
      }
    >
      <RadioGroupKeys label={Q8.headline} className="flex flex-col gap-3">
        {Q8.options?.map((opt, i) => (
          <OptionCard
            key={opt.id}
            role="radio"
            selected={answer === opt.value}
            onSelect={() => pick(opt.value)}
            title={opt.label}
            description={opt.description}
            delay={i * 60}
          />
        ))}
      </RadioGroupKeys>
    </QuestionShell>
  );
}
