import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

/**
 * Loqui Tailwind config.
 *
 * Colors reference CSS variables defined in `src/app/globals.css` so light and
 * dark modes can swap the same Tailwind utilities. Typography tokens use
 * `clamp()` for fluid scaling between 375px and 1280px viewports.
 */
const config: Config = {
  darkMode: 'class',
  // Wrap every `hover:` utility in `@media (hover: hover)` so hover styles
  // only apply to real pointer devices (mouse/trackpad). Fixes sticky-hover
  // on iOS Safari + Android Chrome, where a tap-release would leave the
  // previously-tapped card stuck in its hover state until another element
  // got tapped — making unselected coach cards look selected.
  future: { hoverOnlyWhenSupported: true },
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/content/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        // shadcn base tokens. Borders default to 12% alpha to match the
        // hairline treatment in design-system.md §1.1; use `border-border/50`
        // etc. to tune per-component.
        border: 'hsl(var(--border) / 0.12)',
        input: 'hsl(var(--input) / 0.12)',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          dark: 'hsl(var(--primary-dark))',
          light: 'hsl(var(--primary-light))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          deep: 'hsl(var(--accent-deep))',
          wash: 'hsl(var(--accent-wash))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Loqui semantic aliases
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          muted: 'hsl(var(--surface-muted))',
          elevated: 'hsl(var(--surface-elevated))',
        },
        ink: {
          DEFAULT: 'hsl(var(--ink))',
          muted: 'hsl(var(--ink-muted))',
          subtle: 'hsl(var(--ink-subtle))',
        },
        ember: {
          DEFAULT: 'hsl(var(--ember))',
          deep: 'hsl(var(--ember-deep))',
          wash: 'hsl(var(--ember-wash))',
        },
        success: 'hsl(var(--success))',
        error: 'hsl(var(--error))',
        warning: 'hsl(var(--warning))',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'ui-serif', 'serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
      },
      fontSize: {
        display: [
          'clamp(3rem, 2.2rem + 3.5vw, 4rem)',
          { lineHeight: '1.04', letterSpacing: '-0.02em' },
        ],
        h1: [
          'clamp(2rem, 1.55rem + 2.4vw, 2.75rem)',
          { lineHeight: '1.08', letterSpacing: '-0.015em' },
        ],
        h2: [
          'clamp(1.5rem, 1.3rem + 1vw, 1.875rem)',
          { lineHeight: '1.15', letterSpacing: '-0.01em' },
        ],
        h3: [
          'clamp(1.25rem, 1.2rem + 0.3vw, 1.375rem)',
          { lineHeight: '1.2', letterSpacing: '-0.005em' },
        ],
        'body-lg': [
          'clamp(1.0625rem, 1.03rem + 0.2vw, 1.125rem)',
          { lineHeight: '1.5' },
        ],
        body: ['1rem', { lineHeight: '1.55' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        caption: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        overline: [
          '0.6875rem',
          { lineHeight: '1.2', letterSpacing: '0.12em' },
        ],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
        xl: '28px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(35,26,46,0.06), 0 1px 1px rgba(35,26,46,0.04)',
        md: '0 4px 8px -2px rgba(35,26,46,0.08), 0 2px 4px -2px rgba(35,26,46,0.06)',
        lg: '0 12px 24px -8px rgba(35,26,46,0.12), 0 4px 8px -4px rgba(35,26,46,0.06)',
        xl: '0 24px 48px -16px rgba(35,26,46,0.18), 0 8px 16px -8px rgba(35,26,46,0.08)',
        focus: '0 0 0 3px rgba(217,107,60,0.35)',
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.25, 1, 0.35, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      screens: {
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'rhythm-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.4' },
          '50%': { transform: 'scale(1.25)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'rhythm-pulse': 'rhythm-pulse 1000ms ease-in-out infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
