# Loqui — Visual Design System

> **Tagline:** Find your rhythm in English.
> **Voice:** Confident-premium with warmth.
> **Mobile-first.** Stripe / Linear / Arc-tier polish.

Single source of truth. An engineer should be able to implement any screen from this spec unambiguously.

---

## 0. Direction Summary

Starting palette refined. `#1B2A4E` reads a touch corporate-blue; swap to **Ink Plum** (`#231A2E`) — warmer, more editorial, still deep. Cream warms slightly. Accent is **Ember** (`#D96B3C`): warmth and rhythm without "bootcamp orange." Display face: **GT Sectra Display**. UI face: **Inter**. The wordmark carries the personality so the UI stays disciplined.

Three signature moves announced up-front; every other decision supports them:

1. **Rhythm mark** — three ember dots used as loader, divider, favicon core.
2. **Italic serif stress word** — one italicized serif word inside a sans sentence ("find your *rhythm*"). Editorial, premium.
3. **Warm grain** — 1.5% SVG noise on cream surfaces. Kills the flat-SaaS feel.

---

## 1. Design Tokens

### 1.1 Color

Contrast pairs audited against surface (`#F5EEE2`). AA body ≥ 4.5:1, AA large ≥ 3:1.

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `--color-primary` | `#231A2E` | Ink Plum; headings, CTA bg | 16.1:1 (AAA) |
| `--color-primary-dark` | `#14101C` | Pressed CTA | 18.9:1 |
| `--color-primary-light` | `#3D2F50` | Hover on dark bg | 12.4:1 |
| `--color-surface` | `#F5EEE2` | Page bg (warm cream) | — |
| `--color-surface-muted` | `#ECE3D3` | Card, input bg | — |
| `--color-surface-elevated` | `#FBF7EE` | Modal, floating | — |
| `--color-ink` | `#1C1722` | Body text | 15.0:1 (AAA) |
| `--color-ink-muted` | `#5B5366` | Secondary text | 6.2:1 (AA) |
| `--color-ink-subtle` | `#8A8296` | Placeholder | 3.5:1 (large only) |
| `--color-accent` | `#D96B3C` | Ember; progress, highlight | 4.6:1 (AA) |
| `--color-accent-deep` | `#B04F25` | Pressed ember | 6.8:1 |
| `--color-accent-wash` | `#F2D9C9` | Tinted success bg | — |
| `--color-success` | `#2F7D5C` | Correct / submitted | 5.4:1 |
| `--color-error` | `#B3412C` | Validation | 6.3:1 |
| `--color-warning` | `#C48A1E` | Soft alert | 4.6:1 |
| `--color-border` | `rgba(28,23,34,0.12)` | Hairline | — |
| `--color-focus-ring` | `#D96B3C` | Keyboard focus | 3:1 |

**Dark mode (optional).** Surface `#151019`, surface-muted `#201724`, primary becomes cream. Ember shifts to `#E88556` to hold AA on dark plum. Tokens re-map under the same names.

### 1.2 Typography

- **Display / headings:** GT Sectra Display (fallback Tiempos Headline, `ui-serif`).
- **UI / body:** Inter Variable (fallback `ui-sans-serif`).
- **Mono:** JetBrains Mono (rare, for transcript mock).

Fluid scale via `clamp()`. 375px min → 1280px max.

| Token | px range | `clamp()` | LH | Tracking |
|---|---|---|---|---|
| `display` | 48–64 | `clamp(3rem, 2.2rem + 3.5vw, 4rem)` | 1.04 | -0.02em |
| `h1` | 32–44 | `clamp(2rem, 1.55rem + 2.4vw, 2.75rem)` | 1.08 | -0.015em |
| `h2` | 24–30 | `clamp(1.5rem, 1.3rem + 1vw, 1.875rem)` | 1.15 | -0.01em |
| `h3` | 20–22 | `clamp(1.25rem, 1.2rem + 0.3vw, 1.375rem)` | 1.2 | -0.005em |
| `body-lg` | 17–18 | `clamp(1.0625rem, 1.03rem + 0.2vw, 1.125rem)` | 1.5 | 0 |
| `body` | 16 | `1rem` | 1.55 | 0 |
| `body-sm` | 14 | `0.875rem` | 1.5 | 0 |
| `caption` | 12 | `0.75rem` | 1.4 | 0.02em |
| `overline` | 11 | `0.6875rem` | 1.2 | 0.12em, uppercase |

