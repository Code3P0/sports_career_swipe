/**
 * Unit tests for state management
 */

import { describe, it, expect } from 'vitest'
import { resetRunState, migrateRunState } from './state'
import { RunStateSchema } from './schemas'

describe('RunState', () => {
  it('RunStateSchema accepts valid default state', () => {
    const defaultState = resetRunState()
    const validation = RunStateSchema.safeParse(defaultState)
    expect(validation.success).toBe(true)
    if (validation.success) {
      expect(validation.data.round).toBe(1)
      expect(validation.data.max_rounds).toBe(32)
      expect(Object.keys(validation.data.lane_ratings).length).toBe(8)
    }
  })

  it('Migration normalizes legacy answer/timestamp and keeps state valid', () => {
    const legacyState: any = {
      round: 3,
      max_rounds: 32,
      lane_ratings: {
        partnerships: 1050,
        content: 1000,
        community: 1000,
        growth: 1000,
        nil: 1000,
        talent: 1000,
        bizops: 1000,
        product: 1000,
      },
      history: [
        {
          statement_id: 'stmt-partnerships-1',
          lane_id: 'partnerships',
          answer: 'YES', // Legacy uppercase
          // Missing timestamp_iso
        },
        {
          statement_id: 'stmt-content-1',
          lane_id: 'content',
          answer: 'no',
          // Missing timestamp_iso
        },
      ],
      seen_statement_ids: ['stmt-partnerships-1', 'stmt-content-1'],
      lane_counts_shown: { partnerships: 1, content: 1 },
      answer_counts: { yes: 1, no: 1, skip: 0 },
      schema_version: 1,
    }

    const migrated = migrateRunState(legacyState)
    const validation = RunStateSchema.safeParse(migrated)

    expect(validation.success).toBe(true)
    if (validation.success) {
      // Verify timestamps were filled
      expect(migrated.history[0]?.timestamp_iso).toBeDefined()
      expect(migrated.history[1]?.timestamp_iso).toBeDefined()
      // Verify answer was normalized
      expect(migrated.history[0]?.answer).toBe('yes')
      expect(migrated.history[1]?.answer).toBe('no')
    }
  })
})
