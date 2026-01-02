/**
 * Invariant checks for RunState
 * Validates data integrity and catches bugs early
 */

import type { RunState } from '@/types/schema'
import { lanes } from '@/data/lanes'
import { getValidStatementIds } from '@/data/statements'

export type InvariantResult = {
  ok: boolean
  errors: string[]
  warnings: string[]
}

const ALL_LANE_IDS = new Set(lanes.map((l) => l.id))

/**
 * Validate RunState invariants
 * Returns errors (must fix) and warnings (should fix)
 */
export function validateRunState(rs: RunState | null): InvariantResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!rs) {
    errors.push('RunState is null')
    return { ok: false, errors, warnings }
  }

  // A) Schema + IDs
  if (rs.schema_version === undefined) {
    warnings.push('schema_version missing (treating as old schema)')
  }

  // Lane ratings keys match lanes
  const ratingKeys = new Set(Object.keys(rs.lane_ratings || {}))
  const laneIds = ALL_LANE_IDS
  const missingLanes = [...laneIds].filter((id) => !ratingKeys.has(id))
  const extraLanes = [...ratingKeys].filter((id) => !laneIds.has(id))

  if (missingLanes.length > 0) {
    errors.push(`lane_ratings missing lanes: ${missingLanes.join(', ')}`)
  }
  if (extraLanes.length > 0) {
    warnings.push(`lane_ratings has extra lanes: ${extraLanes.join(', ')}`)
  }

  // Current statement ID validation
  const validStatementIds = getValidStatementIds()
  if (!rs.current_statement_id) {
    errors.push('current_statement_id is null/undefined')
  } else if (!validStatementIds.has(rs.current_statement_id)) {
    errors.push(`current_statement_id "${rs.current_statement_id}" is not a valid statement ID`)
  }

  // Seen statement IDs validation
  const seenIds = rs.seen_statement_ids || []
  const invalidSeenIds = seenIds.filter((id) => !validStatementIds.has(id))
  if (invalidSeenIds.length > 0) {
    errors.push(`seen_statement_ids contains invalid IDs: ${invalidSeenIds.join(', ')}`)
  }

  // B) Stack integrity
  const presentedIds = rs.presented_statement_ids || []

  if (presentedIds.length < 1) {
    errors.push('presented_statement_ids is empty (must have at least 1)')
  }

  if (rs.current_statement_id && presentedIds.length > 0) {
    const lastPresented = presentedIds[presentedIds.length - 1]
    if (rs.current_statement_id !== lastPresented) {
      errors.push(
        `current_statement_id "${rs.current_statement_id}" does not match last presented "${lastPresented}"`
      )
    }
  }

  // Check for duplicates in presented stack
  const presentedSet = new Set(presentedIds)
  if (presentedSet.size !== presentedIds.length) {
    warnings.push(
      `presented_statement_ids has duplicates (${presentedIds.length} items, ${presentedSet.size} unique)`
    )
  }

  // C) History integrity
  const history = rs.history || []
  const answerCounts = rs.answer_counts || { yes: 0, no: 0, skip: 0 }
  const derivedTotal = answerCounts.yes + answerCounts.no + answerCounts.skip

  // Count history entries with answers
  const historyWithAnswers = history.filter(
    (e) =>
      e.answer &&
      (e.answer === 'yes' || e.answer === 'no' || e.answer === 'skip' || e.answer === 'meh')
  )
  if (historyWithAnswers.length !== derivedTotal) {
    warnings.push(
      `history length (${historyWithAnswers.length}) does not match answer_counts total (${derivedTotal})`
    )
  }

  // Validate history entries
  history.forEach((entry, idx) => {
    if (!entry.statement_id) {
      errors.push(`history[${idx}] missing statement_id`)
    } else if (!validStatementIds.has(entry.statement_id)) {
      warnings.push(`history[${idx}] has invalid statement_id: ${entry.statement_id}`)
    }

    if (!entry.lane_id) {
      errors.push(`history[${idx}] missing lane_id`)
    }

    if (!entry.answer) {
      errors.push(`history[${idx}] missing answer`)
    }

    if (!entry.timestamp_iso) {
      errors.push(`history[${idx}] missing timestamp_iso`)
    }
  })

  // Check history statement_ids are in presented stack
  history.forEach((entry, idx) => {
    if (entry.statement_id && !presentedIds.includes(entry.statement_id)) {
      warnings.push(
        `history[${idx}] statement_id "${entry.statement_id}" not in presented_statement_ids`
      )
    }
  })

  // D) Range checks
  Object.entries(rs.lane_ratings || {}).forEach(([laneId, rating]) => {
    if (typeof rating !== 'number' || isNaN(rating)) {
      errors.push(`lane_ratings["${laneId}"] is NaN or not a number`)
    } else if (rating < 500 || rating > 1500) {
      warnings.push(`lane_ratings["${laneId}"] = ${rating} is outside reasonable bounds (500-1500)`)
    }
  })

  // Round checks
  if (rs.round < 1) {
    errors.push(`round is ${rs.round} (must be >= 1)`)
  }
  if (rs.round > rs.max_rounds) {
    errors.push(`round (${rs.round}) exceeds max_rounds (${rs.max_rounds})`)
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  }
}