Weights: serif 400 regular + 400 italic (no bold serif); sans 400 / 500 / 600.

### 1.3 Spacing (4px base)

```
--space-0: 0     --space-4: 16px (default)   --space-7: 48px
--space-1: 4px   --space-5: 24px             --space-8: 64px
--space-2: 8px   --space-6: 32px             --space-9: 96px
--space-3: 12px                              --space-10: 128px
```

### 1.4 Radius

```
--radius-sm: 6px    pills, inputs
--radius-md: 12px   buttons, option cards
--radius-lg: 20px   question shell, modal
--radius-xl: 28px   hero, plan card
--radius-full: 999px
```

### 1.5 Shadows (layered, tinted toward plum — never black)

```
--shadow-sm: 0 1px 2px rgba(35,26,46,0.06), 0 1px 1px rgba(35,26,46,0.04);
--shadow-md: 0 4px 8px -2px rgba(35,26,46,0.08), 0 2px 4px -2px rgba(35,26,46,0.06);
--shadow-lg: 0 12px 24px -8px rgba(35,26,46,0.12), 0 4px 8px -4px rgba(35,26,46,0.06);
--shadow-xl: 0 24px 48px -16px rgba(35,26,46,0.18), 0 8px 16px -8px rgba(35,26,46,0.08);
--shadow-focus: 0 0 0 3px rgba(217,107,60,0.35);
```

### 1.6 Motion

```
--duration-instant: 100ms  --duration-slow: 400ms
--duration-fast: 150ms     --duration-deliberate: 600ms
--duration-base: 250ms

--ease-out-quart: cubic-bezier(0.25, 1, 0.35, 1)   ← default (crisper than native ease-out)
--ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1)    ← screen transitions
--ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1) ← selection feedback only
```

### 1.7 Breakpoints (mobile-first)

`sm: 480px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`.

### 1.8 TypeScript Tokens

```ts
export const tokens = {
  color: {
    primary: '#231A2E', primaryDark: '#14101C', primaryLight: '#3D2F50',
    surface: '#F5EEE2', surfaceMuted: '#ECE3D3', surfaceElevated: '#FBF7EE',
    ink: '#1C1722', inkMuted: '#5B5366', inkSubtle: '#8A8296',
    accent: '#D96B3C', accentDeep: '#B04F25', accentWash: '#F2D9C9',
    success: '#2F7D5C', error: '#B3412C', warning: '#C48A1E',
    border: 'rgba(28,23,34,0.12)',
  },
  space: [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128],
  radius: { sm: 6, md: 12, lg: 20, xl: 28, full: 999 },
  duration: { instant: 100, fast: 150, base: 250, slow: 400, deliberate: 600 },
  ease: {
    outQuart: [0.25, 1, 0.35, 1],
    outExpo: [0.16, 1, 0.3, 1],
    spring: [0.34, 1.56, 0.64, 1],
  },
} as const;
```

