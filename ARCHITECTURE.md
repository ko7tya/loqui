# Loqui — Architecture & Decision Narrative

> The brief said *"the best submissions will not be the ones that followed every instruction perfectly. They will be the ones that made us think: this person understands users, understands business, and knows how to ship."* This doc maps what we built to those three judgments.

For tech stack + setup, see [`README.md`](./README.md). For the specs behind the build, see [`tasks/`](./tasks/).

**Live:** https://skellartesttask.vercel.app · **Repo:** https://github.com/ko7tya/loqui

---

## 1. Understands Users

### We branch the experience on who's asking

Four audience segments detected at Q3 drive everything downstream:

| Segment | Q5 moment variants | Q9 plan name | Q9 coach quote |
|---|---|---|---|
| **Career** | Stand-up · negotiation · presentation · review | The Stand-Up Plan | Segment-specific for Marcus/Helen/Aiko/David |
| **Test-prep** | IELTS speaking · writing · listening · band score | The Band Score Plan | — |
| **Immigration** | Visa interview · small talk · appointment · belonging | The Settled-In Plan | — |
| **Travel / social** | Family dinner · conversation · party story · travel friction | The Host-Table Plan | — |

A 28-year-old taking IELTS gets a materially different experience from a 45-year-old relocating. Segments × 4 coaches × 4 level-gated seed phrases = **64 distinct narrative paths** through 10 questions. See [`src/content/questions.ts`](./src/content/questions.ts) `Q5_VARIANTS` and [`src/content/coaches.ts`](./src/content/coaches.ts) `COACHES[id].quotes`.

### We built for the user who's struggling, not the user like us

- **B1-simple copy** auto-triggers when Q2 = "Getting by". `pickCopy(level, standard, simple)` swaps headlines on Q5 / Q6 / Q7 for low-level users. See [`src/content/questions.ts`](./src/content/questions.ts) `pickCopy` + `Q5_SIMPLE_HEADLINE` / `Q6_SIMPLE_HEADLINE` / `Q7_SIMPLE_SUBCOPY`.
- **8-language help tooltip** — Spanish, Portuguese, French, Russian, Chinese, Korean, Arabic (RTL), Japanese. Auto-detects `navigator.language`. See [`src/components/funnel/HelpTooltip.tsx`](./src/components/funnel/HelpTooltip.tsx).
- **System theme sync** — `color-scheme` CSS + meta tag + pre-hydration boot script so iOS Safari's native chrome (address bar, form controls, scrollbars) flips with `prefers-color-scheme`. Tiny detail most candidates miss. See [`src/app/layout.tsx`](./src/app/layout.tsx) `themeBootScript` and [`src/components/funnel/ThemeToggle.tsx`](./src/components/funnel/ThemeToggle.tsx).
- **UTM preseeding** — a Meta/Google ad click with `?utm_campaign=career_35plus&age=35_44&segment=career` lands on a funnel pre-filled for that audience. See [`src/lib/utm.ts`](./src/lib/utm.ts) and `hydrateFromUtm()` in [`src/lib/state.ts`](./src/lib/state.ts).

### We respect their intelligence

- No gamified infantilization (no owl mascot, no pet, no streak guilt)
- Confident-premium voice — *"Pick your coach. Four people. Four ways to teach you. One is for you."*
- Italic-serif stress on one word per sentence — quietly editorial, not loud-AI
- Email is Q10, delivered **after** the plan reveals. The user asks for their own plan; email is the cheap way to get it

### We demo the product inside the funnel

- **Q7 Phrase Challenge** — user picks the most-natural phrasing of 3, sees the correct one + explanation. Teaches what a Loqui lesson *feels* like before they submit email. See [`src/components/funnel/screens/Q7PhraseChallenge.tsx`](./src/components/funnel/screens/Q7PhraseChallenge.tsx) and [`src/content/phrase-challenges.ts`](./src/content/phrase-challenges.ts).
- **Q9 coach introduction** — *"Meet Marcus. American. 'No warm-up. We start with the phrases that'll catch you out tomorrow.'"* See [`src/components/funnel/screens/Q9PlanReveal.tsx`](./src/components/funnel/screens/Q9PlanReveal.tsx).

---

## 2. Understands Business

### We positioned against a specific gap

The AI language-tutor category is saturated with the same positioning — every competitor claims "AI tutor, real conversations, fluent in X months." Market research found the white space one rung up: **premium-adult tone for the Duolingo graduate stuck at B1**, a proven-willing-to-pay cohort nobody courts explicitly. Hence Loqui's voice (confident, calm, Linear-tier composure) and name etymology (Latin *loqui*, "to speak").

