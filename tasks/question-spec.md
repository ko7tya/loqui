# Loqui — 10-Question Funnel Specification

**Version:** 1.0 | **Owner:** Product Strategy | **Status:** Ready for engineering review

**Voice:** Confident-premium, warmth of a well-traveled friend. Adult, composed, smart. No gamification, no exclamation marks, no "unlock your potential," no "supercharge."

---

## Design Principles

1. Every question earns its place — personalization, plan generation, or qualification.
2. The funnel is the product demo. Q7 is the wedge.
3. Segment at Q3, never re-ask. Every later screen speaks the segment's language.
4. Hick's Law: 3–6 options per question.
5. Interstitials reward progress — score filling in, social proof.

---

## Q1 — The Vision Opener

- **ID:** `Q1_WHO_TALKING_TO`
- **Headline:** When you imagine speaking fluently, who are you talking to?
- **Input:** Single-choice image cards, 4 options (2×2 mobile, 1×4 desktop).
- **Options:**
  1. A colleague in a meeting
  2. A stranger at a bar abroad
  3. My partner's family
  4. An interviewer across the table
- **Rationale:** Emotional priming before data collection. User *feels* the moment before we ask *why*. Soft segment pre-signal (colleague → career, stranger → travel, family → immigration/travel, interviewer → career/test-prep).
- **Personalization hooks:** Quoted back in Q9 plan intro ("Your plan is built around one moment: [a colleague in a meeting].").
- **Count:** 4 — distinct emotional archetypes.

---

## Q2 — Current English Level

- **ID:** `Q2_CURRENT_LEVEL`
- **Headline:** Where are you right now?
- **Sub-copy:** Be honest — the plan adapts.
- **Input:** Single-choice cards, each with an example phrase.
- **Options:**
  1. **Getting by** — I can order food and ask for directions.
  2. **Conversational** — I can hold a chat, but I lose the thread fast.
  3. **Fluent with gaps** — I work in English, but words slip away under pressure.
  4. **Near-native** — I want polish, idiom, and register.
- **Rationale:** No CEFR jargon. Example phrases anchor self-assessment, reduce over-claiming.
- **Personalization hooks:** Feeds Q7 seed difficulty, Q9 Week-1 scope, Readiness Score baseline.
- **Count:** 4.

---

### Interstitial A — Readiness Score Preview (after Q2)

- **Headline:** Your Conversational Readiness Score is forming.
- **Sub-copy:** Five axes. Keep going to fill it in.
- **Visual:** Pentagon radar chart. 1 axis lit (from Q2), 4 blurred with a lock shimmer.
- **Axes:** Pronunciation, Lexical Range, Listening Speed, Register, Cultural Fluency.
- **Copy below chart:** *Each question sharpens one more axis. You're 1 of 5.*
- **Rationale:** Proprietary-feeling framework positions Loqui above flashcard apps. Blur is a Zeigarnik hook — unfinished progress pulls the user forward.

---

## Q3 — The Segment Detector

- **ID:** `Q3_WHY_LEARNING`
- **Headline:** Why are you learning English?
- **Sub-copy:** Your plan shifts based on this one.
- **Input:** Single-choice cards.
- **Options:**
  1. **For work** — I need English for my job, career moves, or doing business.
  2. **For a test** — IELTS, TOEFL, Cambridge, or Duolingo English Test.
  3. **For a move** — I'm relocating, already abroad, or planning a visa.
  4. **For life** — Travel, my partner's family, friends, social confidence.
- **Rationale:** The master question. Warm human labels over category names ("For a move" not "Immigration") avoid reducing the user to a profile. Order by TAM: career, test, move, life.
- **Personalization hooks:** Drives Q5 options, Q7 seed, Q8 sub-copy, Q9 plan focus + naming, success copy, Amplitude `segment`.
- **Count:** 4 — matches the 4 canonical segments; "other" dilutes signal.

---

## Q4 — Prior App Usage

- **ID:** `Q4_PRIOR_APPS`
- **Headline:** Have you tried English apps before?
- **Sub-copy:** No judgment — most of us have.
- **Input:** Multi-choice pills.
- **Options:** Duolingo / Babbel / Busuu / A tutor on italki or Preply / None of these.
- **Rationale:** Flattery that validates effort, and qualification — users who've tried 2+ apps and are still here are higher-intent.
- **Personalization hooks:** Duolingo/Babbel → Q9 reframe ("You've done the vocabulary grind. This is different."). None → softer framing ("You picked the right time to start.").
- **Count:** 5 — 4 apps + escape hatch.