### 1.9 Tailwind Config

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#231A2E', dark: '#14101C', light: '#3D2F50' },
        surface: { DEFAULT: '#F5EEE2', muted: '#ECE3D3', elevated: '#FBF7EE' },
        ink: { DEFAULT: '#1C1722', muted: '#5B5366', subtle: '#8A8296' },
        accent: { DEFAULT: '#D96B3C', deep: '#B04F25', wash: '#F2D9C9' },
        success: '#2F7D5C', error: '#B3412C', warning: '#C48A1E',
      },
      fontFamily: {
        serif: ['"GT Sectra Display"', '"Tiempos Headline"', 'ui-serif', 'serif'],
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui'],
      },
      fontSize: {
        display: ['clamp(3rem, 2.2rem + 3.5vw, 4rem)', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        h1: ['clamp(2rem, 1.55rem + 2.4vw, 2.75rem)', { lineHeight: '1.08', letterSpacing: '-0.015em' }],
        h2: ['clamp(1.5rem, 1.3rem + 1vw, 1.875rem)', { lineHeight: '1.15' }],
        'body-lg': ['clamp(1.0625rem, 1.03rem + 0.2vw, 1.125rem)', { lineHeight: '1.5' }],
        overline: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.12em' }],
      },
      borderRadius: { sm: '6px', md: '12px', lg: '20px', xl: '28px' },
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
      screens: { sm: '480px', md: '768px', lg: '1024px', xl: '1280px' },
    },
  },
};
```

---

## 2. Logo

**Two directions considered.** Direction A (chosen): serif wordmark with an ember tittle. Direction B (rejected): abstract Q-glyph with soundwave — felt podcast-y.

### Chosen: **Loqui** wordmark with ember tittle

- **Wordmark:** GT Sectra Display, 400, tracking `-0.02em`.
- **Tittle:** the dot over the *i* is replaced by a filled ember circle, diameter = 0.22 × cap height, sitting 2px above default tittle position. Reads as a "struck note" — one beat above the word.
- **Favicon / icon at 32×32:** the lowercase serif **q** in ink at 50% opacity, with the ember dot centered at 10px diameter over it. At 16×16 the q drops away and only the ember dot remains. This is the **rhythm mark**.
- **Variants:**
  - Light surface: ink-plum wordmark, ember tittle.
  - Dark surface: cream wordmark, ember tittle (+5% luminosity).
  - Monochrome (email footer): all ink, tittle still circle (no color).
- **Placement rules:**
  - Header: top-left, 24px height, 20px from edge. Never centered.
  - Email footer: 20px height, monochrome, above unsubscribe.
  - Success screen: centered, 48px height, 32px below headline.
  - Never stretched, never recolored, never on photography.

```
 L o q u  ●      ← ember tittle, offset +2px up
```

---

## 3. Screen Mockups (375×812 baseline)

### 3.1 Hook Screen (Q1)

```
Loqui●                                    ← 24px wordmark, top-left
[64px]
Find your
rhythm in              ← text-display, serif; "rhythm" italicized
English.               ← ember cursor blinks at period

A 90-second read of
where your English     ← body-lg, ink-muted
actually stands.
[48px]
┌─────────────────────┐
│     Begin  →        │ ← primary CTA, full-width
└─────────────────────┘
Takes 2 minutes. No signup.  ← caption, ink-subtle, centered
```

- Hero zone top 30%: logo only. Headline sits just above thumb reach.
- No imagery. Warm grain visible on surface.
- Entry: headline fade-up 12px over 400ms `ease-out-expo`. CTA fades in 200ms later. Cursor starts blinking at 800ms.

### 3.2 Question Card (Multi-Choice)

```
← Back           Profile · 2/9       ← overline, ink-muted
▓▓▓▓▓░░░░  ░░░░░  ░░░░░              ← 3-section progress bar
[32px]
What pulls you
toward English           ← h1, serif
right now?

