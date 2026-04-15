import type { Metadata, Viewport } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

/**
 * Root layout.
 *
 * - Fonts: Source Serif 4 (display) + Inter (UI), wired via next/font/google
 *   as CSS variables consumed by tailwind.config.ts.
 * - Dark mode: class strategy. The inline script runs pre-hydration so the
 *   first paint matches the user's saved preference and avoids a flash.
 * - Grain texture: rendered in globals.css as a body::before layer so it
 *   survives route transitions without flicker.
 */

const serif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-serif',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Loqui — Find your rhythm in English',
  description:
    'Loqui is an AI English tutor that builds you a four-week plan tuned to the moment you want to nail.',
  metadataBase: new URL('https://loqui.local'),
  openGraph: {
    title: 'Loqui — Find your rhythm in English',
    description:
      'A personalized 4-week plan for the moment you most want to nail — work, a test, a move, or everyday life.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loqui — Find your rhythm in English',
    description: 'Your personalized 4-week plan, built in two minutes.',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5EEE2' },
    { media: '(prefers-color-scheme: dark)', color: '#151019' },
  ],
  width: 'device-width',
  initialScale: 1,
};

// Inline pre-hydration script: avoid light→dark flash for users who picked dark.
const themeBootScript = `
(function() {
  try {
    var s = localStorage.getItem('loqui-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (s === 'dark' || (!s && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeBootScript }}
          // This script must run before hydration to set the correct theme.
        />
      </head>
      <body className="min-h-[100svh] bg-surface text-ink antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
