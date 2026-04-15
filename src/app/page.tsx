'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/funnel/ThemeToggle';
import { Wordmark } from '@/components/funnel/Wordmark';
import { useFunnelStore } from '@/lib/state';
import { track } from '@/lib/analytics';

/**
 * Loqui landing / hook screen.
 *
 * Mobile-first, designed against the 375×812 mockup in design-system.md §3.1.
 * Hook sentence uses the signature italic-serif stress word ("rhythm"). The
 * CTA resets the funnel store (fresh session) and fires `funnel_started`.
 */
export default function HomePage() {
  const router = useRouter();
  const reset = useFunnelStore((s) => s.reset);
  const setStep = useFunnelStore((s) => s.setStep);

  const startFunnel = () => {
    reset();
    setStep(1);
    track('funnel_started');
    router.push('/funnel');
  };

  return (
    <main className="relative mx-auto flex min-h-[100svh] w-full max-w-[520px] flex-col px-6 pb-12 pt-6">
      <nav
        aria-label="Primary"
        className="flex items-center justify-between pb-12"
      >
        <Wordmark size={24} />
        <ThemeToggle />
      </nav>

      <section className="flex flex-1 flex-col justify-between gap-12">
        <div className="flex flex-col gap-6 pt-8">
          <h1 className="font-serif text-display text-ink text-balance">
            Find your <em className="italic">rhythm</em>
            <br />
            in English
            <span className="text-ember">.</span>
          </h1>
          <p className="max-w-[32ch] text-body-lg text-ink-muted text-balance">
            A personalized 4-week plan, built around how you actually talk.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button onClick={startFunnel} className="w-full">
            Start your plan <span aria-hidden>→</span>
          </Button>
          <p className="text-center text-caption text-ink-subtle">
            Takes 2 minutes. No signup.
          </p>
          <p className="text-center text-caption text-ink-subtle">
            <Link
              href="/privacy"
              className="underline-offset-4 hover:underline"
            >
              Privacy policy
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
