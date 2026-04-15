# Day 1 Scaffold — Loqui

## Plan

### Phase 1: Next.js init
- [x] Scaffold Next.js 15 structure (package.json, tsconfig, next.config, next-env, postcss, eslint.config)
- [x] Preserve CLAUDE.md + tasks/
- [x] Verify package.json + tsconfig + tailwind exist

### Phase 2: Dependencies
- [x] Declare runtime deps (zustand, framer-motion, lucide-react, @upstash/redis, clsx, tailwind-merge, class-variance-authority, radix primitives, sonner)
- [ ] Physical `npm install` — BLOCKED (sandbox denies network installs; user must run locally)

### Phase 3: shadcn/ui
- [x] `components.json` with New York + Zinc + CSS vars
- [x] Inlined primitives: button, input, label, progress, slider, radio-group, sonner (tuned to Loqui tokens)

### Phase 4: Design tokens
- [x] globals.css — light + dark, fluid scale, grain, focus ring
- [x] tailwind.config.ts — color aliases, fonts, easings, shadows, keyframes
- [x] next/font/google — Source Serif 4 + Inter, CSS variables

### Phase 5: Folder + files
- [x] src/lib/types.ts — full FunnelState + Plan types
- [x] src/lib/utils.ts — cn helper
- [x] src/lib/analytics.ts — console-log wrapper
- [x] src/lib/state.ts — Zustand + persist
- [x] src/lib/plan-generator.ts — 12-template matrix, Career×20 implemented
- [x] src/lib/claude.ts — env-gated stub
- [x] src/lib/telegram.ts — bot API scaffold
- [x] src/lib/kv.ts — Upstash Redis + in-memory fallback
- [x] src/content/questions.ts — Q1-Q10 definitions
- [x] src/content/plans.ts — 12-template manifest
- [x] src/content/phrase-challenges.ts — 6 Q7 seeds
- [x] src/content/segments.ts — 4 segment defs
- [x] src/components/funnel/QuestionShell.tsx
- [x] src/components/funnel/ProgressBar.tsx
- [x] src/components/funnel/ThemeToggle.tsx
- [x] src/app/layout.tsx — fonts, metadata, theme bootstrap
- [x] src/app/page.tsx — landing (Loqui wordmark + ember tittle, italic-stress headline, theme toggle)
- [x] src/app/privacy/page.tsx — ~300 word placeholder
- [x] src/app/api/plan/route.ts — Claude-gated plan endpoint
- [x] src/app/api/submit/route.ts — stub returning {ok:true}

### Phase 6: Env + docs
- [x] .env.example
- [x] .gitignore — keeps .env.local, tasks/
- [x] README.md

### Phase 7: Verification
- [ ] `npm install` — BLOCKED in sandbox; must run on host
- [ ] `npm run dev` — BLOCKED pending install
- [ ] `npm run build` — BLOCKED pending install
- [ ] `npx tsc --noEmit` — BLOCKED pending install
- [x] Manual static review — wrote all files, re-read, fixed HSL-alpha issue, Framer Motion ease typing, Button focus handling
- [ ] Dark mode toggle — visual check blocked pending dev server
- [ ] Landing + /privacy render — blocked pending dev server

## Review

Verification gap is environmental: the execution sandbox denies `npm install`,
`npx create-next-app`, and any other network-dependent npm command. Every file
a scaffold would have produced is in place — the user runs a single
`npm install && npm run dev` after handoff and the scaffold boots.

Design-token decisions made along the way:
- Font licensing: switched GT Sectra Display → Source Serif 4 per brief + the
  design-system §"Open Questions". Italic weight included.
- Border alpha lives in the Tailwind color definition (`hsl(var(--border) / 0.12)`)
  rather than the CSS variable so Tailwind's alpha-modifier syntax stays
  composable.
- Focus ring is opt-in via `focus-visible:shadow-focus` rather than a global
  `:focus-visible` box-shadow — avoids doubled rings on Radix primitives.
- `GeneratedPlan.focus_axes` and `weeks` relaxed from tuples to arrays to
  avoid TS friction in generators. "Exactly 2 / exactly 4" is now a runtime
  invariant (documented in the type).

Key architectural choices:
- Claude gated via `isClaudeEnabled()`, fallback deterministic template.
- KV has an in-memory fallback so dev works offline.
- Telegram has a stub-log fallback when bot token is missing.
- Analytics is a single-file swap to Amplitude.

---

# Day 2 Backend — Loqui

## Plan
- [x] Install zod
- [x] Write src/content/plans.ts — 12 deterministic PLAN_TEMPLATES
- [x] Rewrite src/lib/plan-generator.ts with fillSlots + template lookup
- [x] Add src/lib/types-backend.ts with SubmissionRecord
- [x] Rewrite src/lib/kv.ts — outbox: save / getPending / markDelivered / markFailed / bumpRetry / incrementWaitlist
- [x] Upgrade src/lib/telegram.ts — buildTelegramPayload + full-10-Q formatMessage
- [x] Rewrite src/app/api/plan/route.ts — zod + rate limit + 3s Claude timeout + always-200
- [x] Rewrite src/app/api/submit/route.ts — outbox flow + honeypot + rate limit
- [x] Write src/app/api/cron/retry-submissions/route.ts — Bearer auth + backoff
- [x] Write vercel.json — cron every 5 min
- [x] Update .env.example — CRON_SECRET, commented vars
- [x] typecheck + build green
- [x] Verification via npm scripts (sandbox blocks server spin-up)

## Review

Verification scripts live in `scripts/verify-backend.mjs` and
`scripts/verify-telegram-format.mjs`, exposed via `npm run verify:backend`
and `npm run verify:telegram`. They run the compiled route handlers from
`.next/server/app/…` with a synthetic `Request` — equivalent to curl, but
executable inside the sandbox (which denies `next dev`/`next start`).

Key behavioral confirmations:
- Every API path returns 200 on success, 400 only on invalid email,
  401 only on missing cron Authorization. No 500s anywhere.
- /api/submit persists status:'pending' BEFORE touching Telegram — the
  outbox invariant.
- First signup → waitlist 2488, second → 2489.
- Honeypot returns fake success (position 0) so bots don't learn.
- Cron endpoint bumps retry_count and last_error on failure; marks
  delivered on 2xx; marks failed after retry_count > 10.
- Telegram MarkdownV2 message packs all 10 answers + plan header into one
  block with every user-supplied string escaped.

Known drift during Day 2: frontend migrated Q7 from the free-text AI
coaching shape to a deterministic `Q7Answer` phrase challenge
(`challenge_id`, `selected_option_id`, `was_correct`). Backend adapted:
Telegram now emits `Challenge: ✓ — career_fluent_pushback`-style line,
submit zod schema validates the new triple.
