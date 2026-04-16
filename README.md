# Loqui

Marketing funnel for **Loqui**, an AI English tutor that builds a personalized four-week plan in ten questions. Mobile-first Next.js 15 app with premium-editorial visual direction (Ink Plum + Ember, warm grain, italic-serif stress words).

## Tech stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS**
- **shadcn/ui** (New York style, Zinc base, CSS variables)
- **Zustand** + persist middleware for funnel state
- **Framer Motion** for screen transitions
- **Source Serif 4** (display) + **Inter** (UI) via `next/font/google`
- **Upstash Redis** (Vercel KV) for the submission outbox
- **Lucide** for icons
- Dark mode via `class` strategy

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The dev server runs at `http://localhost:3000`. No environment variables are required to run locally — the app runs in a fully mocked mode.

## Environment variables

| Variable | Purpose | Required? |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Bot API token — signup notifications | No (stub logs) |
| `TELEGRAM_CHAT_ID` | Chat ID the bot posts to | No (stub logs) |
| `KV_REST_API_URL` | Upstash Redis REST URL for the outbox | No (in-memory) |
| `KV_REST_API_TOKEN` | Upstash Redis REST token | No (in-memory) |
| `ANTHROPIC_API_KEY` | Enables the Claude plan-generation path | No (deterministic fallback) |

## Key architecture decisions

- **Claude is env-var gated.** `src/lib/claude.ts` throws unless `ANTHROPIC_API_KEY` is set. The `/api/plan` route always returns a plan — if Claude is off or errors, it falls through to `generateDeterministicPlan` in `src/lib/plan-generator.ts`. Users never see a broken reveal.
- **Analytics is a `console.log` wrapper.** `src/lib/analytics.ts` owns a single `track` function. Swapping in Amplitude is one file change: replace the `console.log` with `amplitude.track(event, props)` and no call site changes.
- **KV outbox pattern for submit.** Every signup is persisted to KV *before* Telegram is notified, so a bot-API hiccup never loses a lead. `src/lib/kv.ts` falls back to an in-memory map when `KV_REST_API_*` aren't set, so dev works offline.
- **Waitlist base = 2,487.** Defined in `src/lib/state.ts` and `src/lib/kv.ts`.
- **Dark mode uses the class strategy.** `ThemeToggle` flips `.dark` on `<html>`; an inline bootstrap script in `layout.tsx` applies the saved preference before hydration to avoid a flash.

## Adding Claude later

1. `npm i @anthropic-ai/sdk`
2. Set `ANTHROPIC_API_KEY` in `.env.local`.
3. Replace the body of `generatePlanWithClaude` in `src/lib/claude.ts` with a real Anthropic call using the prompt template in `tasks/question-spec.md` §Q9.
4. Validate the response with a `zod` schema before returning.

No other file needs to change — the `/api/plan` route already prefers Claude when enabled.

## Adding Amplitude later

1. `npm i @amplitude/analytics-browser`
2. Replace the `console.log` inside `track` in `src/lib/analytics.ts` with `amplitude.track`.
3. Initialize Amplitude once in `layout.tsx` (or a client-only provider).

## Project structure

```
src/
  app/
    layout.tsx         # Fonts, metadata, theme bootstrap
    page.tsx           # Landing / hook screen
    privacy/           # Placeholder privacy policy
    api/
      plan/route.ts    # POST — Claude-gated, deterministic fallback
      submit/route.ts  # POST — stub returning { ok: true }
    globals.css        # Tokens, grain, focus ring
  components/
    funnel/            # QuestionShell, ProgressBar, ThemeToggle
    ui/                # shadcn primitives (button, input, slider, etc.)
  lib/
    analytics.ts       # console.log wrapper, Amplitude-ready
    claude.ts          # Env-gated stub
    kv.ts              # Upstash Redis wrapper with in-memory fallback
    plan-generator.ts  # 12-template matrix (1 implemented, 11 stubs)
    state.ts           # Zustand + persist
    telegram.ts        # Bot API client
    types.ts           # FunnelState, Plan, PhraseChallenge
    utils.ts           # cn() helper
  content/
    questions.ts       # Q1-Q10 definitions
    phrase-challenges.ts  # 6 Q7 seeds with stub feedback
    plans.ts           # 12-template manifest
    segments.ts        # 4 segment definitions
tasks/
  question-spec.md     # Product spec (referenced by engineering)
  design-system.md     # Visual system
  todo.md              # Live worklist
```

## v2 personalization

The funnel ships a personalization layer on top of the 10-question flow:

- **Coach selection (Q8).** Four coaches — Marcus (American), Elena (British), Aiko (Australian), David (Canadian) — each mapped to an underlying learning style. Picking a coach writes both `q8_coach` and the matching `q8_style`, so the plan-template matrix keeps working unchanged. The Q9 reveal opens with a segment-specific italic quote from the chosen coach; the success screen announces the coach by name.
- **Age bracketing (Q4).** Replaces prior-app multi-select with a six-bracket age question (Under 18, 18–24, 25–34, 35–44, 45–54, 55+). The old field stays on the type for back-compat with stale sessions.
- **UTM presetting.** Landing URL params are read on funnel mount. `utm_*` is recorded against `funnel_started`. `age`, `segment`, and `lang` hints preseed Q3 / Q4 / the help-tooltip locale when the user hasn't already answered. Every question still renders — the answer is just pre-filled. Try `?utm_campaign=career_35plus&age=35_44&segment=career&lang=es`.
- **Language accessibility.** A "?" tooltip in the funnel header opens a short explanation of the quiz in the user's language (Spanish, Portuguese, French, Russian, Chinese, Korean, Arabic, Japanese; English fallback). Locale resolves from `lang_hint` → `ui_locale_hint` → `navigator.language`. A `pickCopy(level, standard, simple)` helper also swaps in simpler question copy when Q2 level is `getting_by`.

See `tasks/question-spec.md` §"v2 — Coach + Age + UTM + Accessibility" for the full contract.

## Scripts

- `npm run dev` — dev server with hot reload
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — Next.js ESLint
- `npm run typecheck` — `tsc --noEmit`
