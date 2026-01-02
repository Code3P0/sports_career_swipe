/**
 * Centralized state management for RunState
 * Handles storage, migration, and deterministic state rebuilding
 */

import type { RunState, HistoryEntry } from '@/types/schema'
import { updateElo } from './elo'
import { getValidStatementIds } from '@/data/statements'
import { RunStateSchema, safeJsonParse } from './schemas'
import { healRunState } from './heal'

// All 8 MVP lanes (shared constant)
const ALL_LANES = [
  'partnerships',
  'content',
  'community',
  'growth',
  'nil',
  'talent',
  'bizops',
  'product',
]

const OLD_STORAGE_KEY = 'runState'
const NEW_STORAGE_KEY = 'sports-career-swipe:run-state:v1'
const CURRENT_SCHEMA_VERSION = 2
const BASELINE_RATING = 1000
const MAX_ROUNDS = 32

// Initialize all lanes to baseline
export const INITIAL_LANE_RATINGS: Record<string, number> = Object.fromEntries(
  ALL_LANES.map((lane) => [lane, BASELINE_RATING])
)

/**
 * Load RunState from localStorage
 * Returns null if not found, or fresh RunState if corrupted
 * Recovery chain: validate -> migrate -> validate -> heal -> validate -> reset
 * Tries NEW_KEY first, falls back to OLD_KEY for backward compatibility
 */
export function loadRunState(): RunState | null {
  if (typeof window === 'undefined') return null

  try {
    // Try new key first
    let stored = localStorage.getItem(NEW_STORAGE_KEY)
    let usedOldKey = false

    // Fallback to old key for backward compatibility
    if (!stored) {
      stored = localStorage.getItem(OLD_STORAGE_KEY)
      usedOldKey = true
    }

    if (!stored) return null

    // Step 1: Safe JSON parse
    const parsed = safeJsonParse<any>(stored)
    if (!parsed) {
      console.warn('Failed to parse runState JSON, resetting')
      const fresh = resetRunState()
      saveRunState(fresh)
      return fresh
    }

    // Step 2: Validate
    let validation = RunStateSchema.safeParse(parsed)
    if (validation.success) {
      const validState = validation.data as RunState
      // Write-through migration: if we used old key, write to new key
      if (usedOldKey) {
        saveRunState(validState)
      }
      return validState
    }

    // Step 3: Try migration
    const migrated = migrateRunState(parsed)
    validation = RunStateSchema.safeParse(migrated)
    if (validation.success) {
      const validState = validation.data as RunState
      // Write-through migration: if we used old key, write to new key
      if (usedOldKey) {
        saveRunState(validState)
      }
      return validState
    }

    // Step 4: Try heal
    const healed = healRunState(migrated)
    validation = RunStateSchema.safeParse(healed.rs)
    if (validation.success) {
      const validState = validation.data as RunState
      // Write-through migration: if we used old key, write to new key
      if (usedOldKey) {
        saveRunState(validState)
      }
      return validState
    }

    // Step 5: Last resort - reset
    console.warn('RunState corrupted beyond repair, resetting:', validation.error.issues)
    const fresh = resetRunState()
    saveRunState(fresh)
    return fresh
  } catch (e) {
    console.warn('Failed to load runState:', e)
    const fresh = resetRunState()
    saveRunState(fresh)
    return fresh
  }
}

/**
 * Save RunState to localStorage
 */
export function saveRunState(rs: RunState): void {
  if (typeof window === 'undefined') return

  try {
    // Ensure schema version is set
    const stateWithVersion = {
      ...rs,
      schema_version: CURRENT_SCHEMA_VERSION,
    }
    // Always save to new key (migration complete)
    localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(stateWithVersion))
    // Note: We don't delete old key automatically to preserve user data
  } catch (e) {
    console.warn('Failed to save runState:', e)
  }
}

/**
 * Reset RunState to initial state
 */
export function resetRunState(): RunState {
  return {
    round: 1,
    max_rounds: MAX_ROUNDS,
    lane_ratings: { ...INITIAL_LANE_RATINGS },
    history: [],
    seen_statement_ids: [],
    lane_counts_shown: {},
    answer_counts: { yes: 0, no: 0, skip: 0 },
    current_statement_id: null,
    presented_statement_ids: [],
    schema_version: CURRENT_SCHEMA_VERSION,
  }
}

/**
 * Migrate RunState from older schema versions
 */
