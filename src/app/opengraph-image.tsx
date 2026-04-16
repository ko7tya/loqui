import { ImageResponse } from 'next/og';

/**
 * Next.js App Router auto-registers this file as the Open Graph image for `/`.
 * 1200×630 is the standard OG size. Rendered on-request via @vercel/og.
 *
 * Visual brief (see design-system.md §2):
 * - Ink Plum (#231A2E) background with a subtle ember glow in the top-right
 * - "Loqui." wordmark in serif with the period as the ember tittle/accent
 * - Italic-serif stress on "rhythm"
 * - Small supporting line in sans for context
 */

export const alt = 'Loqui — Find your rhythm in English';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '96px',
          background:
            'radial-gradient(ellipse at 88% 18%, rgba(217, 107, 60, 0.35), transparent 55%), #231A2E',
          color: '#F5EEE2',
          fontFamily: 'serif',
        }}
      >
        {/* Wordmark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontSize: 148,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          <span>Loqu</span>
          <span style={{ position: 'relative', display: 'flex' }}>
            <span>i</span>
            <span
              style={{
                position: 'absolute',
                top: -14,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 30,
                height: 30,
                borderRadius: 999,
                background: '#D96B3C',
              }}
            />
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            fontSize: 64,
            fontWeight: 400,
            marginTop: 48,
            color: '#EFE6D6',
            lineHeight: 1.15,
            maxWidth: 960,
          }}
        >
          <span>Find your&nbsp;</span>
          <span style={{ fontStyle: 'italic', color: '#D96B3C' }}>rhythm</span>
          <span>&nbsp;in English.</span>
        </div>

        {/* Supporting line */}
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            fontWeight: 400,
            marginTop: 40,
            color: '#B3A59B',
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Inter, sans-serif',
            letterSpacing: '0.01em',
          }}
        >
          AI English tutor · Your personalized 4-week plan in 10 questions.
        </div>

        {/* Rhythm mark footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 72,
            left: 96,
            display: 'flex',
            gap: 18,
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: '#D96B3C',
            }}
          />
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: 'rgba(217, 107, 60, 0.55)',
            }}
          />
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: 'rgba(217, 107, 60, 0.28)',
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
