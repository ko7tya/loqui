---
name: AI Funnel Orchestrator
description: Build an AI-native marketing funnel end-to-end using specialist sub-agents. Orchestrates research → strategy → specs → scaffold → build → deploy, with review gates at each phase.
---

# AI Funnel Orchestrator

Meta-workflow for building a marketing funnel for an AI product. Coordinates six specialist agents in five phases. Review gates between phases — no spec is written before strategy is approved, no code is written before specs are approved.

Assumes Claude Code with the agent files in `.claude/agents/` (this repo has them).

## Phase 1 — Research (parallel)

Dispatch three agents simultaneously:

| Agent | Purpose |
|---|---|
| `market-researcher` | Competitive landscape, pricing, audience segments, positioning gaps |
| `funnel-pattern-analyst` | Extract universal + niche patterns from 2–3 reference funnels |
| `brand-strategist` | Propose name / tone / visual direction / 6 candidate names |

**Review gate:** user reviews all three outputs and picks:
- Target audience segments
- Brand name + tone
- Which competitor patterns to steal / skip

## Phase 2 — Strategy approval

Synthesize research into a single strategic thesis. Confirm with user:
- Positioning hook for the landing page
- Audience segments to branch on
- AI-inside-funnel differentiators (live proof, personalized plan)
- Resilience architecture (outbox, rate limit, KV)
- Accessibility scope (dual-copy? tooltip translations?)
- Stack choices (TypeScript? Tailwind? shadcn?)

**This phase is cheap to iterate on. Spend time here.**

## Phase 3 — Specs (parallel)

Dispatch two agents:

| Agent | Output |
|---|---|
| `product-strategist` | `tasks/question-spec.md` — all questions, branching, state model, prompts, analytics events |
| `visual-design-lead` | `tasks/design-system.md` — tokens, logo, mockups, components, animations, a11y |

**Review gate:** user reviews both spec documents. Answers any "Open Questions" sections. Every ambiguity resolved before Phase 4.

## Phase 4 — Scaffold

Dispatch `scaffold-engineer`. It produces:
- Next.js 15 + TypeScript + Tailwind + shadcn/ui project
- Design tokens implemented from `tasks/design-system.md`
- Folder structure ready for builders
- Hydration-safe theme boot
- Env-var-gated LLM stub
- Pluggable analytics wrapper

**Must pass:** typecheck + build before Phase 5.

## Phase 5 — Build (parallel, non-overlapping scopes)

Dispatch two agents:

| Agent | Owns | Does NOT touch |
|---|---|---|
| `frontend-builder` | Screens, interstitials, state wiring, `src/content/questions.ts` | Backend libs, API routes, plan templates |
| `backend-builder` | API routes, outbox, notifier, plan generator, `src/content/plans.ts` | UI components, `src/app/funnel/` |

**Review gate:** integration test. `npm run build` + curl-test API + walk funnel end-to-end.

## Phase 6 — Deploy + polish

Sequential:

1. Git init + logical commits (one per phase) + push to GitHub
2. Deploy to Vercel, wire env vars, enable KV (or marketplace Redis)
3. Production smoke test: landing / funnel / APIs / real notifier delivery
4. Audit against brief (if applicable): every requirement, every "clearly labeled" check
5. Polish pass — OG image, favicon, metadataBase, privacy page content, accessibility verification
6. Hand off to user for Loom recording

## Principles

- **Review gates between phases matter more than phase speed.** One wrong spec multiplies into thousands of wasted lines.
- **Parallelize ruthlessly within a phase.** The research-agent trio and the frontend/backend builders share no files — run them concurrently.
- **Never let an agent invent what the spec should say.** Defer to the spec agent or the user. Missing details are open questions, not "sensible defaults".
- **Resilience > features.** One route that sometimes 500s beats three features that mostly work.
- **AI inside the product, not just in the build.** If the product claims to be AI-native, a real LLM call somewhere in the funnel (plan generation, live proof) is the differentiator. Gate it env-var so MVP can ship without the key.

## Review-gate checklist

At each gate, answer yes before advancing:

- [ ] Does the output match the brief's requirements (if a candidate-test brief exists)?
- [ ] Has the user been shown the actual artifact, not a summary?
- [ ] Are the "Open Questions" sections answered, not deferred?
- [ ] Is the next phase's scope unambiguous?

## Anti-patterns

- Skipping Phase 2 and going straight from research to specs.
- Writing code before specs are approved because "the user wants to see progress".
- Running frontend + backend builders with overlapping file ownership.
- Deploying without production smoke tests.
- Treating "Loom recording" as an afterthought — the narrative is scored, not just the build.
