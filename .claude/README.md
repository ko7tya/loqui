# `.claude/` — Agent & Skill Library

Reusable Claude Code agent and skill definitions that powered the Loqui build. Drop them into any Claude Code project (`.claude/agents/` + `.claude/skills/`) and they're immediately available via the `Agent` and `Skill` tools.

## What's in here

### Agents (`agents/`)

Six specialists that model a real cross-functional team. Each has a narrow, well-defined output and explicit anti-patterns.

| Agent | Role | Output |
|---|---|---|
| `market-researcher` | Competitive landscape analyst | Strategic brief under 1100 words + 3 concrete recommendations |
| `funnel-pattern-analyst` | Studies reference funnels, extracts patterns | Pattern library + tactics to steal + things to skip |
| `brand-strategist` | Proposes name, tone, color, typography | Brand direction doc with 6 name candidates + final pick |
| `product-strategist` | Designs full question spec | `tasks/question-spec.md` — state model, branching, prompts, analytics |
| `visual-design-lead` | Produces design system | `tasks/design-system.md` — tokens, logo, mockups, components, a11y |
| `scaffold-engineer` | Next.js + shadcn bootstrap | Running project with build passing, design tokens wired |
| `frontend-builder` | Builds the funnel UI | All screens + interstitials + state + transitions + a11y |
| `backend-builder` | Builds resilient APIs | Outbox pattern + rate limit + honeypot + LLM fallback + cron |

### Skill (`skills/`)

One workflow skill that orchestrates the agents end-to-end.

| Skill | Purpose |
|---|---|
| `ai-funnel-orchestrator` | Six-phase pipeline: research → strategy → specs → scaffold → build → deploy, with review gates |

## How to use them

**In Claude Code:**

Invoke an agent directly via the `Agent` tool with `subagent_type` set to the agent's name:

```
Agent(subagent_type="brand-strategist", prompt="...")
```

Or invoke the orchestrator skill:

```
Skill(skill="ai-funnel-orchestrator")
```

**In Cursor, Cline, or any LLM chat:**

These are just markdown files. Paste the contents into your system prompt or user message to instantiate that role. The frontmatter is metadata; the body is the prompt.

## Why the split

Research before strategy, strategy before spec, spec before code. Each gate catches the errors that compound downstream — a bad spec multiplies into thousands of wasted lines, a bad brand name shows up on every screen. The agents are separated along these gate boundaries, not along technical boundaries.

Parallelizable phases are explicitly flagged in the orchestrator skill (research trio in parallel, frontend + backend builders in parallel). Sequential phases are sequential because the next one literally reads the previous one's output.

## Customizing

Each agent file has two things worth editing:

1. **The stack defaults** in `scaffold-engineer` and the builder agents. If you're not on Next.js 15 + shadcn, swap them out. The architectural commitments (outbox pattern, pluggable analytics, env-var-gated AI) are stack-agnostic.
2. **The voice rules** in `brand-strategist` and `product-strategist`. The "no exclamation marks, no emoji spam" is opinionated; keep it or soften it for your brand.

Don't edit the anti-pattern sections lightly — those are failure modes from real builds.

## Provenance

Distilled from the build of [Loqui](https://github.com/ko7tya/loqui), an AI English tutor marketing funnel built as a candidate test task over ~3 days. The agents represent the actual sub-agent prompts used; the orchestrator reflects the actual phase gates that kept the build on track.

License: MIT (same as the parent repo).
