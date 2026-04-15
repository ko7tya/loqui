'use client';

import { useEffect } from 'react';
import { QuestionShell } from '../QuestionShell';
import { OptionCard } from '../OptionCard';
import { RadioGroupKeys } from '../RadioGroupKeys';
import { Button } from '@/components/ui/button';
import { Q6 } from '@/content/questions';
import { useFunnelStore } from '@/lib/state';
import { track } from '@/lib/analytics';
import type { TimeCommitment } from '@/lib/types';

export interface Q6Props {
  direction: 1 | -1;
  onNext: () => void;
  onBack: () => void;
}

export function Q6TimeCommitment({ direction, onNext, onBack }: Q6Props) {
  const answer = useFunnelStore((s) => s.answers.q6_time);
  const setQ6 = useFunnelStore((s) => s.setQ6);

  useEffect(() => {
    track('question_viewed', { question_id: Q6.id });
  }, []);

  const pick = (value: TimeCommitment) => {
    setQ6(value);
    track('question_answered', { q: 'Q6', value });
  };

  return (
    <QuestionShell
      step={6}
      direction={direction}
      title="How much time can you actually give this?"
      subtitle={Q6.sub_copy}
      onBack={onBack}
      cta={
        <Button className="w-full" disabled={!answer} onClick={onNext}>
          Continue <span aria-hidden>→</span>
        </Button>
      }
    >
      <RadioGroupKeys label={Q6.headline} className="flex flex-col gap-3">
        {Q6.options?.map((opt, i) => (
          <OptionCard
            key={opt.id}
            role="radio"
            selected={answer === opt.value}
            onSelect={() => pick(opt.value)}
            title={opt.label}
            description={opt.description}
            chip={opt.value === 20 ? 'Most popular' : undefined}
            delay={i * 60}
          />
        ))}
      </RadioGroupKeys>
    </QuestionShell>
  );
}
