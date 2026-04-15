import { Redis } from '@upstash/redis';
import type { SubmissionRecord } from './types-backend';

/**
 * KV outbox wrapper.
 *
 * Backed by Upstash Redis (REST) in production. In dev — when the Upstash
 * env vars are missing — a process-memory Map stands in so you can exercise
 * the full flow locally without credentials. Every dev-mode op is logged
 * with the `[KV-DEV]` prefix so the Loom shows storage behavior.
 *
 * Outbox contract:
 *   1. `saveSubmission` writes the record with status:'pending' BEFORE we
 *      touch Telegram, so a downstream hiccup never loses a signup.
 *   2. Telegram is attempted inline in /api/submit.
 *   3. On success → `markDelivered` flips status + timestamps.
 *   4. On failure → the record stays :pending and the cron job picks it up.
 */

const WAITLIST_KEY = 'loqui:waitlist:counter';
const WAITLIST_BASE = 2487;
const SUBMISSION_PREFIX = 'loqui:submission:';
const PENDING_SET_KEY = 'loqui:submissions:pending';

// --- Dev-mode in-memory store ---------------------------------------------

const memoryStore = new Map<string, string>();
const memoryPending = new Set<string>();
let memoryCounter = 0;

const devLog = (op: string, detail: Record<string, unknown> = {}): void => {
  console.log(`[KV-DEV] ${op}`, detail);
};

// --- Client selection ------------------------------------------------------

interface KVBackend {
  kind: 'redis' | 'memory';
  saveSubmission: (uuid: string, data: SubmissionRecord) => Promise<void>;
  getSubmission: (uuid: string) => Promise<SubmissionRecord | null>;
  getPendingSubmissions: (limit: number) => Promise<SubmissionRecord[]>;
  updateSubmission: (
    uuid: string,
    patch: Partial<SubmissionRecord>,
  ) => Promise<void>;
  incrementWaitlist: () => Promise<number>;
}

let cachedBackend: KVBackend | null = null;

export const isKVConfigured = (): boolean =>
  Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

const redisBackend = (redis: Redis): KVBackend => ({
  kind: 'redis',
  async saveSubmission(uuid, data) {
    const key = SUBMISSION_PREFIX + uuid;
    await redis.set(key, JSON.stringify(data));
    if (data.status === 'pending') {
      await redis.sadd(PENDING_SET_KEY, uuid);
    }
  },
  async getSubmission(uuid) {
    const key = SUBMISSION_PREFIX + uuid;
    const raw = await redis.get<string | Record<string, unknown>>(key);
    if (!raw) return null;
    // Upstash auto-deserializes JSON values; tolerate both strings + objects.
    return typeof raw === 'string'
      ? (JSON.parse(raw) as SubmissionRecord)
      : (raw as unknown as SubmissionRecord);
  },
  async getPendingSubmissions(limit) {
    const ids = await redis.smembers(PENDING_SET_KEY);
    if (ids.length === 0) return [];
    const slice = ids.slice(0, limit);
    const records: SubmissionRecord[] = [];
    for (const uuid of slice) {
      const rec = await this.getSubmission(uuid);
      if (rec) records.push(rec);
    }
    return records;
  },
  async updateSubmission(uuid, patch) {
    const existing = await this.getSubmission(uuid);
    if (!existing) return;
    const next: SubmissionRecord = { ...existing, ...patch };
    await redis.set(SUBMISSION_PREFIX + uuid, JSON.stringify(next));
    if (patch.status && patch.status !== 'pending') {
      await redis.srem(PENDING_SET_KEY, uuid);
    }
  },
  async incrementWaitlist() {
    const counter = await redis.incr(WAITLIST_KEY);
    return WAITLIST_BASE + counter; // counter starts at 1 → position 2488
  },
});

const memoryBackend: KVBackend = {
  kind: 'memory',
  async saveSubmission(uuid, data) {
    devLog('saveSubmission', { uuid, email: data.email, status: data.status });
    memoryStore.set(uuid, JSON.stringify(data));
    if (data.status === 'pending') memoryPending.add(uuid);
  },
  async getSubmission(uuid) {
    const raw = memoryStore.get(uuid);
    devLog('getSubmission', { uuid, hit: Boolean(raw) });
    return raw ? (JSON.parse(raw) as SubmissionRecord) : null;
  },
  async getPendingSubmissions(limit) {
    const ids = Array.from(memoryPending).slice(0, limit);
    devLog('getPendingSubmissions', { returned: ids.length, limit });
    const records: SubmissionRecord[] = [];
    for (const uuid of ids) {
      const raw = memoryStore.get(uuid);
      if (raw) records.push(JSON.parse(raw) as SubmissionRecord);
    }
    return records;
  },
  async updateSubmission(uuid, patch) {
    const raw = memoryStore.get(uuid);
    if (!raw) {
      devLog('updateSubmission:miss', { uuid });
      return;
    }
    const existing = JSON.parse(raw) as SubmissionRecord;
    const next: SubmissionRecord = { ...existing, ...patch };
    memoryStore.set(uuid, JSON.stringify(next));
    if (patch.status && patch.status !== 'pending') memoryPending.delete(uuid);
    devLog('updateSubmission', { uuid, patch });
  },
  async incrementWaitlist() {
    memoryCounter += 1;
    const position = WAITLIST_BASE + memoryCounter;
    devLog('incrementWaitlist', { position });
    return position;
  },
};

const getBackend = (): KVBackend => {
  if (cachedBackend) return cachedBackend;

  if (isKVConfigured()) {
    const redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
    cachedBackend = redisBackend(redis);
  } else {
    console.log('[KV-DEV] Upstash not configured — using in-memory store.');
    cachedBackend = memoryBackend;
  }
  return cachedBackend;
};

// --- Public API ------------------------------------------------------------

export const saveSubmission = (
  uuid: string,
  data: SubmissionRecord,
): Promise<void> => getBackend().saveSubmission(uuid, data);

export const getSubmission = (
  uuid: string,
): Promise<SubmissionRecord | null> => getBackend().getSubmission(uuid);

export const getPendingSubmissions = (
  limit = 50,
): Promise<SubmissionRecord[]> => getBackend().getPendingSubmissions(limit);

export const markDelivered = async (uuid: string): Promise<void> => {
  await getBackend().updateSubmission(uuid, {
    status: 'delivered',
    delivered_at: new Date().toISOString(),
  });
};

export const markFailed = async (
  uuid: string,
  last_error: string,
): Promise<void> => {
  await getBackend().updateSubmission(uuid, {
    status: 'failed',
    last_error,
  });
};

export const bumpRetry = async (
  uuid: string,
  retry_count: number,
  last_error: string,
): Promise<void> => {
  await getBackend().updateSubmission(uuid, { retry_count, last_error });
};

/**
 * Atomically claim the next waitlist position. Starts at 2,488 (base 2,487
 * + first INCR returning 1). Using INCR keeps every request serialized even
 * under concurrent load.
 */
export const incrementWaitlist = (): Promise<number> =>
  getBackend().incrementWaitlist();
