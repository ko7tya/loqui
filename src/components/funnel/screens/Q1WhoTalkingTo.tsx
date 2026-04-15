'use client';

import { useEffect } from 'react';
import { QuestionShell } from '../QuestionShell';
import { OptionCard } from '../OptionCard';
import { RadioGroupKeys } from '../RadioGroupKeys';
import { Button } from '@/components/ui/button';
import { Q1 } from '@/content/questions';
import { useFunnelStore } from '@/lib/state';
import { track } from '@/lib/analytics';
import type { WhoTalkingTo } from '@/lib/types';

export interface Q1Props {
  direction: 1 | -1;
  onNext: () => void;
  onBack: () => void;
}

export function Q1WhoTalkingTo({ direction, onNext, onBack }: Q1Props) {
  const answer = useFunnelStore((s) => s.answers.q1_who_talking_to);
  const setQ1 = useFunnelStore((s) => s.setQ1);

  useEffect(() => {
    track('question_viewed', { question_id: Q1.id });
  }, []);

  const pick = (value: WhoTalkingTo) => {
    setQ1(value);
    track('question_answered', { q: 'Q1', value });
  };

  return (
    <QuestionShell
      step={1}
      direction={direction}
      title={<>When you imagine speaking fluently, who are you <em className="italic">talking</em> to?</>}
      subtitle="Pick the one that lands first."
      onBack={onBack}
      cta={
        <Button className="w-full" disabled={!answer} onClick={onNext}>
          Continue <span aria-hidden>→</span>
        </Button>
      }
    >
      <RadioGroupKeys
        label={Q1.headline}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {Q1.options?.map((opt, i) => (
          <OptionCard
            key={opt.id}
            role="radio"
            selected={answer === opt.value}
            onSelect={() => pick(opt.value)}
            title={opt.label}
            delay={i * 60}
          />
        ))}
      </RadioGroupKeys>
    </QuestionShell>
  );
}
