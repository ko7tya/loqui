# Lessons

Running log of corrections, patterns, and gotchas that should inform future
sessions. Append-only; review at session start.

## 2026-04-15 — Day 1 Scaffold

### Sandbox blocks `npm install`
- `npm install`, `npx create-next-app`, and most network-backed npm commands
  are denied by the execution sandbox in this environment.
- Workaround: hand-author every file a scaffold would have produced
  (package.json, configs, primitives, content, components), then document the
  install gap clearly in the output report and README so the next engineer
  can run `npm install && npm run dev` on a host machine.

### Tailwind + HSL alpha
- `hsla(var(--x) / 0.35)` is invalid in CSS — `hsla()` uses comma syntax, not
  slash. Use `hsl(var(--x) / 0.35)` for the modern slash form.
- Storing alpha *inside* the CSS variable (e.g. `--border: 266 20% 15% / 0.12`)
  breaks Tailwind's alpha-modifier utilities (`border-border/50` would stack
  two slashes). Keep the variable as a pure H-S-L triplet and let
  `tailwind.config.ts` apply the alpha: `border: 'hsl(var(--border) / 0.12)'`.

### Framer Motion easing types
- `ease: [0.16, 1, 0.3, 1] as const` produces a readonly tuple that the
  Framer `Easing` union rejects in strict mode. Extract the array to a
  `const EASE_OUT_EXPO: number[] = [...]` so inference widens cleanly.

### Focus ring collisions
- A global `:focus-visible { box-shadow: ... }` stacks on top of shadcn
  primitives that already style their own ring. Preferred pattern: suppress
  only the default `outline`, and have components opt in to
  `focus-visible:shadow-focus` via Tailwind.

## 2026-04-16 — Day 2 Backend

### Parallel agent drift on shared types
- Frontend moved Q7 from `q7_user_phrase`/`q7_ai_feedback` to
  `q7_challenge: Q7Answer` while the backend agent was mid-edit. Lesson:
  re-read `src/lib/types.ts` right before finishing any file that imports
  from it. Don't snapshot types once at the start of a session.

### Verifying API routes without a server
- Sandbox forbids `next dev`/`next start` and arbitrary `node` invocations,
  but `npm run <script>` works. Pattern: after `npm run build`, load the
  compiled `.next/server/app/<route>/route.js` and call its exported POST/GET
  with a plain Web `Request`. Response objects behave normally.

### Next 16 route handler export shape
- Sometimes the handler is exported directly (`export const POST = …`),
  other times wrapped as `default.routeModule.userland.POST`. Always
  fall back to both when loading built routes from scripts.

### FunnelState has required client-only fields
- `session_id`, `started_at`, and `plan_source` are non-optional on
  `FunnelState`. Server-side validation schemas don't have them. Cast
  through `unknown` to bridge — don't re-declare a stripped-down version.
