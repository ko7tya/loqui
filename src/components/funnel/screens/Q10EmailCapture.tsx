'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { QuestionShell } from '../QuestionShell';
import { RhythmLoader } from '../RhythmLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Q10, SEGMENT_Q10_SUBCOPY } from '@/content/questions';
import { useFunnelStore } from '@/lib/state';
import { track } from '@/lib/analytics';

export interface Q10Props {
  direction: 1 | -1;
  onSubmitted: () => void;
  onBack: () => void;
}

// Lightweight RFC-5322-ish validation — good enough for inline UX.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Q10EmailCapture({ direction, onSubmitted, onBack }: Q10Props) {
  const segment = useFunnelStore((s) => s.answers.segment ?? 'career');
  const existingEmail = useFunnelStore((s) => s.answers.q10_email);
  const setEmail = useFunnelStore((s) => s.setEmail);
  const setWaitlist = useFunnelStore((s) => s.setWaitlistPosition);
  const markCompleted = useFunnelStore((s) => s.markCompleted);
  const answers = useFunnelStore((s) => s.answers);

  const [value, setValue] = useState(existingEmail ?? '');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const subCopy = SEGMENT_Q10_SUBCOPY[segment];
  const isValid = EMAIL_RE.test(value.trim());

  useEffect(() => {
    track('question_viewed', { question_id: Q10.id, segment });
  }, [segment]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid || submitting) return;

    // Spam honeypot — real users can't fill an invisible input.
    if (honeypotRef.current?.value) {
      track('submit_failed', { reason: 'honeypot' });
      setError('Something went wrong. Please refresh and try again.');
      return;
    }

    setError(null);
    setSubmitting(true);
    const email = value.trim();
    setEmail(email);
    track('email_submitted', { segment });

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          answers: { ...answers, q10_email: email },
          _hp: honeypotRef.current?.value ?? '',
        }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as {
        ok?: boolean;
        waitlist_position?: number;
      };
      if (typeof data.waitlist_position === 'number') {
        setWaitlist(data.waitlist_position);
      }
      markCompleted();
      track('submit_succeeded', { segment });
      onSubmitted();
    } catch (err) {
      track('submit_failed', {
        reason: err instanceof Error ? err.message : 'unknown',
      });
      setError("We couldn't send your plan. Please try once more.");
      setSubmitting(false);
    }
  };

  return (
    <QuestionShell
      step={10}
      direction={direction}
      title="Where should we send it?"
      subtitle={subCopy}
      onBack={onBack}
      cta={
        <Button
          type="submit"
          form="email-form"
          className="w-full"
          disabled={!isValid || submitting}
        >
          {submitting ? (
            <RhythmLoader size="sm" label="Sending your plan" />
          ) : (
            <>
              Send me my plan <span aria-hidden>→</span>
            </>
          )}
        </Button>
      }
    >
      <form
        id="email-form"
        onSubmit={submit}
        noValidate
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="q10-email"
            className="text-body-sm font-medium text-ink-muted"
          >
            Email address
          </label>
          <Input
            id="q10-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            aria-invalid={touched && !isValid}
            aria-describedby={touched && !isValid ? 'q10-email-err' : undefined}
            placeholder="you@example.com"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
          />
          {touched && value && !isValid && (
            <p id="q10-email-err" className="text-body-sm text-error">
              That email doesn&apos;t look right.
            </p>
          )}
          {error && (
            <p role="alert" className="text-body-sm text-error">
              {error}
            </p>
          )}
        </div>

        {/* Honeypot — visually hidden, screen-reader hidden. Real users skip it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
        >
          <label htmlFor="_hp">Leave this blank</label>
          <input
            ref={honeypotRef}
            id="_hp"
            name="_hp"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <p className="text-body-sm text-ink-subtle">
          {Q10.fine_print}{' '}
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-ink"
          >
            Privacy policy
          </Link>
          .
        </p>
      </form>
    </QuestionShell>
  );
}
