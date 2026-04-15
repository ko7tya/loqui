'use client';

import { useEffect } from 'react';
import { QuestionShell } from '../QuestionShell';
import { OptionCard } from '../OptionCard';
import { RadioGroupKeys } from '../RadioGroupKeys';
import { Button } from '@/components/ui/button';
import { Q3 } from '@/content/questions';
import { useFunnelStore } from '@/lib/state';
import { track } from '@/lib/analytics';
import type { Segment } from '@/lib/types';

export interface Q3Props {
  direction: 1 | -1;
  onNext: () => void;
  onBack: () => void;
}

export function Q3Segment({ direction, onNext, onBack }: Q3Props) {
  const answer = useFunnelStore((s) => s.answers.q3_segment);
  const q1 = useFunnelStore((s) => s.answers.q1_who_talking_to);
  const q2 = useFunnelStore((s) => s.answers.q2_level);
  const setQ3 = useFunnelStore((s) => s.setQ3);

  useEffect(() => {
    track('question_viewed', { question_id: Q3.id });
  }, []);

  const pick = (value: Segment) => {
    setQ3(value);
    track('question_answered', { q: 'Q3', value });
    track('segment_detected', { segment: value, q1_who: q1, q2_level: q2 });
  };

  return (
    <QuestionShell
      step={3}
      direction={direction}
      title="Why are you learning English?"
      subtitle={
        <>
          Your plan <em className="italic">shifts</em> based on this one.
        </>
      }
      onBack={onBack}
      cta={
        <Button className="w-full" disabled={!answer} onClick={onNext}>
          Continue <span aria-hidden>→</span>
        </Button>
      }
    >
      <RadioGroupKeys label={Q3.headline} className="flex flex-col gap-3">
        {Q3.options?.map((opt, i) => (
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
