import { ImageResponse } from 'next/og';

/**
 * Apple touch icon — 180×180 PNG generated on-demand via @vercel/og.
 *
 * iOS home screens don't reliably render SVG, so we ship a PNG here rather
 * than reuse src/app/icon.svg. Visual matches the favicon: Ink Plum square
 * with a cream serif "L" and the ember tittle disc.
 */

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#231A2E',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            fontSize: 128,
            fontWeight: 600,
            color: '#F5EEE2',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            marginTop: 8,
          }}
        >
          L
        </div>
        <div
          style={{
            position: 'absolute',
            top: 32,
            right: 36,
            width: 40,
            height: 40,
            borderRadius: 999,
            background: '#D96B3C',
          }}
        />
      </div>
    ),
    { ...size },
  );
}