---

## Q5 — The Specific Moment (SEGMENT-AWARE)

- **ID:** `Q5_SPECIFIC_MOMENT`
- **Headline:** What's the moment you want to nail?
- **Sub-copy:** The plan trains for *this*.
- **Input:** Single-choice cards, 4 per variant.

**If Career:**
1. A stand-up where I can think on my feet
2. A negotiation where I don't lose the argument
3. A presentation where I sound like the expert I am
4. A performance review where I advocate for myself

**If Test-prep:**
1. The speaking section of IELTS / TOEFL
2. The writing section — clean, precise, on-brief
3. Listening to native speakers at full speed
4. The whole thing — I want the band score

**If Immigration:**
1. A visa or immigration interview
2. Small talk with neighbors, colleagues, the school pickup
3. A doctor's appointment or a lease signing
4. Just sounding like I belong

**If Travel/Social:**
1. Dinner with my partner's family
2. A conversation that goes past "where are you from?"
3. A story I tell well at a party
4. Travel — hotels, trains, a problem at the airport

- **Rationale:** Sharpest personalization. Same slot, four different menus. Specificity ("a stand-up where I can think on my feet") outperforms generic options — the plan literally mirrors this moment in Week 1.
- **Personalization hooks:** Becomes the named scenario in Q9, referenced in success screen and first email.

---

### Interstitial B — Social Proof Map (after Q5)

- **Headline (segment-aware):**
  - Career: *47,823 professionals are building English fluency with Loqui.*
  - Test-prep: *12,408 test-takers are prepping with Loqui this month.*
  - Immigration: *31,576 newcomers are finding their voice in English.*
  - Travel/Social: *63,219 travelers are learning to sound natural, not textbook.*
- **Sub-copy:** You're in good company.
- **Visual:** World map, pulsing dots on Berlin, São Paulo, Jakarta, Mumbai, Kyiv, Mexico City, Istanbul, Bogotá. Dots near user's geo brighter.
- **Rationale:** Odd, non-round numbers feel real. Sub-100k stays believable. Map de-emphasizes the English-speaking world — non-natives see their own cities.

---

## Q6 — Time Commitment

- **ID:** `Q6_TIME_COMMITMENT`
- **Headline:** How much time can you actually give this?
- **Sub-copy:** Be realistic. The plan only works if you show up.
- **Input:** Single-choice cards.
- **Options:**
  1. **10 min / day** — Small, consistent, background-level.
  2. **20 min / day** — A real habit. Most people pick this.
  3. **45 min / day** — Accelerated. You want this finished.
- **Rationale:** Three is right for time. Middle has a soft social-proof nudge without being manipulative.
- **Personalization hooks:** Plan volume (3/5/7 sessions/week), session length, Week-1 ramp.
- **Count:** 3 — deliberately coarse.

---

## Q7 — The Live AI Proof (THE WEDGE)

- **ID:** `Q7_LIVE_AI_PROOF`
- **Headline:** Say one thing in English. We'll coach it in two seconds.
- **Sub-copy:** This is what every session feels like.

### Mode Decision — **Mode A (Type a phrase) — RECOMMENDED**

**Why not Mode B:** Mode A makes the user *produce*, not *judge*. Production is the activity the product teaches — demo matches the job. Mode B reduces the user to a critic, a stance they didn't come for. Mode A generates richer Claude responses, and the typed phrase becomes a personalization asset referenced in Q9.

### UI Flow

1. **Prompt card** — segment + level-aware seed describing *what they want to say*:
   - Career / Fluent-with-gaps: *Push back on a deadline your manager just set — politely but firmly.*
   - Travel / Conversational: *You're at a café in London. You want a flat white, oat milk, window seat.*
   - Test-prep / Getting-by: *Describe a skill you'd like to learn. (IELTS Speaking Part 2 style.)*
   - Immigration / Conversational: *Your neighbor asks how you're settling in. Answer so the conversation opens up.*
2. **Text input**, 180-char soft cap. Submit: *Coach this.*
3. **Loading:** 1.2s, microcopy *Loqui is listening…*
4. **Response card** — What worked / Sharper version / One small habit.
5. **CTA:** *Continue — we're almost at your plan.*