export function migrateRunState(rs: any): RunState {
  const validStatementIds = getValidStatementIds()

  // Ensure basic structure
  if (!rs || typeof rs !== 'object') {
    return resetRunState()
  }

  // Schema version 1 -> 2: Add presented_statement_ids
  const schemaVersion = rs.schema_version || 1

  // Migrate lane_ratings
  if (!rs.lane_ratings || Object.keys(rs.lane_ratings).length === 0) {
    rs.lane_ratings = { ...INITIAL_LANE_RATINGS }
  }

  // Ensure all lanes exist
  const migratedRatings = { ...INITIAL_LANE_RATINGS }
  Object.keys(rs.lane_ratings || {}).forEach((lane) => {
    if (ALL_LANES.includes(lane)) {
      migratedRatings[lane] = rs.lane_ratings[lane]
    }
  })
  rs.lane_ratings = migratedRatings

  // Migrate max_rounds
  if (!rs.max_rounds || rs.max_rounds !== MAX_ROUNDS) {
    rs.max_rounds = MAX_ROUNDS
  }

  // Migrate tracking fields
  if (!rs.seen_statement_ids) {
    rs.seen_statement_ids = []
  }
  if (!rs.lane_counts_shown) {
    rs.lane_counts_shown = {}
  }
  if (!rs.answer_counts) {
    rs.answer_counts = { yes: 0, no: 0, skip: 0 }
  }

  // Filter invalid statement IDs
  rs.seen_statement_ids = (rs.seen_statement_ids || []).filter((id: string) =>
    validStatementIds.has(id)
  )

  // Filter invalid history entries, fill missing timestamps, and normalize answers
  const normalizedHistory: HistoryEntry[] = (rs.history || [])
    .map((entry: any): HistoryEntry => {
      const normalized: HistoryEntry = {
        ...entry,
      }
      // Fill missing timestamp_iso (backward compatibility)
      if (!normalized.timestamp_iso) {
        normalized.timestamp_iso = new Date().toISOString()
      }
      // Normalize answer to valid enum value (backward compatibility)
      if (entry.answer && typeof entry.answer === 'string') {
        const answerLower = entry.answer.toLowerCase()
        if (
          answerLower === 'yes' ||
          answerLower === 'no' ||
          answerLower === 'meh' ||
          answerLower === 'skip'
        ) {
          normalized.answer = answerLower as 'yes' | 'no' | 'meh' | 'skip'
        } else {
          // Invalid answer, remove it
          normalized.answer = undefined
        }
      }
      return normalized
    })
    .filter((entry: HistoryEntry) => {
      if (entry.statement_id && !validStatementIds.has(entry.statement_id)) {
        return false
      }
      return true
    })
  rs.history = normalizedHistory

  // Migrate presented_statement_ids (new in v2)
  if (!rs.presented_statement_ids || rs.presented_statement_ids.length === 0) {
    // Build from history + current_statement_id
    rs.presented_statement_ids = []

    // Add all statement_ids from history (in order)
    rs.history.forEach((entry: HistoryEntry) => {
      if (entry.statement_id && validStatementIds.has(entry.statement_id)) {
        if (!rs.presented_statement_ids.includes(entry.statement_id)) {
          rs.presented_statement_ids.push(entry.statement_id)
        }
      }
    })

    // Add current_statement_id as last if valid
    if (rs.current_statement_id && validStatementIds.has(rs.current_statement_id)) {
      // Remove if already present (shouldn't happen, but be safe)
      rs.presented_statement_ids = rs.presented_statement_ids.filter(
        (id: string) => id !== rs.current_statement_id
      )
      rs.presented_statement_ids.push(rs.current_statement_id)
    }
  } else {
    // Filter invalid IDs from presented_statement_ids
    rs.presented_statement_ids = rs.presented_statement_ids.filter((id: string) =>
      validStatementIds.has(id)
    )
  }

  // Ensure current_statement_id matches last presented
  if (rs.presented_statement_ids.length > 0) {
    rs.current_statement_id = rs.presented_statement_ids[rs.presented_statement_ids.length - 1]
  } else if (rs.current_statement_id && !validStatementIds.has(rs.current_statement_id)) {
    rs.current_statement_id = null
  }

  // Rebuild derived fields from history
  rs = rebuildDerivedFields(rs)

  // Set schema version
  rs.schema_version = CURRENT_SCHEMA_VERSION

  return rs as RunState
}

/**
 * Rebuild derived fields from history
 * Recomputes seen_statement_ids, lane_counts_shown, answer_counts from history
 */
export function rebuildDerivedFields(rs: RunState): RunState {
  const validStatementIds = getValidStatementIds()

  // Reset derived fields
  rs.seen_statement_ids = []
  rs.lane_counts_shown = {}
  rs.answer_counts = { yes: 0, no: 0, skip: 0 }

  // Rebuild from history
  rs.history.forEach((entry) => {
    if (entry.statement_id && validStatementIds.has(entry.statement_id)) {
      if (!rs.seen_statement_ids!.includes(entry.statement_id)) {
        rs.seen_statement_ids!.push(entry.statement_id)
      }
    }
    if (entry.lane_id) {
      rs.lane_counts_shown![entry.lane_id] = (rs.lane_counts_shown![entry.lane_id] || 0) + 1
    }
    if (entry.answer) {
      if (entry.answer === 'yes') rs.answer_counts!.yes++
      else if (entry.answer === 'no') rs.answer_counts!.no++
      else if (entry.answer === 'skip' || entry.answer === 'meh') rs.answer_counts!.skip++
    }
  })

  return rs
}

/**
 * Rebuild lane_ratings by replaying history from baseline
 * Used for deterministic undo
 */
export function rebuildLaneRatingsFromHistory(history: HistoryEntry[]): Record<string, number> {
  const ratings = { ...INITIAL_LANE_RATINGS }
  const validStatementIds = getValidStatementIds()

  history.forEach((entry) => {
    // Only process entries with statement_id and answer (new format)
    if (!entry.statement_id || !entry.answer || !entry.lane_id) return
    if (!validStatementIds.has(entry.statement_id)) return

    // Skip SKIP/MEH - they don't affect ratings
    if (entry.answer === 'skip' || entry.answer === 'meh') return

    const laneId = entry.lane_id
    const currentRating = ratings[laneId] || BASELINE_RATING

    // Apply ELO update: YES means lane wins vs baseline, NO means baseline wins vs lane
    if (entry.answer === 'yes') {
      const { winner } = updateElo(currentRating, BASELINE_RATING)
      ratings[laneId] = winner
    } else if (entry.answer === 'no') {
      const { loser } = updateElo(BASELINE_RATING, currentRating)
      ratings[laneId] = loser
    }
  })

  return ratings
}
