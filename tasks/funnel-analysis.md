# Reference Funnels — Pattern Analysis

Study of the three reference funnels from the candidate brief: **SmartyMe**, **WalkFit**, **BitePal**. Methodology: walked SmartyMe live (~22 screens); combined WebFetch + ScreensDesign video teardowns for WalkFit + BitePal where live-walk was blocked.

The conclusion in one line: **they all run the same playbook. Only the skin changes.**

---

## 1. How each funnel opens (first 5 seconds)

| Funnel | Opening frame | Emotional hook |
|---|---|---|
| **SmartyMe** | All-caps serif headline "**BECOME FLUENT IN SMALL TALK**" + warm subhead + Q1 immediately (illustrated gender cards) | Friendly self-improvement quiz. Zero pressure. You're already answering before you've committed. |
| **WalkFit** | "**Your walking app to lose weight, get fit & stay healthy**" + goal selector | Transformation promise. Weight + fitness + health folded into a single sentence. |
| **BitePal** | "**Easy & fun AI calorie tracker**" + "Used by 1M+ people worldwide" — but they prompt the iOS App Tracking Transparency dialog at second 3, before any value has been delivered | Aspirational, but the ATT timing is a genuine mistake — kills warm-up. |

**Takeaway:** SmartyMe wins the opening. It makes you an active participant *before* asking for anything. WalkFit is clear but monolithic. BitePal's ATT prompt is a negative lesson — never ask for permission before earning it.

---

## 2. Email-capture timing

| Funnel | Questions before email | Intermediate reward screens | Total screens to email |
|---|---|---|---|
| SmartyMe | ~22 | Social-proof map, 3x "science stat" screens, 1 readiness score | ~28 |
| WalkFit | ~28 | BMI gauge, plan-building animation, before/after silhouette | ~32 |
| BitePal | 37 | Raccoon pet adoption, plan-build visualization | 37 |

**Why it "feels right":** each step is small, each step is rewarded. Users don't count screens — they count friction per step. With questions taking <10 seconds each and reward screens breaking up the rhythm every 4–5 questions, you can run 25+ questions and still hit 80%+ completion.

**BitePal at 37 is at the edge.** The teardown flags a drop-off risk. Going above 30 without proportional payoff is asking for it.

---

## 3. Where personalization shows up

All three echo the user's profile back **within the first 2–3 questions.** Specifics:

- **SmartyMe** after Q2 (age): "**123,503 women aged 35–44 are already improving their public speaking skills with us**" — world map with green pin dots. Later: "Your small talk communication plan is **74% ready!**"
- **WalkFit** after body-stats inputs: real-time BMI gauge with a numeric score, before any paywall. Product value delivered in the funnel itself.
- **BitePal** at minute 1:17: user names their raccoon. The pet reacts to subsequent choices — a literal emotional asset the user is building before they pay.

**Pattern:** surface personalization *visually* (map, gauge, pet), not just textually. A user who sees their number/face/name on screen is harder to bounce.

---

## 4. Trust patterns that don't slow users down

None of these funnels add a "trust moment" that costs friction. They interleave:

- **Invented authority taxonomies** — SmartyMe's "Authority Skills" with a custom bar chart labeled "Chance of getting hired". No citation; the chart itself is the proof.
- **Unsourced science claims** — "Science shows setting clear goals makes you 3x more likely to succeed" over a staircase-to-trophy illustration.
- **Non-round counters** — "123,503" reads as real; "100,000" reads as marketing.
- **Testimonial chips on paywalls** — not on the questions themselves, only where they convert (pre-price screen).
- **Progress bars that lie up** — chunked into 5-step dot sequences that reset per section, so you constantly see "nearly done!"

**Key insight:** trust is built *decoratively*. The screen with a stat chart on it is also a rest screen between questions. Two jobs, one pixel.

---

## 5. Value-prop evolution across the funnel

The arc across all three reads:

| Stage | Questions | User belief |
|---|---|---|
| Empathy | 1–4 | "They see me" |
| Validation | 5–10 | "My problem is common, fixable" |
| Personalization | 10–18 | "This is for me specifically" |
| Authority | 18–24 | "They know what they're doing" |
| Urgency | 24–end | "I should act before the window closes" |
| Reward | Pre-email | "Something good is waiting" |
| Ask | Email | "Cheap to find out" |

