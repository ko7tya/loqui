// Verification harness — exercises /api/plan and /api/submit handlers directly
// without needing a listening dev server. Uses the Web `Request`/`Response`
// shapes Next route handlers expect.
//
// Run: node --experimental-strip-types scripts/verify-api.mjs

import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { register } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));

// We need tsx so TS + path-aliased imports resolve in a plain node run.
const { pathToFileURL: p2f } = await import('node:url');

async function loadTs(rel) {
  // tsx registers a loader hook for TS + tsconfig paths
  return import(p2f(resolve(__dirname, '..', rel)).href);
}

console.log('Loading plan route…');
const planModule = await loadTs('src/app/api/plan/route.ts');
const submitModule = await loadTs('src/app/api/submit/route.ts');

const { POST: planPost } = planModule;
const { POST: submitPost } = submitModule;

const post = (url, body, headers = {}) =>
  new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

function show(title, obj) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(obj, null, 2));
}

// --- /api/plan ---
{
  const res = await planPost(
    post('http://localhost/api/plan', {
      q3_segment: 'career',
      q6_time: 20,
      q5_moment: "A negotiation where I don't lose the argument",
      q2_level: 'conversational',
      q1_who_talking_to: 'colleague',
      // v2: age + coach ride along.
      q4_age: '35_44',
      q8_coach: 'marcus',
      q8_style: 'drills',
    }),
  );
  const body = await res.json();
  show('POST /api/plan — career/20 (v2)', {
    status: res.status,
    source: body.source,
    plan_name: body.plan.plan_name,
    focus_axes: body.plan.focus_axes.map((f) => f.axis),
    week1_sessions: body.plan.weeks[0].sessions.length,
    the_moment: body.plan.the_moment,
    outcome: body.plan.outcome,
    coach: body.plan.coach,
  });
}

{
  const res = await planPost(
    post('http://localhost/api/plan', {
      q3_segment: 'test_prep',
      q6_time: 45,
      q5_moment: 'The whole thing — I want the band score',
      q2_level: 'fluent_with_gaps',
    }),
  );
  const body = await res.json();
  show('POST /api/plan — test_prep/45', {
    status: res.status,
    plan_name: body.plan.plan_name,
    week1_sessions: body.plan.weeks[0].sessions.length,
    first_session: body.plan.weeks[0].sessions[0],
  });
}

{
  const res = await planPost(
    post('http://localhost/api/plan', {
      q3_segment: 'travel_social',
      q6_time: 10,
      q5_moment: "Dinner with my partner's family",
      q2_level: 'conversational',
    }),
  );
  const body = await res.json();
  show('POST /api/plan — travel_social/10', {
    status: res.status,
    plan_name: body.plan.plan_name,
    week1_sessions: body.plan.weeks[0].sessions.length,
    outcome: body.plan.outcome,
  });
}

// --- /api/submit ---
{
  const res = await submitPost(
    post('http://localhost/api/submit', {
      email: 'test@example.com',
      answers: {
        q1_who_talking_to: 'colleague',
        q2_level: 'conversational',
        q3_segment: 'career',
        // v2: age replaces prior-apps.
        q4_age: '35_44',
        q5_moment: 'A negotiation where I don\'t lose the argument',
        q5_moment_id: 'negotiation',
        q6_time: 20,
        q7_challenge: {
          challenge_id: 'career_fluent_pushback',
          selected_option_id: 'opt_2',
          was_correct: true,
        },
        // v2: coach + its style in lockstep.
        q8_coach: 'helen',
        q8_style: 'conversations',
      },
      _hp: '',
    }),
  );
  const body = await res.json();
  show('POST /api/submit — first (v2)', { status: res.status, body });
}

{
  const res = await submitPost(
    post('http://localhost/api/submit', {
      email: 'second@example.com',
      answers: {
        q3_segment: 'travel_social',
        q6_time: 20,
        q5_moment: 'A story I tell well at a party',
        q2_level: 'conversational',
      },
      _hp: '',
    }),
  );
  const body = await res.json();
  show('POST /api/submit — second (waitlist should +1)', {
    status: res.status,
    body,
  });
}

// Honeypot check
{
  const res = await submitPost(
    post('http://localhost/api/submit', {
      email: 'bot@example.com',
      answers: { q3_segment: 'career' },
      _hp: 'I-am-a-bot',
    }),
  );
  const body = await res.json();
  show('POST /api/submit — honeypot (should fake success)', {
    status: res.status,
    body,
  });
}