Pick what feels truest.  ← body, ink-muted
[24px]
┌─────────────────────┐
│ ◯  Career growth    │ ← option card, default
└─────────────────────┘
┌─────────────────────┐
│ ●  A test I need…   │ ← option card, selected (ember ring)
└─────────────────────┘
┌─────────────────────┐
│ ◯  Moving abroad    │
└─────────────────────┘
┌─────────────────────┐
│ ◯  Travel & everyday│
└─────────────────────┘
[auto]
┌─────────────────────┐
│     Continue  →     │ ← CTA disabled until selection
└─────────────────────┘
```

Options stagger in 60ms apart, fade + slide-up 8px, `ease-out-quart`. 64px card height keeps thumb-reachable.

### 3.3 Slider Question (Time Commitment)

```
← Back           Moment · 5/9
▓▓▓▓▓▓▓▓▓▓  ▓▓▓░░  ░░░░░

How much time
each day can you       ← h1, serif
realistically give?
[32px]
        15             ← text-display, serif, centered
     minutes           ← body, ink-muted
[40px]
5 ●━━━━━━━━━━○━━━ 60  ← slider with ember fill
Short but consistent   ← serif italic, ink-muted
beats long and rare.
[auto]
┌─────────────────────┐
│     Continue  →     │
└─────────────────────┘
```

Numeric readout updates with spring easing. Contextual copy shifts at thresholds (≤10 "A focused bite.", 11–20 "Short but consistent…", 21–40 "Momentum.", 41+ "Committed.").

### 3.4 Live AI Proof (Q7)

```
← Back           Moment · 7/9
▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓▓▓  ░░░░░

Say one line,
any topic.             ← h1, serif

(I'll read it like a
 tutor would.)         ← body, ink-muted

┌─────────────────────┐
│ Last weekend I went │
│ to the park with my │ ← textarea input
│ kids…               │
└─────────────────────┘

● ● ●  Reading…        ← rhythm mark loader

┌─────────────────────┐
│ ⌇ One note:         │ ← elevated card w/ ember left rule
│                     │
│ You're clear and    │
│ warm. The word      │
│ *went* is fine — a  │ ← italic serif "went"
│ native might say    │
│ "took the kids to   │
│ the park." That's a │
│ rhythm shift, not a │
│ grammar fix.        │
└─────────────────────┘

┌─────────────────────┐
│     Continue  →     │
└─────────────────────┘
```

AI response card slides up 16px + fades over 500ms `ease-out-expo`. Highlighted word gets serif italic — the signature stress applied in-context. `aria-live="polite"` on the card.

### 3.5 Interstitial Reward (Readiness Score Preview)

```
READINESS FORMING      ← overline, ember, centered

   ╭────╮
  ╱  73  ╲             ← animated ring, score rolls 0→73
 │ ready  │            ← serif display
  ╲      ╱
   ╰────╯

You're further along
than most people       ← body-lg, ink, centered
think they are.

● ● ●                  ← rhythm mark divider

Two more questions
to tune your plan.     ← body, ink-muted

┌─────────────────────┐
│   Keep going  →     │
└─────────────────────┘
```

Score rolls with tabular-nums over 1200ms. Ring stroke draws at matching rate, ember.

### 3.6 Loading / Generating (Q9)

```
        ● ● ●          ← rhythm mark, pulsing

  Building your
  cadence…             ← h2, serif, crossfades through 3 states
```

Copy states (900ms each, 300ms crossfade):
1. "Reading your answers…"
2. "Matching your rhythm…"
3. "Shaping your plan…"

Background has a 5% ember radial glow behind the dots.

### 3.7 Plan Reveal

```
YOUR CADENCE                        ← overline, ember

A 6-week plan
built for *your* rhythm.            ← h1, serif, italic "your"
[32px]
┌──────────────────────────────┐
│ WEEK 1 · Foundation          │
│ ───────────────────────      │
│ ● 15-min morning reps        │
│ ● 2 AI dialogue rounds       │
│ ● 1 fluency review           │
└──────────────────────────────┘
┌──────────────────────────────┐
│ WEEK 2 · Pressure test       │
│ ...                          │
└──────────────────────────────┘
       [more cards]
