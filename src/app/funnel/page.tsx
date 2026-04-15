'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';

import { useFunnelStore } from '@/lib/state';
import { ThemeToggle } from '@/components/funnel/ThemeToggle';
import { Wordmark } from '@/components/funnel/Wordmark';
import { Q1WhoTalkingTo } from '@/components/funnel/screens/Q1WhoTalkingTo';
import { Q2Level } from '@/components/funnel/screens/Q2Level';
import { Q3Segment } from '@/components/funnel/screens/Q3Segment';
import { Q4PriorApps } from '@/components/funnel/screens/Q4PriorApps';
import { Q5Moment } from '@/components/funnel/screens/Q5Moment';
import { Q6TimeCommitment } from '@/components/funnel/screens/Q6TimeCommitment';
import { Q7PhraseChallenge } from '@/components/funnel/screens/Q7PhraseChallenge';
import { Q8LearningStyle } from '@/components/funnel/screens/Q8LearningStyle';
import { Q9PlanReveal } from '@/components/funnel/screens/Q9PlanReveal';
import { Q10EmailCapture } from '@/components/funnel/screens/Q10EmailCapture';
import { ReadinessScorePreview } from '@/components/funnel/interstitials/ReadinessScorePreview';
import { SocialProofMap } from '@/components/funnel/interstitials/SocialProofMap';
import { SuccessScreen } from '@/components/funnel/SuccessScreen';

/**
 * Funnel step catalog.
 *
 *   1  Q1 who
 *   2  Q2 level
 *   2.5 Interstitial A — Readiness Score preview
 *   3  Q3 segment
 *   4  Q4 prior apps
 *   5  Q5 moment (segment-aware)
 *   5.5 Interstitial B — Social Proof map
 *   6  Q6 time
 *   7  Q7 phrase challenge
 *   8  Q8 learning style
 *   9  Q9 plan reveal
 *   10 Q10 email capture
 *   11 Success
 *
 * The interstitials live in between the integer steps. We pick a half-step
 * convention so the ProgressBar ("step X / 10") doesn't include them — they
 * reward, they don't progress.
 */

// Phases used inside the AnimatePresence. A stable string `key` per screen
// plays nicely with mode="wait".
type Phase =
  | 'Q1'
  | 'Q2'
  | 'IA'
  | 'Q3'
  | 'Q4'
  | 'Q5'
  | 'IB'
  | 'Q6'
  | 'Q7'
  | 'Q8'
  | 'Q9'
  | 'Q10'
  | 'SUCCESS';

// currentStep maps to a phase. Interstitials insert between integers.
function phaseFor(step: number, interstitial: 'none' | 'IA' | 'IB'): Phase {
  if (interstitial === 'IA') return 'IA';
  if (interstitial === 'IB') return 'IB';
  switch (step) {
    case 1:
      return 'Q1';
    case 2:
      return 'Q2';
    case 3:
      return 'Q3';
    case 4:
      return 'Q4';
    case 5:
      return 'Q5';
    case 6:
      return 'Q6';
    case 7:
      return 'Q7';
    case 8:
      return 'Q8';
    case 9:
      return 'Q9';
    case 10:
      return 'Q10';
    case 11:
      return 'SUCCESS';
    default:
      return 'Q1';
  }
}

