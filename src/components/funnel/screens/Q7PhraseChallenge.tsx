'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { QuestionShell } from '../QuestionShell';
import { RadioGroupKeys } from '../RadioGroupKeys';
import { Button } from '@/components/ui/button';
import { Q7, Q7_SIMPLE_SUBCOPY, pickCopy } from '@/content/questions';
import { getSeedFor } from '@/content/phrase-challenges';
import { useFunnelStore } from '@/lib/state';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import type { PhraseChallengeOption } from '@/lib/types';

export interface Q7Props {
  direction: 1 | -1;
  onNext: () => void;
  onBack: () => void;
}

export function Q7PhraseChallenge({ direction, onNext, onBack }: Q7Props) {
  const segment = useFunnelStore((s) => s.answers.segment);
  const level = useFunnelStore((s) => s.answers.q2_level);
  const q7 = useFunnelStore((s) => s.answers.q7_challenge);
  const setQ7 = useFunnelStore((s) => s.setQ7);
  const reduce = useReducedMotion();

  const seed = useMemo(() => getSeedFor(segment, level), [segment, level]);

  // If the user goes back and returns, restore their pick from the store.
  const [pickedId, setPickedId] = useState<string | null>(
    q7?.challenge_id === seed.id ? q7.selected_option_id : null,
  );

  const revealed = pickedId !== null;

  useEffect(() => {
    track('question_viewed', {
      question_id: Q7.id,
      segment,
      level,
      seed_id: seed.id,
    });
  }, [segment, level, seed.id]);

  const pick = (opt: PhraseChallengeOption) => {
    if (revealed) return;
    setPickedId(opt.id);
    setQ7({
      challenge_id: seed.id,
      selected_option_id: opt.id,
      was_correct: opt.isCorrect,
    });
    track('question_answered', {
      q: 'Q7',
      value: opt.id,
      was_correct: opt.isCorrect,
      seed_id: seed.id,
    });
  };

  return (
    <QuestionShell
      step={7}
      direction={direction}
      section="The moment"
      title={Q7.headline}
      subtitle={pickCopy(level, Q7.sub_copy, Q7_SIMPLE_SUBCOPY)}
      onBack={onBack}
      cta={
        revealed ? (
          <Button className="w-full" onClick={onNext}>
            Continue <span aria-hidden>→</span>
          </Button>
        ) : undefined
      }
    >
      {/* Context card */}
      <div className="rounded-lg border border-ink/10 bg-surface-elevated px-4 py-4 shadow-sm">
        <p className="text-overline font-semibold uppercase text-ink-muted">
          Scenario
        </p>
        <p className="mt-1 text-body-lg text-ink">{seed.context}</p>
      </div>

      {/* Options */}
      <RadioGroupKeys
        label="Which one sounds most natural?"
        className="flex flex-col gap-3"
      >
        {seed.options.map((opt, i) => {
          const picked = pickedId === opt.id;
          const showCorrect = revealed && opt.isCorrect;
          const showWrong = revealed && picked && !opt.isCorrect;
          return (
            <motion.button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={picked}
              aria-disabled={revealed}
              onClick={() => pick(opt)}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduce ? 0.18 : 0.32,
                ease: [0.25, 1, 0.35, 1],
                delay: reduce ? 0 : (i * 60) / 1000,
              }}
              whileTap={reduce || revealed ? undefined : { scale: 0.98 }}
              className={cn(
                'group relative rounded-md border px-4 py-4 text-left transition-colors',
                'focus-visible:outline-none focus-visible:shadow-focus',
                revealed && !picked && !opt.isCorrect && 'opacity-60',
                showCorrect &&
                  'border-2 border-success bg-success/5 text-ink',
                showWrong && 'border-2 border-error bg-error/5 text-ink',
                !revealed &&
                  'border-ink/10 bg-surface-muted hover:bg-surface-elevated hover:shadow-sm',
                revealed && !showCorrect && !showWrong &&
                  'border-ink/10 bg-surface-muted',
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                    showCorrect &&
                      'border-success bg-success text-surface-elevated',
                    showWrong && 'border-error bg-error text-surface-elevated',
                    !showCorrect && !showWrong && picked && 'border-ember',
                    !picked && !revealed && 'border-ink/30',
                  )}
                  aria-hidden
                >
                  {showCorrect && <Check className="h-3 w-3" strokeWidth={3} />}
                  {showWrong && <X className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span className="flex-1 text-body-lg text-ink">&quot;{opt.text}&quot;</span>
              </div>
              {revealed && opt.why && (picked || opt.isCorrect) && (
                <motion.p
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="mt-2 pl-8 text-body-sm text-ink-muted"
                >
                  {opt.why}
                </motion.p>
              )}
            </motion.button>
          );
        })}
      </RadioGroupKeys>

      {/* Reveal panel */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            key="reveal"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            aria-live="polite"
            className="rounded-lg border-l-[3px] border-ember bg-surface-elevated px-4 py-4 shadow-md"
          >
            <p className="text-overline font-semibold uppercase text-ember">
              Why it works
            </p>
            <p className="mt-1 text-body-lg text-ink">
              {seed.correct_explanation}
            </p>
            <p className="mt-3 border-t border-ink/10 pt-3 font-serif text-body-lg italic text-ink-muted">
              {seed.takeaway}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </QuestionShell>
  );
}