### Claude Prompt for Q7

```
SYSTEM:
You are Loqui — a premium AI English tutor. The user is a non-native English
speaker who has just typed their attempt at a real-world phrase. Respond in
exactly three short sections, tuned for warmth and precision.

Voice: confident-premium, warm, adult. Like a well-traveled friend who happens
to be fluent. Never gamified. Never clinical. No exclamation marks. No emoji.

Output JSON only:
{
  "what_worked": "One specific thing they got right. One sentence. Quote their phrase if possible.",
  "sharper_version": "A native-speaker rephrase of their attempt. One sentence, in quotation marks.",
  "one_habit": "A single, plan-shaping takeaway. One sentence, under 15 words."
}

Constraints:
- If the user's phrase is off-topic or empty, respond with encouragement in the same JSON shape.
- Never mention they're a learner. Never use the word "beginner."
- If their phrase is already native-quality, celebrate it and give the habit anyway.

USER:
Context seed: {{seed_phrase}}
Their level: {{level_label}}
Their segment: {{segment}}
What they wrote: "{{user_phrase}}"
```

**Fallback:** If Claude times out > 3s, serve a pre-generated stub per seed × level. User never sees a spinner death.

---

## Q8 — Learning Style

- **ID:** `Q8_LEARNING_STYLE`
- **Headline:** One more.
- **Sub-copy (segment-aware):**
  - Career: *How do you learn best under work pressure?*
  - Test-prep: *How should we drill this?*
  - Immigration: *What's going to fit into a messy week?*
  - Travel/Social: *What keeps it fun enough to stick with?*
- **Input:** Single-choice cards.
- **Options:**
  1. **Short, sharp drills** — 5-minute focus bursts.
  2. **Real conversations** — I want to speak, not study.
  3. **Stories and scenarios** — I learn by being somewhere.
  4. **Structured lessons** — Give me a syllabus.
- **Rationale:** Tunes pedagogy, not content. Segment-aware sub-copy makes a universal question feel bespoke. Four options map to four content modules.
- **Personalization hooks:** Primary module type in Q9, first-email tone.
- **Count:** 4.

---

### Interstitial C — Plan Generation Loading (before Q9)