export default function FunnelPage() {
  const currentStep = useFunnelStore((s) => s.currentStep);
  const setStep = useFunnelStore((s) => s.setStep);
  const nextStep = useFunnelStore((s) => s.nextStep);
  const prevStep = useFunnelStore((s) => s.prevStep);
  const reset = useFunnelStore((s) => s.reset);

  // Ephemeral UI state — interstitials live between integer steps.
  const [interstitial, setInterstitial] = useState<'none' | 'IA' | 'IB'>(
    'none',
  );
  const [direction, setDirection] = useState<1 | -1>(1);

  // Entry guard: if user lands on /funnel with currentStep 0, bump to 1.
  const bootedRef = useRef(false);
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    if (currentStep === 0) setStep(1);
    if (currentStep > 10) {
      // They already completed — show Success.
      setStep(11);
    }
  }, [currentStep, setStep]);

  // Keyboard: Escape = back
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentStep > 1 && currentStep < 11) {
        goBack();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, interstitial]);

  const goForward = () => {
    setDirection(1);
    // Inject interstitial A after Q2, B after Q5
    if (currentStep === 2 && interstitial === 'none') {
      setInterstitial('IA');
      return;
    }
    if (currentStep === 5 && interstitial === 'none') {
      setInterstitial('IB');
      return;
    }
    if (interstitial !== 'none') {
      setInterstitial('none');
      nextStep();
      return;
    }
    nextStep();
  };

  const goBack = () => {
    setDirection(-1);
    if (interstitial !== 'none') {
      setInterstitial('none');
      return;
    }
    // If we're on Q3, the previous screen is IA (not Q2).
    if (currentStep === 3) {
      setInterstitial('IA');
      return;
    }
    if (currentStep === 6) {
      setInterstitial('IB');
      return;
    }
    prevStep();
  };

  const phase = phaseFor(currentStep, interstitial);

  return (
    <main className="relative min-h-[100svh]">
      {/* Site chrome header */}
      <nav
        aria-label="Primary"
        className="absolute left-0 right-0 top-0 z-30 mx-auto flex w-full max-w-[520px] items-center justify-between px-5 pt-4 sm:px-6"
      >
        <Link
          href="/"
          aria-label="Loqui — home"
          className="rounded-md focus-visible:outline-none focus-visible:shadow-focus"
        >
          <Wordmark size={24} />
        </Link>
        <ThemeToggle />
      </nav>

      {/* Spacer to leave room for the floating header */}
      <div className="pt-14">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {phase === 'Q1' && (
            <Q1WhoTalkingTo
              key="Q1"
              direction={direction}
              onNext={goForward}
              onBack={goBack}
            />
          )}
          {phase === 'Q2' && (
            <Q2Level
              key="Q2"
              direction={direction}
              onNext={goForward}
              onBack={goBack}
            />
          )}
          {phase === 'IA' && (
            <ReadinessScorePreview
              key="IA"
              direction={direction}
              onNext={goForward}
              onBack={goBack}
            />
          )}
          {phase === 'Q3' && (
            <Q3Segment
              key="Q3"
              direction={direction}
              onNext={goForward}
              onBack={goBack}
            />
          )}
          {phase === 'Q4' && (
            <Q4PriorApps
              key="Q4"
              direction={direction}
              onNext={goForward}
              onBack={goBack}
            />
          )}
          {phase === 'Q5' && (
            <Q5Moment
              key="Q5"
              direction={direction}
              onNext={goForward}
              onBack={goBack}
            />
          )}
          {phase === 'IB' && (
            <SocialProofMap
              key="IB"
              direction={direction}
              onNext={goForward}
              onBack={goBack}
            />
          )}
          {phase === 'Q6' && (
            <Q6TimeCommitment
              key="Q6"
              direction={direction}
              onNext={goForward}
              onBack={goBack}
            />
          )}
          {phase === 'Q7' && (
            <Q7PhraseChallenge
              key="Q7"
              direction={direction}
              onNext={goForward}
              onBack={goBack}
            />
          )}
          {phase === 'Q8' && (
            <Q8LearningStyle
              key="Q8"
              direction={direction}
              onNext={goForward}
              onBack={goBack}
            />
          )}
          {phase === 'Q9' && (
            <Q9PlanReveal
              key="Q9"
              direction={direction}
              onNext={goForward}
              onBack={goBack}
            />
          )}
          {phase === 'Q10' && (
            <Q10EmailCapture
              key="Q10"
              direction={direction}
              onSubmitted={() => {
                setDirection(1);
                setStep(11);
              }}
              onBack={goBack}
            />
          )}
          {phase === 'SUCCESS' && (
            <SuccessScreen
              key="SUCCESS"
              onRestart={() => {
                reset();
                setStep(1);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
