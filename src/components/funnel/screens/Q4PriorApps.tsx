'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { QuestionShell } from '../QuestionShell';
import { Button } from '@/components/ui/button';
import { Q4 } from '@/content/questions';
import { useFunnelStore } from '@/lib/state';
import { track } from '@/lib/analytics';
import type { PriorApp } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface Q4Props {
  direction: 1 | -1;
  onNext: () => void;
  onBack: () => void;
}

export function Q4PriorApps({ direction, onNext, onBack }: Q4Props) {
  const answer = useFunnelStore((s) => s.answers.q4_prior_apps) ?? [];
  const setQ4 = useFunnelStore((s) => s.setQ4);
  const reduce = useReducedMotion();

  useEffect(() => {
    track('question_viewed', { question_id: Q4.id });
  }, []);

  const toggle = (value: PriorApp) => {
    let next: PriorApp[];
    if (value === 'none') {
      // "None" is exclusive: selecting it clears everything else, and a
      // second tap deselects it.
      next = answer.includes('none') ? [] : ['none'];
    } else {
      const withoutNone = answer.filter((a) => a !== 'none');
      next = withoutNone.includes(value)
        ? withoutNone.filter((a) => a !== value)
        : [...withoutNone, value];
    }
    setQ4(next);
    track('question_answered', { q: 'Q4', value: next });
  };

  return (
    <QuestionShell
      step={4}
      direction={direction}
      title="Have you tried English apps before?"
      subtitle={Q4.sub_copy}
      onBack={onBack}
      cta={
        <Button
          className="w-full"
          disabled={answer.length === 0}
          onClick={onNext}
        >
          Continue <span aria-hidden>→</span>
        </Button>
      }
    >
      <div
        role="group"
        aria-label={Q4.headline}
        className="flex flex-wrap gap-2"
      >
        {Q4.options?.map((opt, i) => {
          const selected = answer.includes(opt.value);
          return (
            <motion.button
              key={opt.id}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => toggle(opt.value)}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduce ? 0.18 : 0.3,
                ease: [0.25, 1, 0.35, 1],
                delay: reduce ? 0 : (i * 45) / 1000,
              }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className={cn(
                'inline-flex h-11 items-center justify-center rounded-full px-5 text-body font-medium transition-colors',
                'focus-visible:outline-none focus-visible:shadow-focus',
                selected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-surface-muted text-ink hover:bg-surface-elevated',
              )}
            >
              {opt.label}
            </motion.button>
          );
        })}
      </div>
      <p className="text-body-sm text-ink-subtle">
        Pick any that apply. You can skip past with <em>None of these</em> if you
        haven&apos;t.
      </p>
    </QuestionShell>
  );
}