┌──────────────────────────────┐
│   Save my plan  →            │
└──────────────────────────────┘
```

Cards cascade from below, 120ms stagger, 24px translateY, 500ms `ease-out-expo`. First card starts 300ms after screen enter. Bullets inside each card then stagger fade-only at 60ms.

### 3.8 Email Capture (Q10)

```
← Back           Plan · 9/9
▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓

Where should I
send your plan?        ← h1, serif

It's yours to keep, free. ← body, ink-muted
[32px]
┌─────────────────────┐
│ you@email.com       │ ← email input
└─────────────────────┘

☐  Send weekly check-ins too. ← opt-in, UNCHECKED by default

┌─────────────────────┐
│   Send my plan  →   │
└─────────────────────┘
We never share your email.   ← caption, ink-subtle
One-click unsubscribe.
```

### 3.9 Success

```
        Loqui●         ← 48px logo, centered

          ✓            ← checkmark animation

Check your inbox.      ← h1, serif

Your plan is on its
way — and your first   ← body-lg, ink-muted
5-minute practice is
waiting inside.
[48px]
        ● ● ●          ← static rhythm mark

Find your rhythm in English. ← body-sm, serif italic, ink-subtle
```

---

## 4. Core Components

### 4.1 Progress Bar (3-section: Profile → Moment → Plan)

- Full width minus 48px, 8px tall, 4px gap between segments.
- Default: `--color-border` bg. Fill: `--color-accent`, rounded caps.
- Active segment pulses (opacity 0.85→1.0, 1200ms loop). Completed segment: full ember, static.
- Fill animates with spring (stiffness 180, damping 22, 500ms).
- Overline label above: `Profile · 2/9`.
- ARIA: `role="progressbar"`, `aria-valuenow`, `aria-valuemax="9"`, `aria-label="Question 2 of 9"`.

### 4.2 Question Shell

- Max-width 520px, centered on tablet+.
- Padding: 24px horizontal, 24px top, 20px bottom.
- Sticky header (64px): back + step label + progress bar.
- Sticky footer (96px, safe-area-inset aware): primary CTA.
- Main content scrolls; 24px bottom fade overlay if clipped.

### 4.3 Option Card (single-choice)

- Full width, min-height 64px, padding 16/18. Radius `md` (12px).
- **Default:** `surface-muted` bg, 1px `border`, radio circle left.
- **Hover:** bg → `surface-elevated`, border strong, `shadow-sm`. 150ms.
- **Focus:** `shadow-focus` ring, no other change.
- **Active/press:** scale 0.98, 100ms.
- **Selected:** bg `surface-elevated`, 2px ember border, radio fills with ember (dot scales 0→1 with spring, 250ms).
- **Disabled:** opacity 0.4, no pointer events.

### 4.4 Option Pill (multi-choice)

- Height 40px, padding 10/18, radius `full`. Inline wrap, 8px gap.
- Default: `surface-muted` bg, no border.
- Selected: `primary` bg, `surface` text.
- Tap: same spring scale as option card.

### 4.5 Primary Button

- Height 56px, full width within container (max 480px), radius `md`.
- Bg `primary`, text `surface`, Inter 500, 17px, tracking `-0.005em`.
- Ember `→` glyph right, 18px, 8px gap.
- **Hover:** bg `primary-light`, `shadow-md`, 150ms.
- **Press:** scale 0.97, bg `primary-dark`, 100ms.
- **Focus:** `shadow-focus`.
- **Disabled:** opacity 0.45, arrow hidden.
- **Loading:** label replaced by rhythm-mark loader at 28px, bg unchanged.

### 4.6 Secondary Button / Text Link

- Text only. Inter 500, 15px, color `ink-muted`.
- Hover: color `ink`, 2px-offset underline.
- Used for "Back", "Skip", "Change answer".

### 4.7 Input Field

- Height 56px single-line; textarea auto-expands to max 160px. Radius `md`.
- Bg `surface-muted`. Border 1px `border` → 2px `primary` on focus.
- Text `ink`, 17px, 16px padding. Placeholder `ink-subtle`.
- Label above, 8px gap, `body-sm`, `ink-muted`. **No placeholder-only labels.**
- Error: 2px `error` stroke + helper text below.
- Success: 2px `success` stroke + inline check right.

### 4.8 Slider

- Track 4px, `border` bg, full width minus 48px.
- Fill ember; snaps into place on release via spring.
- Thumb 28px, `surface-elevated`, 2px ember border, `shadow-md`.
- Value bubble above thumb on drag: 32px pill, `primary` bg, cream text, fades in 200ms.
- No tick marks — numeric readout above the slider is the source of truth.

### 4.9 Loading Indicator (rhythm mark)

Three ember dots, staggered pulse. Each: `scale(1) opacity(0.4) → scale(1.25) opacity(1) → scale(1) opacity(0.4)` over 1000ms. Offsets 0 / 150 / 300ms. Infinite.

- Button loading: 6px dots, 8px gap.
- Fullscreen loading: 12px dots, 20px gap.
- Inline "reading" indicator: 8px dots, 12px gap.

Same motif, three sizes. Doubles as favicon core and divider.

### 4.10 Success Checkmark Animation

- 80px circle, 3px ember stroke, drawn via `stroke-dashoffset` over 400ms `ease-out-expo`.
- Check inside, ink stroke, draws 300ms starting at 200ms (overlap).
- Circle fills `accent-wash` over 200ms once check completes.
- One-shot, no loop.

---

## 5. Animation & Interaction

### 5.1 Screen Transitions (Framer Motion)

Cards slide horizontally with a subtle parallax — not fades, not flips.

```ts
export const screenVariants = {
  enter: (dir: 1 | -1) => ({ x: dir * 32, opacity: 0, scale: 0.985 }),
  center: {
    x: 0, opacity: 1, scale: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (dir: 1 | -1) => ({
    x: dir * -24, opacity: 0, scale: 0.99,
    transition: { duration: 0.25, ease: [0.25, 1, 0.35, 1] },
  }),
};
```

Forward nav: `direction=1`; back: `direction=-1`. Outgoing moves less than incoming — that's the parallax.

### 5.2 Selection Micro-Interaction

- Pointerdown: scale 1→0.98, 100ms `ease-out-quart`.
- Pointerup (confirmed): scale to 1 via `ease-spring` (overshoot 1.015), 300ms.
- Border: 1→2px ember, 150ms. Radio dot scales 0→1 with spring, 250ms.
- Haptic: iOS `selection` impact; Android fallback `navigator.vibrate(10)`.

### 5.3 Progress Bar Fill

Spring: stiffness 180, damping 22, mass 0.8. Mechanical landing, not bouncy.

### 5.4 Button Tap

Press-in: scale 1→0.97, 100ms `ease-out-quart`. Release: spring to 1 (overshoot 1.005). Bg color does NOT animate during tap — stability signals the tap was captured.

### 5.5 Loading Copy States

Three states, 900ms hold each, 300ms crossfade (opacity + 4px translateY).

### 5.6 Plan Reveal Choreography

- Card stagger: 120ms.
- Each card: translateY 24→0, opacity 0→1, 500ms `ease-out-expo`.
- First card starts 300ms after screen enters.
- Bullets inside each card stagger fade-only at 60ms, after card transform completes.

### 5.7 Reduced Motion

`@media (prefers-reduced-motion: reduce)`:
- All translate/scale disabled.
- Transitions become opacity-only, 200ms linear.
- Loader dots become static ember circles.
- Progress fill becomes instant.
- Haptics still fire (not motion).

---

## 6. Accessibility

- **Contrast:** ink on surface 15:1; ink-muted 6.2:1; ember 4.6:1; cream on primary 16.1:1. All AA+.
- **Touch targets:** min 44×44pt. CTA 56pt, option card 64pt, pill 48pt effective.
- **Focus ring:** custom — 3px ember at 35% opacity, 2px offset. `:focus-visible` only. Never default `outline`.
- **Screen readers:**
  - Options: `role="radio"` in `role="radiogroup"` labeled by the question.
  - Progress: `role="progressbar"` with value/max/label.
  - AI response: `aria-live="polite"`.
  - Icon buttons: `aria-label` required.
- **Keyboard:** Tab through focusables; Up/Down cycles radios; Enter/Space selects; Esc = back.
- **Forms:** every input has visible `<label>`. No placeholder-only inputs.
- **Motion:** reduced-motion respected everywhere (§5.7).

---

## 7. Typography in Context

| Context | Family | Size | Weight | Style | Color |
|---|---|---|---|---|---|
| Hook headline | Serif | display | 400 | + 1 italic word | ink |
| Question prompt | Serif | h1 | 400 | optional italic stress | ink |
| Section title | Serif | h2 | 400 | regular | ink |
| Body paragraph | Sans | body-lg | 400 | regular | ink-muted |
| Helper / subtitle | Sans | body | 400 | regular | ink-muted |
| Option label | Sans | body-lg | 500 | medium | ink |
| Button text | Sans | 17px | 500 | medium | cream on primary |
| Overline / step | Sans | overline | 600 | uppercase, +0.12em | ember or ink-muted |
| Plan week header | Sans | overline | 600 | uppercase | ink |
| Plan bullets | Sans | body | 400 | regular | ink |
| Fine print | Sans | caption | 400 | regular | ink-subtle |
| Inline stress | Serif | inherit | 400 | italic | inherit |

**Rule:** one italic serif word per sentence, maximum. More than that reads as a literary magazine.

---

## 8. Signature Moves (The "Wow")

**The rhythm mark (● ● ●).** Three ember dots used as loader, divider, footer ornament, favicon. Always ember, always three, always equal-spaced. Screenshot with three ember dots on cream = Loqui.

**The italic serif stress word.** One italic serif word inside every sans-serif hero/question sentence. Crosses typographic registers deliberately — the design equivalent of vocal stress. Signals the product cares about language itself.

**Warm grain surface.** 1.5% SVG noise on cream, baked into CSS (survives zoom). Invisible at a glance, undeniable at second glance. Kills flat-SaaS.

```css
body {
  background-color: var(--color-surface);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E");
  background-blend-mode: multiply;
}
```

---

## 9. Anti-Patterns (What Loqui Is Not)

- No neon or saturated gradients.
- No glassmorphism — not even one "tasteful blur" modal.
- No stock photography of smiling multicultural students.
- No owl, fox, parrot — no mascot.
- No AI sparkle or ✨ icons.
- No teal + purple duotone illustrations.
- No Duolingo bouncy full-screen celebrations.
- No abstract blob shapes or 3D render hero art.
- No SF Pro for UI (ties to iOS; we're platform-neutral).
- No default-black drop shadows.
- No uppercase body copy (overlines excepted).
- No "AI" in user-facing copy when "tutor" or "coach" will do.
- No fake-slow progress pretending to be thoughtful.
- No dark patterns on email capture (no pre-checked opt-in, no tiny "skip").

---

## Open Questions for Review

1. **Font licensing.** GT Sectra is paid. Fallbacks: Tiempos Headline (paid, cheaper) or Source Serif 4 (free). Inter is free.
2. **Dark mode scope.** Tokens specified; no mockups. In scope for funnel or future app only?
3. **Haptics on Android.** iOS gets native selection haptics; Android gets 10ms vibrate fallback. Drop Android if "cheap."
4. **Logo tittle animation.** Static everywhere, or blink once on the hook screen as a micro-hello? My vote: blink once on hook only.
5. **Italic stress word volume.** Rule is one per sentence max. If a copywriter feels plan reveal gets tic-y, drop to one per *screen*. Decide now, not later.
