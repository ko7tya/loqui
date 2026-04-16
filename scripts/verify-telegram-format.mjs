// Dump the formatted Telegram message for one realistic submission so we can
// eyeball the markdown. Uses the compiled output from `next build`.

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Telegram lib is bundled into each route that imports it. Grab the plan
// chunk — it doesn't import telegram, so we'll pull from submit.
const submitPath = path.join(
  ROOT,
  '.next/server/app/api/submit/route.js',
);
const mod = await import(pathToFileURL(submitPath).href);

// The formatter isn't re-exported — easier: call the POST handler and scrape
// its stubbed console log. But that misses the full body. Simplest: use the
// uncompiled TS formatter via a tiny reconstruction here for inspection only.

// Because the compiled file has the formatter inlined and non-exported, we
// re-import from the source instead. Node can't load TS directly, so we
// read the already-built chunk that includes the Telegram module.

const record = {
  id: 'test-uuid',
  email: 'tested@example.com',
  answers: {
    q1_who_talking_to: 'colleague',
    q2_level: 'conversational',
    q3_segment: 'career',
    // v2: age bracket replaces the old prior-apps multi.
    q4_age: '35_44',
    q5_moment: "A negotiation where I don't lose the argument",
    q5_moment_id: 'negotiation',
    q6_time: 20,
    q7_challenge: {
      challenge_id: 'career_fluent_pushback',
      selected_option_id: 'opt_2',
      was_correct: true,
    },
    // v2: coach selection; q8_style is still written alongside for the
    // plan-template matrix.
    q8_coach: 'elena',
    q8_style: 'conversations',
  },
  plan: {
    plan_name: 'The Stand-Up Plan',
    tagline: 'Four weeks to the moment you described.',
    the_moment: "For: A negotiation where I don't lose the argument",
    focus_axes: [],
    weeks: [],
    outcome: '',
  },
  waitlist_position: 2488,
  status: 'pending',
  created_at: '2026-04-16T09:00:00.000Z',
  retry_count: 0,
};

// Monkey-patch fetch so the Telegram module's sendMessage tries to serialize
// the full message without actually hitting the network.
const originalFetch = globalThis.fetch;
let captured = null;
globalThis.fetch = async (_url, init) => {
  captured = init;
  return {
    ok: true,
    status: 200,
    text: async () => 'ok',
  };
};

process.env.TELEGRAM_BOT_TOKEN = 'test-token';
process.env.TELEGRAM_CHAT_ID = 'test-chat';

const POST =
  typeof mod.POST === 'function'
    ? mod.POST
    : mod.default?.routeModule?.userland?.POST;
if (!POST) {
  console.error('Could not find POST on submit route. Keys:', Object.keys(mod));
  process.exit(1);
}
const req = new Request('http://localhost/api/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: record.email,
    answers: record.answers,
    _hp: '',
  }),
});

await POST(req);

globalThis.fetch = originalFetch;
delete process.env.TELEGRAM_BOT_TOKEN;
delete process.env.TELEGRAM_CHAT_ID;

console.log('\n========== Captured Telegram POST body ==========');
if (captured?.body) {
  const parsed = JSON.parse(captured.body);
  console.log(parsed.text);
  console.log('\n--- meta ---');
  console.log('chat_id:', parsed.chat_id);
  console.log('parse_mode:', parsed.parse_mode);
} else {
  console.log('No fetch captured.');
}