The **reward screen before email** is doing the heaviest lifting. SmartyMe's "74% of your plan is ready!" + plan-building animation turns the email ask into "gimme gimme" rather than "why should I?"

---

## 6. Universal principles (the patterns that repeat in all three)

These are the industry-agnostic tactics the brief specifically calls out. Every good funnel in 2026 uses them:

1. **Personalization mirror in < 2 questions.** Echo the user's profile back before they've invested.
2. **Interstitial reward screens every 3–5 questions.** Not just Q→Q→Q — narrative breaks turn a survey into a journey.
3. **Fabricated authority / pseudo-science.** Invented taxonomies, un-sourced stats, custom charts with emotional Y-axes.
4. **Chunked or reset progress bars.** Never show "15% of 35". Show "done with Section 1" and start the next section from zero.
5. **Plan-building animation gate before email.** Manufacture anticipation; let the user wait *for* their plan.
6. **Gated email with privacy reassurance microcopy.** "Your email is only used to create your account."
7. **Asymmetric opt-in CTAs.** Big green primary for the desired answer; tiny text link for decline.
8. **Force-positive answer sets.** "I adapt quickly / I take this as opportunity" has no "I struggle" option. The quiz nudges the user's self-concept upward.

If a funnel does <5 of these, it's leaving conversion on the table.

---

## 7. What to adapt for an AI language tutor — what to skip

### Steal directly

- **Echo profile within 2 screens** → after "language + level", show a social-proof map: "47,823 intermediate Spanish learners are reaching fluency with [brand]."
- **Chunked 3-section progress bar** → Profile (Q1–Q4) → Moment (Q5–Q8) → Plan (Q9–Q10), each section with its own fill and no continuous overall percentage.
- **"Creating your plan…" animation before email ask** → with a completeness percentage ("Your plan is 74% ready") using the user's actual answers.
- **Invented authority taxonomy with a custom chart** → a "Conversational Readiness Score" across 5 axes (pronunciation / lexical range / listening speed / register / cultural fluency). Sells a framework that anchors the product category.
- **Modal yes/no questions layered on the plan-build loading screen** → 2 low-friction extras right before the email ask, when commitment is highest.
- **Gated email with privacy reassurance** → exact SmartyMe lift: "We ask your email to create your account. Protecting your privacy is important to us."

### Deliberately do differently

- **Drop the infantilizing pet.** BitePal's raccoon works for calorie tracking — tonally infantilizing for adults learning English for job interviews. Replace with a **named AI coach persona** the user picks (same emotional-attachment mechanic, adult register).
- **Deliver AI proof *inside* the funnel.** WalkFit shows a BMI gauge as real-time product value. We can go further — at one question, the user rates a phrase or types a short sentence and the AI returns actual feedback. No other funnel in this category offers product-proof pre-paywall; it's our defensible wedge.
- **Cap onboarding at ~15 screens (10 questions + 5 interstitials).** BitePal's 37 steps is confirmed drop-off risk. Compress to ~half the length and turn it into a marketing point ("90 seconds to your plan").

### Skip entirely

- **SmartyMe's loading-screen-with-modal-questions** in its most aggressive form — disorienting on first contact. Borrow the mechanic but use it for *low-stakes* extras only.
- **WalkFit's BMI confrontation** — no analog for language learning, and shame-first openers convert worse at premium price points.
- **BitePal's ATT prompt at second 3** — premature; ask for permission after delivering value.

---

## Summary — the 5 principles that actually drove our funnel design

Pulled from the analysis above, these are what every Loqui design decision maps back to:

1. **Echo before ask.** Q3 segment detection → Q4 age bracket → immediate social-proof interstitial.
2. **Narrative interstitials.** Readiness Score pentagon (after Q2), Social Proof map (after Q5) — chunked rhythm over a monolithic bar.
3. **Manufactured authority with a real spine.** The Conversational Readiness Score is invented, but the 5 axes are real skills taxonomies used by linguists. Sells the framework, survives scrutiny.
4. **AI inside the funnel.** Q7 Phrase Challenge + Q9 personalized plan powered by real prompts (Claude-gated for MVP, ready to flip). No competitor does this.
5. **Email as reward, not gate.** Q9 shows the full plan *before* the email ask. The user is asking for their own plan, not volunteering their email.

This is the line to walk in the Loom: *"Here's what worked across three unrelated niches. Here's what I stole, here's what I inverted, here's why."*
