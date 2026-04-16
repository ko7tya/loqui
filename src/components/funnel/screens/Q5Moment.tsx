'use client';

import { useEffect } from 'react';
import { QuestionShell } from '../QuestionShell';
import { OptionCard } from '../OptionCard';
import { RadioGroupKeys } from '../RadioGroupKeys';
import { Button } from '@/components/ui/button';
import {
  Q5_VARIANTS,
  Q5_SIMPLE_HEADLINE,
  pickCopy,
} from '@/content/questions';
import { useFunnelStore } from '@/lib/state';
import { track } from '@/lib/analytics';

export interface Q5Props {
  direction: 1 | -1;
  onNext: () => void;
  onBack: () => void;
}

export function Q5Moment({ direction, onNext, onBack }: Q5Props) {
  const segment = useFunnelStore((s) => s.answers.segment ?? 'career');
  const level = useFunnelStore((s) => s.answers.q2_level);
  const answerId = useFunnelStore((s) => s.answers.q5_moment_id);
  const setQ5 = useFunnelStore((s) => s.setQ5);

  const variants = Q5_VARIANTS[segment];

  // Beginner-level users get the simpler headline; others get the italic-stress version.
  const title =
    level === 'getting_by' ? (
      Q5_SIMPLE_HEADLINE
    ) : (
      <>
        What&apos;s the moment you want to <em className="italic">nail</em>?
      </>
    );
  const subtitle = pickCopy(
    level,
    <>
      The plan trains for <em className="italic">this</em>.
    </>,
    <>The plan is made for this.</>,
  );

  useEffect(() => {
    track('question_viewed', {
      question_id: 'Q5_SPECIFIC_MOMENT',
      segment,
    });
  }, [segment]);

  const pick = (id: string, label: string) => {
    setQ5(label, id);
    track('question_answered', { q: 'Q5', value: id, segment });
  };

  return (
    <QuestionShell
      step={5}
      direction={direction}
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      cta={
        <Button className="w-full" disabled={!answerId} onClick={onNext}>
          Continue <span aria-hidden>→</span>
        </Button>
      }
    >
      <RadioGroupKeys
        label="Pick the moment you want to nail"
        className="flex flex-col gap-3"
      >
        {variants.map((opt, i) => (
          <OptionCard
            key={opt.id}
            role="radio"
            selected={answerId === opt.id}
            onSelect={() => pick(opt.id, opt.label)}
            title={opt.label}
            delay={i * 60}
          />
        ))}
      </RadioGroupKeys>
    </QuestionShell>
  );
}
