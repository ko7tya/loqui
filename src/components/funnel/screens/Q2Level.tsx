'use client';

import { useEffect } from 'react';
import { QuestionShell } from '../QuestionShell';
import { OptionCard } from '../OptionCard';
import { RadioGroupKeys } from '../RadioGroupKeys';
import { Button } from '@/components/ui/button';
import { Q2 } from '@/content/questions';
import { useFunnelStore } from '@/lib/state';
import { track } from '@/lib/analytics';
import type { Level } from '@/lib/types';

export interface Q2Props {
  direction: 1 | -1;
  onNext: () => void;
  onBack: () => void;
}

export function Q2Level({ direction, onNext, onBack }: Q2Props) {
  const answer = useFunnelStore((s) => s.answers.q2_level);
  const setQ2 = useFunnelStore((s) => s.setQ2);

  useEffect(() => {
    track('question_viewed', { question_id: Q2.id });
  }, []);

  const pick = (value: Level) => {
    setQ2(value);
    track('question_answered', { q: 'Q2', value });
  };

  return (
    <QuestionShell
      step={2}
      direction={direction}
      title="Where are you right now?"
      subtitle={Q2.sub_copy}
      onBack={onBack}
      cta={
        <Button className="w-full" disabled={!answer} onClick={onNext}>
          Continue <span aria-hidden>→</span>
        </Button>
      }
    >
      <RadioGroupKeys label={Q2.headline} className="flex flex-col gap-3">
        {Q2.options?.map((opt, i) => (
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