- **Duration:** ~2.5s, three copy stages.
- **Visual:** Radar chart from Interstitial A, all 5 axes now lit. Subtle progress bar.
- **Copy stages (~800ms each):**
  1. *Reading your answers…*
  2. *Sharpening for [your stand-up / IELTS Speaking / the school pickup / your partner's family]…*
  3. *Writing your plan…*
- **Rationale:** Even if Claude returns < 2.5s, hold the interstitial — perceived effort anchors plan value.

---

## Q9 — The Plan Reveal

- **ID:** `Q9_PLAN_REVEAL`
- **Headline:** Your plan.
- **Sub-copy (segment-aware):**
  - Career: *Four weeks to the moment you described.*
  - Test-prep: *Built backwards from your test date.*
  - Immigration: *Four weeks. One better week at a time.*
  - Travel/Social: *Four weeks. By the end, you'll sound like you.*
- **Input:** Read-only plan card, sticky CTA: *Lock in my plan.*
- **Card structure:** Plan name → Moment (quoted Q5) → Focus axes (2 of 5) → 4-week outline → Week 1 detail → Outcome referencing Q5.
- **Rationale:** Named plans ("The Stand-Up Plan") convert dramatically better than "Your English Plan."

### Claude Prompt for Q9 (Plan Generation)

**System:**

```
You are Loqui — a premium AI English tutor writing a personalized 4-week plan.

Voice: confident-premium with warmth. Adult. Like a well-traveled friend who's
already fluent. Never gamified. Never clinical. No exclamation marks. No emoji.
No "unlock your potential," "supercharge," "journey," "master." Short sentences.

Output valid JSON only, matching schema exactly.

Plan rules:
- Name the plan around the user's Q5 moment ("The Stand-Up Plan," "The Band 7.5
  Plan," "The First-Six-Weeks Plan," "The Partner's Family Plan").
- Pick exactly 2 focus axes from the 5 readiness axes based on segment + level.
- 4 weeks, each with a distinct theme that compounds on the prior week.
- Week 1 has 3 specific, named activities (drills, dialogues, scenarios, or
  lessons — picked based on learning style).
- Closing outcome sentence must reference the user's Q5 moment verbatim.
```

**User:**

```
- Segment: {{segment}}
- Level: {{level_label}}
- Moment: "{{q5_moment}}"
- Time: {{time_per_day}} min/day
- Learning style: {{learning_style}}
- Prior apps: {{prior_apps}}
- Q7 attempt: "{{user_phrase}}"
- Q1 vision: "{{q1_who}}"

Generate the plan as JSON.
```

**Expected JSON:**

```json
{
  "plan_name": "string",
  "tagline": "string (under 12 words)",
  "the_moment": "For: {{q5_moment}}",
  "focus_axes": [
    { "axis": "pronunciation|lexical_range|listening_speed|register|cultural_fluency",
      "why_for_you": "string (under 20 words)" }
  ],
  "weeks": [
    { "week": 1, "title": "string", "theme": "string",
      "sessions": [{ "name": "string", "duration_min": 20, "type": "drill|dialogue|scenario|lesson" }] },
    { "week": 2, "title": "string", "theme": "string", "sessions": [] },
    { "week": 3, "title": "string", "theme": "string", "sessions": [] },
    { "week": 4, "title": "string", "theme": "string", "sessions": [] }
  ],
  "outcome": "string (references Q5 verbatim)"
}
```

---

## Q10 — Email Capture

- **ID:** `Q10_EMAIL`
- **Headline:** Where should we send it?
- **Sub-copy (segment-aware):**
  - Career: *Your plan, plus Monday's first session.*
  - Test-prep: *Your plan, plus this week's drills.*
  - Immigration: *Your plan, plus tomorrow's first step.*
  - Travel/Social: *Your plan, plus your first scenario.*
- **Input:** Single email field, inline validation. Submit: *Send me my plan.*
- **Fine print:** *No spam. Unsubscribe in one click.*
- **Rationale:** Sub-copy promises a *next artifact*, not the plan the user already saw.

---

## Branching Logic — The Segment Matrix

| Segment | Q5 menu | Q7 seed style | Q8 sub-copy | Q9 plan name | Q9 focus axes (default) |
|---|---|---|---|---|---|
| **Career** | Meetings, negotiations, presentations, reviews | Workplace-register, political | *Learn best under work pressure* | "The [Moment] Plan" | Register + Lexical Range |
| **Test-prep** | IELTS/TOEFL sections, band goal | Exam-prompt style | *How should we drill this* | "The [Band X.X] Plan" | Listening Speed + Register |
| **Immigration** | Visa interview, small talk, appointments, belonging | Daily-life, bureaucratic | *Fit into a messy week* | "The First-[N]-Weeks Plan" | Cultural Fluency + Lexical Range |
| **Travel/Social** | Family dinner, stories, parties, travel friction | Social, warm, narrative | *Keeps it fun enough to stick with* | "The [Moment] Plan" | Cultural Fluency + Pronunciation |

---

## State Model (TypeScript)

```ts
export type Segment = 'career' | 'test_prep' | 'immigration' | 'travel_social';
export type Level = 'getting_by' | 'conversational' | 'fluent_with_gaps' | 'near_native';
export type TimeCommitment = 10 | 20 | 45;
export type LearningStyle = 'drills' | 'conversations' | 'stories' | 'structured';
export type PriorApp = 'duolingo' | 'babbel' | 'busuu' | 'italki_preply' | 'none';
export type ReadinessAxis =
  | 'pronunciation' | 'lexical_range' | 'listening_speed' | 'register' | 'cultural_fluency';
export type WhoTalkingTo = 'colleague' | 'stranger_abroad' | 'partner_family' | 'interviewer';
export type SessionType = 'drill' | 'dialogue' | 'scenario' | 'lesson';

export interface FunnelState {
  q1_who_talking_to?: WhoTalkingTo;
  q2_level?: Level;
  q3_segment?: Segment;
  q4_prior_apps?: PriorApp[];
  q5_moment?: string;
  q5_moment_id?: string;
  q6_time?: TimeCommitment;
  q7_seed_phrase?: string;
  q7_user_phrase?: string;
  q7_ai_feedback?: Q7AIResponse;
  q8_style?: LearningStyle;
  q10_email?: string;
  segment?: Segment;
  generated_plan?: GeneratedPlan;
  plan_source: 'claude' | 'fallback';
  waitlist_position?: number;
  session_id: string;
  started_at: string;
  completed_at?: string;
}

export interface Q7AIResponse {
  what_worked: string;
  sharper_version: string;
  one_habit: string;
}

export interface FocusAxis {
  axis: ReadinessAxis;
  why_for_you: string;
}

export interface PlanSession {
  name: string;
  duration_min: number;
  type: SessionType;
}

export interface PlanWeek {
  week: 1 | 2 | 3 | 4;
  title: string;
  theme: string;
  sessions: PlanSession[];
}

export interface GeneratedPlan {
  plan_name: string;
  tagline: string;
  the_moment: string;
  focus_axes: FocusAxis[];   // exactly 2
  weeks: PlanWeek[];         // exactly 4
  outcome: string;
}

export interface ClaudePlanRequest {
  segment: Segment;
  level_label: string;
  q5_moment: string;
  time_per_day: TimeCommitment;
  learning_style: LearningStyle;
  prior_apps: PriorApp[];
  user_phrase: string;
  q1_who: WhoTalkingTo;
}

export interface ClaudePlanResponse {
  plan: GeneratedPlan;
  model: string;
  latency_ms: number;
}
```

---

## Fallback Plan Template

Deterministic generator: 4 segments × 3 time bands = 12 templates in `/lib/fallback-plans.ts`. Each has slots for `{{q5_moment}}`, `{{level_label}}`, `{{q1_who}}`.

### Worked Example — Career × 20 min/day

```ts
export const FALLBACK_CAREER_20: GeneratedPlan = {
  plan_name: "The {{q5_moment_short}} Plan",
  tagline: "Four weeks to the moment you described.",
  the_moment: "For: {{q5_moment}}",
  focus_axes: [
    { axis: 'register',
      why_for_you: "At {{level_label}}, the grammar's there. What's missing is tone — and that's what stops promotions." },
    { axis: 'lexical_range',
      why_for_you: "You know the words. We're building the second-choice word — the one that makes you sound precise." }
  ],
  weeks: [
    { week: 1, title: "Clean baseline",
      theme: "Five workplace scripts, spoken until they're automatic.",
      sessions: [
        { name: "The stand-up opener", duration_min: 20, type: 'drill' },
        { name: "Disagreeing without softening too much", duration_min: 20, type: 'dialogue' },
        { name: "Asking for what you need — three registers", duration_min: 20, type: 'drill' }
      ] },
    { week: 2, title: "Thinking on your feet",
      theme: "Stalling phrases, reframes, buying time without sounding lost.", sessions: [] },
    { week: 3, title: "The hard conversation",
      theme: "Pushback, constructive disagreement, the difficult ask.", sessions: [] },
    { week: 4, title: "Your moment",
      theme: "Full rehearsal of {{q5_moment}}, recorded and coached.", sessions: [] }
  ],
  outcome: "By the end of Week 4, you'll walk into {{q5_moment}} knowing exactly how you sound."
};
```

Other 11 variants follow this shape. Time band adjusts session count: 10 min = 2/week, 20 min = 3, 45 min = 5.

---

## Success Screen Copy

Structure: thank-you → plan mini-summary → waitlist position → share prompt.
Position = `base + total_submits_today`. Base: Career 8,412 / Test 3,207 / Immigration 5,891 / Travel 11,346.

**Career:**
> **You're in.**
> Your plan's in your inbox. First session lands Monday at 7am local time.
> *You're #{{position}} on the list — we're rolling out by segment so feedback stays sharp.*
> **Share Loqui with someone stuck in the same meeting you are →**

**Test-prep:**
> **You're in.**
> Your plan's in your inbox. Your first drill is waiting.
> *You're #{{position}} on the list. Test-prep access opens in cohorts — yours is soon.*
> **Know someone prepping for the same test? Send this their way →**

**Immigration:**
> **You're in.**
> Your plan's in your inbox. Tomorrow's first step is a five-minute scenario.
> *You're #{{position}} on the list — we prioritize newcomers with nearest deadlines.*
> **If you know someone else in the middle of a move, this might help them too →**

**Travel/Social:**
> **You're in.**
> Your plan's in your inbox. Your first scenario is a dinner — and you'll feel different by the end of it.
> *You're #{{position}} on the list. We're opening access in waves.*
> **Share with the friend who's always asking you to translate →**

---

## Amplitude Events

| Event | When | Properties |
|---|---|---|
| `funnel_started` | Q1 viewed | `session_id`, `referrer`, `utm_source` |
| `question_viewed` | Question renders | `question_id`, `segment`, `time_since_start_ms` |
| `question_answered` | Submit | `question_id`, `answer`, `answer_id`, `segment`, `time_on_question_ms` |
| `segment_detected` | Q3 submit | `segment`, `q1_who`, `q2_level` |
| `interstitial_viewed` | Interstitial renders | `interstitial_id`, `segment` |
| `q7_seed_shown` | Seed displayed | `seed_id`, `segment`, `level` |
| `q7_phrase_submitted` | Submit | `user_phrase_length`, `time_to_submit_ms` |
| `q7_ai_responded` | Claude returns | `latency_ms`, `fallback_used` |
| `plan_generation_started` | Before Q9 | `segment` |
| `plan_generated` | Plan rendered | `segment`, `plan_source`, `latency_ms`, `plan_name` |
| `plan_viewed` | Q9 > 1s | `segment`, `plan_name` |
| `email_submitted` | Q10 success | `segment`, `time_total_ms`, `completion_path_length` |
| `funnel_completed` | Success renders | `segment`, `waitlist_position`, `time_total_ms` |
| `funnel_abandoned` | Unload pre-Q10 | `last_question_id`, `segment`, `time_total_ms` |
| `share_clicked` | Share prompt | `segment` |

Drop-off per question = `question_viewed` minus `question_answered` grouped by `question_id`.

---

## Option Counts (Hick's Law Audit)

| Q | Count | Why |
|---|---|---|
| Q1 | 4 | 4 emotional archetypes. |
| Q2 | 4 | Rungs with anchor examples. More = mid-point bias. |
| Q3 | 4 | Matches 4 canonical segments. No "other." |
| Q4 | 5 | 4 apps + "None" escape. |
| Q5 | 4 × 4 | Parallel structure per segment. |
| Q6 | 3 | Coarse by design; "15 vs 20 min" is false precision. |
| Q7 | 1 input | Free text. |
| Q8 | 4 | 4 pedagogical archetypes = 4 modules. |
| Q9 | 0 | Read-only reveal. |
| Q10 | 1 input | Email. |

---

## Open Questions for Review

1. **Q1 → Q3 ordering.** Use Q1's answer to reorder Q3's options (likely match on top), or leave Q3 ordered by TAM?
2. **Q4 placement.** Q4 at current slot (qualification early) or after Q7 as a reframe ("you've tried X — here's why this is different")?
3. **Q7 seed library.** 12 seeds (3 levels × 4 segments) pre-generated, or Claude-generated at runtime? Runtime = more personalized, pre-generated = cache-friendly.
4. **Waitlist realism.** Copy says "opening access in waves." If the backend doesn't actually stage, credibility risk. Recommend: real staging, even if weekly.
5. **Q8 timing.** Move Q8 before Q7 so seeds tune to style? Trade-off: Q7 is the peak — shouldn't be pushed back.
6. **Plan persistence.** Regenerate on revisit or snapshot at submit? Recommend: snapshot to KV.
7. **Q1 image cards on mobile.** 2×2 assumes 4 distinct illustrations exist in the brand system. Confirm with design or fall back to labeled cards for MVP.
8. **Q7 fallback fidelity.** Stubs won't reference the user's actual phrase. Acceptable degradation, or harder retry-with-backoff before falling back?
9. **Telegram notify payload.** Recommend minimal (email, segment, plan_name, waitlist_position). Confirm scope.
10. **Q7 free-text analytics.** PII-adjacent. Recommend: hash + bucket by length/language in Amplitude; raw text in Vercel KV, session-scoped only.

---

## v2 — Coach + Age + UTM + Accessibility

**Version:** 2.0 | **Owner:** Product Strategy | **Status:** Shipped (pending stakeholder review)

The v1 spec above remains the source of truth for Q1-Q3, Q5-Q7, Q9-Q10. This section documents the four v2 decisions and the accessibility layer.

### Decision A1 — Swap Q4 and Q8

**Q4 (was: prior app usage) is now age bracket.** Six options: Under 18, 18–24, 25–34, 35–44, 45–54, 55+. Single-choice, 2-column grid on `sm+`. Writes `q4_age: AgeBracket` to state.

**Q8 (was: learning style) is now coach selection.** Four coaches — Marcus (American, drills), Elena (British, conversations), Aiko (Australian, stories), David (Canadian, structured). 2×2 grid on `sm+`, stacked on xs. The picker writes both `q8_coach: CoachId` (new) and `q8_style: LearningStyle` (legacy, still keyed by the plan-template matrix) in lockstep. The old prior-app field is retained on `FunnelState` for back-compat with stale saved sessions but never written by live code.

Funnel stays at 10 questions.

### Decision B1 — Language accessibility

- Dual copy: every top-of-funnel question has a `_SIMPLE_*` variant (shorter sentences, common verbs only). Swapping is helper-driven via `pickCopy(level, standard, simple)` — the variant renders when Q2 level is `getting_by`.
- Native-language help tooltip: a "?" icon next to the theme toggle opens a short popover in the user's language. Supported: Spanish, Portuguese, French, Russian, Chinese (simplified), Korean, Arabic (RTL), Japanese. Fallback: English.
- Locale detection order: UTM `lang_hint` → stored `ui_locale_hint` → `navigator.language` → English.

### Decision C1 — UTM preseeds

On landing, `readUtmFromLocation()` parses `window.location.search` and returns a clean `UtmContext`. Validated hints:

- `age` → `AgeBracket` (must match canonical value)
- `segment` → `Segment` (must match canonical value)
- `lang` → ISO 639-1 two-letter lowercase
- `utm_source`, `utm_campaign`, `utm_medium`, `utm_content`, `persona` → free-form (64-char cap)

`hydrateFromUtm()` preseeds `q3_segment` / `q4_age` / `ui_locale_hint` when the corresponding hint is present AND the user hasn't already answered. The user still sees every question — the answer is just pre-filled. UTM context is tracked on `funnel_started`.

### Decision D1 — Coach intro on plan reveal

Q9 now opens with a coach-introduction block: "Meet {name}." + accent chip + segment-specific italic quote from `COACHES[coachId].quotes[segment]`. The quote stagger-animates in first, then the plan name, focus axes, weeks, outcome. When `q8_coach` is missing we fall back to the coach whose `style` matches `q8_style`; if neither resolves we skip the block and show a neutral single-line intro.

The SuccessScreen adds a single line below the segment body: "**{coach.name}** is ready. Check your inbox."

### State additions

```ts
export type AgeBracket =
  | 'under_18' | '18_24' | '25_34' | '35_44' | '45_54' | '55_plus';

export type CoachId = 'marcus' | 'elena' | 'aiko' | 'david';

export interface Coach {
  id: CoachId;
  name: string;
  accent: string;        // "American", "British", "Australian", "Canadian"
  tagline: string;       // 4-6 word pitch on the selection card
  vibe: string;          // One-liner personality fingerprint
  style: LearningStyle;  // Maps to the plan-template matrix
  quotes: Record<Segment, string>;
}

export interface UtmContext {
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  utm_content?: string;
  age_hint?: AgeBracket;
  segment_hint?: Segment;
  lang_hint?: string;    // ISO 639-1
  persona?: string;
}

// FunnelState additions:
//   q4_age?: AgeBracket
//   q8_coach?: CoachId
//   utm?: UtmContext
//   ui_locale_hint?: string
// q4_prior_apps still typed on state for back-compat (not written by v2).
```

### Plan schema addition

```ts
export interface PlanCoachBlock {
  id: CoachId;
  name: string;
  accent: string;
  quote: string; // segment-specific
}

// GeneratedPlan gains optional `coach?: PlanCoachBlock`.
```

The `/api/plan` route now attaches the coach block to its response via `generateDeterministicPlan`, so clients never need to re-derive coach context from answers.

### New analytics events

| Event | When | Properties |
|---|---|---|
| `age_selected` | Q4 submit | `age` |
| `coach_selected` | Q8 submit | `coach`, `segment` |

`funnel_started` now carries `utm_source`, `utm_campaign`, `utm_medium`, `utm_content`, `age_hint`, `segment_hint`, `lang_hint`, `persona`, `ui_locale`.

### Telegram message shape

- Q4 label: `*Q4 — How old are you? (age bracket)*` → bracket label (e.g. `25–34`).
- Q8 label: `*Q8 — Pick your coach.*` → `Marcus — American, drills`.
- Legacy `q4_prior_apps`, if present on a stale session, emitted as a compact debug footer below the main Q&A block.

