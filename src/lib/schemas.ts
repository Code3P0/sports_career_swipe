/**
 * Runtime schema validation using Zod
 * Protects against corrupted localStorage data
 */

import { z } from 'zod'

// HistoryEntry schema (tolerant for backward compatibility)
const HistoryEntrySchema = z.object({
  statement_id: z.string().optional(),
  lane_id: z.string().optional(),
  // Accept any string for answer (legacy compatibility), normalize in migrate/heal
  answer: z.string().optional(),
  card_id: z.string().optional(), // Legacy
  picked: z.enum(['left', 'right']).optional(), // Legacy
  // timestamp_iso is optional to support older runs, migration will fill it
  timestamp_iso: z.string().optional(),
})

// Convergence schema
const ConvergenceSchema = z
  .object({
    top_lane_id: z.string(),
    runner_up_lane_id: z.string(),
    rating_gap: z.number(),
    confidence_pct: z.number(),
  })
  .optional()

// RunState schema (matches TypeScript type)
export const RunStateSchema = z.object({
  round: z.number().int().min(1),
  max_rounds: z.number().int().min(1),
  lane_ratings: z.record(z.string(), z.number()),
  history: z.array(HistoryEntrySchema),
  convergence: ConvergenceSchema,
  seen_statement_ids: z.array(z.string()).optional(),
  lane_counts_shown: z.record(z.string(), z.number()).optional(),
  answer_counts: z
    .object({
      yes: z.number().int().min(0),
      no: z.number().int().min(0),
      skip: z.number().int().min(0),
    })
    .optional(),
  current_statement_id: z.string().nullable().optional(),
  presented_statement_ids: z.array(z.string()).optional(),
  schema_version: z.number().int().optional(),
})

// MetricEvent schema (allows extra props via passthrough)
export const MetricEventSchema = z
  .object({
    event: z.string(),
    ts: z.number(),
  })
  .passthrough()

// Metrics buffer schema
export const MetricsBufferSchema = z.array(MetricEventSchema)

// Saved actions schema (string array)
export const SavedActionsSchema = z.array(z.string())

/**
 * Safe JSON parse helper
 */
export function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}
