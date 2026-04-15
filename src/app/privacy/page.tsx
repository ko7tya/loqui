import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Loqui',
  description: 'How Loqui handles your answers, email, and learning data.',
};

/**
 * Placeholder privacy policy. ~300 words, GDPR-style language. Legal review
 * required before launch — this copy is scaffolding so email-capture screens
 * can link somewhere real today.
 */
export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-[680px] px-6 pb-20 pt-10">
      <header className="pb-8">
        <Link
          href="/"
          className="text-body-sm text-ink-muted hover:text-ink"
        >
          ← Back to Loqui
        </Link>
      </header>
      <article className="prose prose-neutral flex flex-col gap-5 text-ink">
        <h1 className="font-serif text-h1">Privacy policy</h1>
        <p className="text-body-sm text-ink-subtle">
          Last updated: April 15, 2026
        </p>

        <p className="text-body-lg text-ink-muted">
          Loqui is an AI-assisted English tutoring product. This placeholder
          policy explains, in plain language, what we do with the information
          you share while building your plan. Formal legal review is pending;
          the practices described below are our working defaults.
        </p>

        <h2 className="font-serif text-h2 pt-4">What we collect</h2>
        <p>
          During the 10-question funnel we collect the answers you provide
          (your goals, level, time commitment, learning style), the phrase you
          type for the live coaching demo, and the email address you enter at
          the end. We do not ask for your name, location beyond city-level,
          payment information, or anything that identifies you outside the
          Loqui product.
        </p>

        <h2 className="font-serif text-h2 pt-4">How we use it</h2>
        <p>
          Your answers generate your plan and are stored against a random
          session identifier. Your email is used to send your plan and, if you
          opt in, weekly check-ins. We use an analytics tool to understand
          how people move through the funnel and where we can make the
          product clearer. We do not sell your data to any third party.
        </p>

        <h2 className="font-serif text-h2 pt-4">How long we keep it</h2>
        <p>
          Funnel answers and generated plans are kept for 12 months so that
          we can improve the experience. You can ask us to delete everything
          associated with your email at any time by replying to any message
          from us, and we will action the deletion within 30 days.
        </p>

        <h2 className="font-serif text-h2 pt-4">Your rights</h2>
        <p>
          You can request a copy of your data, ask us to correct anything that
          is wrong, or ask us to delete your information entirely. If you are
          in the EU or UK, you retain all rights granted under GDPR. Email
          privacy@loqui.app with any request and we will respond within 14
          days.
        </p>

        <h2 className="font-serif text-h2 pt-4">Contact</h2>
        <p>
          Questions, clarifications, or feedback on this policy are welcome.
          Email us at privacy@loqui.app and a human will respond. This page
          will be updated ahead of public launch with full legal review.
        </p>
      </article>
    </main>
  );
}