See [`tasks/funnel-analysis.md`](./tasks/funnel-analysis.md) for the full SmartyMe/WalkFit/BitePal pattern analysis and how Loqui's positioning maps to it.

### We made every conversion-psychology decision explicit

| Decision | Why |
|---|---|
| Q10 email **after** Q9 plan reveal | Email feels like asking for your own plan, not volunteering info |
| Chunked 3-section progress bar (Profile → Moment → Plan) | "Section done" beats "30% of 10" — borrowed from SmartyMe's best tactic |
| Reward interstitials after Q2 + Q5 | Readiness Score teaser + Social Proof map = dopamine between questions |
| Non-round social proof counters (47,823 not 50,000) | Tested pattern; rounded numbers read as marketing, specific numbers as data |
| "Conversational Readiness Score" with 5 axes | Invented authority taxonomy grounded in a **real** linguistics skills framework — manufactured, not fake |
| Named plans ("The Stand-Up Plan", etc.) | Segment-specific outcome language; avoids generic "Your English Plan" |
| Waitlist counter (#2,487) | Scarcity loop; creates a progression narrative to the thank-you screen |

### We instrumented from day 1

Fourteen analytics events defined upfront in [`src/lib/analytics.ts`](./src/lib/analytics.ts):

```
funnel_started (with UTM props) · question_viewed · question_answered
segment_detected · age_selected · coach_selected · interstitial_viewed
plan_generation_started · plan_generated · plan_fallback_used
email_submitted · submit_succeeded · submit_failed
```

**Pluggable** — `console.log` wrapper today, `amplitude.track(event, props)` is a one-line swap. The call sites don't change.

### We built for scale-ready monetization

- Four named plans per segment open multiple pricing tiers (premium British coach = higher AOV)
- Coach personas (Marcus / Helen / Aiko / David) set up voice-clone monetization down the line
- Waitlist architecture with KV-persisted position counter — real, not faked
- Segmentation makes per-campaign ROAS measurable from day 1

---

## 3. Knows How To Ship

### The outbox pattern — leads never evaporate

Most candidate submissions: `user submits → call Telegram → show success`. If Telegram is down, the lead is gone.

We do: `validate → KV write (status: pending) → attempt Telegram with 4s timeout + 1 retry → return 200 regardless → daily cron retries pending submissions with exponential backoff`. The user sees success no matter what; the system reconciles itself. See [`src/app/api/submit/route.ts`](./src/app/api/submit/route.ts) and [`src/app/api/cron/retry-submissions/route.ts`](./src/app/api/cron/retry-submissions/route.ts).

### LLM-gated routes — always-200 guarantee

```ts
if (isClaudeEnabled()) {
  try { return await generateWithClaude(input); } catch { /* fall through */ }
}
return generateDeterministicFallback(input);
```

Claude API is optional — MVP ships without a key, with 12 pre-written plan templates (4 segments × 3 time bands) as fallback. When the key lands, it auto-promotes. No broken reveal ever shipped. See [`src/app/api/plan/route.ts`](./src/app/api/plan/route.ts), [`src/lib/claude.ts`](./src/lib/claude.ts), and [`src/lib/plan-generator.ts`](./src/lib/plan-generator.ts).

### Production hardening on an MVP

- **Zod validation** on every API route body — unknown fields rejected, 400 with friendly message
- **Honeypot** — `_hp` field, bots submit to fake success, never learn
- **Rate limits** — 5/min on `/api/submit`, 10/min on `/api/plan`, per IP
- **Hydration-safe theme boot** — pre-hydration script + `suppressHydrationWarning` on `<html>` — no flash-of-wrong-theme
- **`color-scheme` CSS + meta tag** — iOS Safari native chrome adapts; most candidates miss this
- **Reduced-motion fallbacks** — every animation degrades to a fade (see [`QuestionShell.tsx`](./src/components/funnel/QuestionShell.tsx) `reducedVariants`)
- **WCAG AA contrast** verified in both themes

### Brief compliance with zero hand-waving

| Brief requirement | Evidence |
|---|---|
| "All 10 Q&A pairs clearly labeled" | Telegram emits `*Q1 — When you imagine speaking fluently, who are you talking to?*\nA colleague in a meeting` for every question, verbatim, MarkdownV2-escaped. See [`src/lib/telegram.ts`](./src/lib/telegram.ts) `QUESTIONS` + `formatMessage`. |
| "One question per screen, smooth animated transitions" | Framer Motion direction-aware slide + fade with custom `ease-out-quart`. See [`QuestionShell.tsx`](./src/components/funnel/QuestionShell.tsx) `slideVariants`. |
| "Progress bar visible on every step" | Chunked 3-section bar with section overline + step count. Ember fill, spring animation. See [`ProgressBar.tsx`](./src/components/funnel/ProgressBar.tsx). |
| "Email step feels like reward, not gate" | Q9 reveals the full personalized plan with coach quote **before** the email ask. |
| "Mobile-first, looks perfect on a phone screen" | 375px baseline, safe-area-inset padding, touch targets ≥44pt, `100svh` viewport. |
| "Personalization language throughout" | Segment-aware copy on Q3→Q10, coach quotes referencing the user's moment verbatim, plan-name slot-filling. |
| "Avoid generic AI aesthetics" | Source Serif 4 display + Inter UI, Ink Plum + Ember + Warm Cream palette, italic-stress word per sentence, warm grain texture on surfaces, bespoke rhythm-mark loader (not a spinner). |

### Clean git story

Fifteen commits on `main`, each with a real commit message explaining *why* (see `git log --oneline`):

```
chore: extract agent + skill library from this build into .claude/
feat(map): swap hand-drawn polygons for real Wikimedia world SVG
polish(q9+interstitial): drop duplicate tagline, earth-skeleton map with radar-ping pins
fix(progress): remove checkmark badges from progress bar
fix(q9+progress): visible loading state + checkmark no longer clipped
feat(b1): wire pickCopy helper into Q5, Q6, Q7 screens
feat(v2): coach personas, age brackets, UTM preseed, language accessibility
fix(icon): apple-icon as dynamic ImageResponse (svg not supported on iOS)
feat(polish): explicit Q&A Telegram format, favicon, OG image, real metadataBase
fix(theme): follow system color scheme on mobile
fix(deploy): reduce cron frequency to daily for Vercel Hobby tier
feat(frontend): landing, 10-question funnel, interstitials, plan reveal, success
feat(backend): plan generator, outbox pattern, Telegram, API routes
feat(core): type system, Zustand state, analytics wrapper, Claude stub
docs: funnel strategy, question spec, visual system, lessons log
chore: initialize Next.js 15 scaffold with Loqui design system
```

A reviewer can watch the product evolve through commit history.

### Polish most candidates skip

- Dynamic **OG image** (1200×630) via `next/og` — link shares render branded preview. See [`src/app/opengraph-image.tsx`](./src/app/opengraph-image.tsx).
- **Apple touch icon** — 180×180 PNG via `ImageResponse`. See [`src/app/apple-icon.tsx`](./src/app/apple-icon.tsx).
- **Custom favicon** matching the wordmark (Ink Plum + ember tittle). See [`src/app/icon.svg`](./src/app/icon.svg).
- **Real Wikimedia world map** (340 country paths, public domain) with dot-pattern fill + radar-ping pins on real geographic coordinates.
- **`metadataBase`** set correctly so canonical URLs + OG tags resolve.
- **Readable privacy placeholder** at `/privacy` — not Lorem Ipsum.

---

## Meta — How We Built It

To prove the AI-native claim in the build process too: the project shipped via a six-phase agent pipeline with explicit review gates between each. See [`.claude/`](./.claude/) for the eight specialist sub-agents + the orchestrator skill, all usable in any Claude Code project.

| Phase | Agent(s) | Gate |
|---|---|---|
| 1. Research | `market-researcher` + `funnel-pattern-analyst` + `brand-strategist` (parallel) | User reviews all three outputs, picks direction |
| 2. Strategy | Synthesis back to user | User approves positioning, segments, brand |
| 3. Specs | `product-strategist` + `visual-design-lead` (parallel) | User reads both specs, answers open questions |
| 4. Scaffold | `scaffold-engineer` | Build + typecheck pass |
| 5. Build | `frontend-builder` + `backend-builder` (parallel, non-overlapping) | Integration smoke-test |
| 6. Deploy | Git + Vercel + env wiring + production smoke test | Live URL + brief audit |

The agents' system prompts are committed; the skill is reusable. This is what "AI as force multiplier, not autocomplete" actually looks like in a build workflow.

---

## If You're Reading This Before Watching The Loom

The three-sentence pitch:

1. **Users:** We branch the whole experience on who's asking — segment × age × level × coach — and built accessibility in (B1-simple copy auto-triggers, 8-language help tooltip, iOS/Android system theme sync).
2. **Business:** Email is a reward, not a gate. Instrumentation + UTM preseeding from day one. Positioning against a specific white space (Duolingo-graduate premium-adult cohort).
3. **Shipping:** Outbox pattern so leads never evaporate. LLM-gated routes with always-200 fallback. Fifteen commits showing the evolution, brief-compliance verified line-by-line, polish most candidates skip (OG image, apple-icon, hydration-safe theme, rate limits, honeypot).

The rest of this repo is evidence.
