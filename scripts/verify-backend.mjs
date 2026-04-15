// Verification harness — uses the built output from `next build` (in
// `.next/server/…`) so we run the real compiled code with Next's compile
// settings (zod, paths, async handlers), without needing a listening server.
//
// Run:  node scripts/verify-backend.mjs
//
// The script loads each route's compiled POST handler, invokes it with a Web
// Request, and prints the parsed JSON response.

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// next 16 builds routes under .next/server/app/<route>/route.js with named
// `POST` export wrapped by the adapter. We use the adapter-free chunk if
// available, falling back to dynamic load.
async function loadRoute(relPath) {
  const file = path.join(ROOT, '.next/server/app', relPath, 'route.js');
  return import(pathToFileURL(file).href);
}

const makeReq = (url, body, headers = {}) =>
  new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

function show(title, obj) {
  console.log('\n=== ' + title + ' ===');
  console.log(JSON.stringify(obj, null, 2));
}

function pickPost(mod) {
  // Next wraps exports in `AppRouteRouteModule` etc. in newer versions;
  // look for a POST (hand-written export) first, then fall back to the
  // default module's `handlers.POST`.
  if (typeof mod.POST === 'function') return mod.POST;
  if (mod.default?.handlers?.POST) return mod.default.handlers.POST;
  if (mod.default?.routeModule?.userland?.POST) {
    return mod.default.routeModule.userland.POST;
  }
  return null;
}

const planMod = await loadRoute('api/plan');
const submitMod = await loadRoute('api/submit');

const planPost = pickPost(planMod);
const submitPost = pickPost(submitMod);

if (!planPost || !submitPost) {
  console.error('Could not extract POST handlers from built modules. Keys:');
  console.error('plan:', Object.keys(planMod));
  console.error('submit:', Object.keys(submitMod));
  process.exit(1);
}

// --- /api/plan samples ---
{
  const res = await planPost(
    makeReq('http://localhost/api/plan', {
      q3_segment: 'career',
      q6_time: 20,
      q5_moment: "A negotiation where I don't lose the argument",
      q2_level: 'conversational',
      q1_who_talking_to: 'colleague',
    }),
  );
  const body = await res.json();
  show('POST /api/plan — career/20', {
    status: res.status,
    source: body.source,
    plan_name: body.plan.plan_name,
    tagline: body.plan.tagline,
    focus_axes: body.plan.focus_axes.map((f) => f.axis),
    week1_sessions: body.plan.weeks[0].sessions.length,
    first_week1_session: body.plan.weeks[0].sessions[0],
    the_moment: body.plan.the_moment,
    outcome: body.plan.outcome,
  });
}

{
  const res = await planPost(
    makeReq('http://localhost/api/plan', {
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
    tagline: body.plan.tagline,
    week1_sessions: body.plan.weeks[0].sessions.length,
    first_week1_session: body.plan.weeks[0].sessions[0],
  });
}

{
  const res = await planPost(
    makeReq('http://localhost/api/plan', {
      q3_segment: 'immigration',
      q6_time: 10,
      q5_moment: 'A doctor\'s appointment or a lease signing',
      q2_level: 'getting_by',
    }),
  );
  const body = await res.json();
  show('POST /api/plan — immigration/10', {
    status: res.status,
    plan_name: body.plan.plan_name,
    week1_sessions: body.plan.weeks[0].sessions.length,
    outcome: body.plan.outcome,
  });
}

{
  const res = await planPost(
    makeReq('http://localhost/api/plan', {
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

// --- /api/submit flow ---
{
  const res = await submitPost(
    makeReq('http://localhost/api/submit', {
      email: 'test@example.com',
      answers: {
        q1_who_talking_to: 'colleague',
        q2_level: 'conversational',
        q3_segment: 'career',
        q4_prior_apps: ['duolingo', 'babbel'],
        q5_moment: "A negotiation where I don't lose the argument",
        q5_moment_id: 'negotiation',
        q6_time: 20,
        q7_challenge: {
          challenge_id: 'career_fluent_pushback',
          selected_option_id: 'opt_2',
          was_correct: true,
        },
        q8_style: 'conversations',
      },
      _hp: '',
    }),
  );
  const body = await res.json();
  show('POST /api/submit — first', { status: res.status, body });
}

{
  const res = await submitPost(
    makeReq('http://localhost/api/submit', {
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
  show('POST /api/submit — second (waitlist should be +1)', {
    status: res.status,
    body,
  });
}

// Honeypot → fake success
{
  const res = await submitPost(
    makeReq('http://localhost/api/submit', {
      email: 'bot@example.com',
      answers: { q3_segment: 'career' },
      _hp: 'I-am-a-bot',
    }),
  );
  const body = await res.json();
  show('POST /api/submit — honeypot (fake success, position 0)', {
    status: res.status,
    body,
  });
}

// Bad payload → 400
{
  const res = await submitPost(
    makeReq('http://localhost/api/submit', {
      email: 'not-an-email',
      answers: {},
    }),
  );
  const body = await res.json();
  show('POST /api/submit — invalid email', {
    status: res.status,
    body,
  });
}

// --- /api/cron/retry-submissions ---
{
  const cronMod = await loadRoute('api/cron/retry-submissions');
  const GET =
    typeof cronMod.GET === 'function'
      ? cronMod.GET
      : cronMod.default?.routeModule?.userland?.GET;
  if (!GET) {
    console.error('No GET handler on cron route');
  } else {
    // Unauthed → 401
    {
      const res = await GET(
        new Request('http://localhost/api/cron/retry-submissions'),
      );
      const body = await res.json();
      show('GET /api/cron/retry-submissions — no auth', {
        status: res.status,
        body,
      });
    }
    // With secret → processes (telegram still stubbed, retries will bump)
    process.env.CRON_SECRET = 'dev-secret';
    {
      const res = await GET(
        new Request('http://localhost/api/cron/retry-submissions', {
          headers: { Authorization: 'Bearer dev-secret' },
        }),
      );
      const body = await res.json();
      show('GET /api/cron/retry-submissions — authed', {
        status: res.status,
        body,
      });
    }
  }
}
