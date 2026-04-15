import type { FunnelState, Plan } from './types';

/**
 * Claude integration — env-var gated stub.
 *
 * Production path (future work):
 *   1. Set ANTHROPIC_API_KEY in env.
 *   2. Implement `generatePlanWithClaude` using `@anthropic-ai/sdk`
 *      with the prompt template in question-spec.md §Q9.
 *   3. Validate JSON against `GeneratedPlan` with a zod schema before returning.
 *   4. On timeout (>3s) or parse failure, let the route fall through to
 *      `generateDeterministicPlan` in `plan-generator.ts`.
 */

export const isClaudeEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY);

export const generatePlanWithClaude = async (
  _answers: FunnelState,
): Promise<Plan> => {
  if (!isClaudeEnabled()) {
    throw new Error('Claude not configured');
  }
  // TODO (future): Call Anthropic API per question-spec.md prompt template.
  // Returns structured Plan JSON matching the schema in question-spec.md.
  throw new Error('Not implemented — using deterministic fallback');
};
