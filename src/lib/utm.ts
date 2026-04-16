import type { AgeBracket, Segment, UtmContext } from './types';
import { AGE_BRACKETS, SEGMENTS } from './types';

/**
 * UTM / ad-network context reader.
 *
 * Called on funnel mount. Parses `window.location.search` and returns a
 * clean `UtmContext`. Unknown params are dropped. Validation:
 *
 *   - `age` → `AgeBracket` if it matches one of the canonical values
 *   - `segment` → `Segment` if it matches one of the canonical values
 *   - `lang` → ISO 639-1 two-letter lowercase
 *   - everything else is a free-form string (capped at 64 chars)
 *
 * SSR-safe: returns `{}` when `window` is undefined.
 */

const MAX_STR_LEN = 64;

const clamp = (v: string | null | undefined): string | undefined => {
  if (!v) return undefined;
  const trimmed = v.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, MAX_STR_LEN);
};

const AGE_SET = new Set<string>(AGE_BRACKETS);
const SEGMENT_SET = new Set<string>(SEGMENTS);

const parseAge = (raw: string | null): AgeBracket | undefined => {
  if (!raw) return undefined;
  return AGE_SET.has(raw) ? (raw as AgeBracket) : undefined;
};

const parseSegment = (raw: string | null): Segment | undefined => {
  if (!raw) return undefined;
  return SEGMENT_SET.has(raw) ? (raw as Segment) : undefined;
};

const parseLang = (raw: string | null): string | undefined => {
  if (!raw) return undefined;
  const lower = raw.trim().slice(0, 2).toLowerCase();
  // Two ascii letters only — reject "Latn", "en-US", etc.
  return /^[a-z]{2}$/.test(lower) ? lower : undefined;
};

export function readUtmFromLocation(): UtmContext {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);

  const ctx: UtmContext = {};

  const utm_source = clamp(params.get('utm_source'));
  if (utm_source) ctx.utm_source = utm_source;
  const utm_campaign = clamp(params.get('utm_campaign'));
  if (utm_campaign) ctx.utm_campaign = utm_campaign;
  const utm_medium = clamp(params.get('utm_medium'));
  if (utm_medium) ctx.utm_medium = utm_medium;
  const utm_content = clamp(params.get('utm_content'));
  if (utm_content) ctx.utm_content = utm_content;

  const age_hint = parseAge(params.get('age'));
  if (age_hint) ctx.age_hint = age_hint;
  const segment_hint = parseSegment(params.get('segment'));
  if (segment_hint) ctx.segment_hint = segment_hint;
  const lang_hint = parseLang(params.get('lang'));
  if (lang_hint) ctx.lang_hint = lang_hint;
  const persona = clamp(params.get('persona'));
  if (persona) ctx.persona = persona;

  return ctx;
}

/**
 * Detect a two-letter lowercase locale code from the browser. Returns
 * undefined when running server-side. Used as the default for the help
 * tooltip when UTM `lang_hint` is absent.
 */
export function detectBrowserLocale(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const raw = navigator.language || '';
  const lower = raw.trim().slice(0, 2).toLowerCase();
  return /^[a-z]{2}$/.test(lower) ? lower : undefined;
}
