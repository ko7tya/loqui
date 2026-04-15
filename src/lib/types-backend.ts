import type { FunnelState, GeneratedPlan } from './types';

/**
 * Backend-only types.
 *
 * Kept separate from `types.ts` so the shared funnel/plan types stay lean —
 * the frontend does not import anything from this file.
 */

export type SubmissionStatus = 'pending' | 'delivered' | 'failed';

export interface SubmissionRecord {
  id: string;
  email: string;
  answers: FunnelState;
  plan: GeneratedPlan;
  waitlist_position: number;
  status: SubmissionStatus;
  created_at: string;
  delivered_at?: string;
  retry_count: number;
  last_error?: string;
}
