/**
 * Self-heal helper: Safe auto-repair for common RunState issues
 */

import type { RunState } from '@/types/schema'
import { rebuildDerivedFields, rebuildLaneRatingsFromHistory, INITIAL_LANE_RATINGS } from './state'
import { getValidStatementIds } from '@/data/statements'
import { getNextStatement } from './selector'
import { statements } from '@/data/statements'

const ALL_LANES = [
  'partnerships',
  'content',
  'community',
  'growth',
  'nil',
  'talent',
  'bizops',
  'product'
]

export type HealResult = {
  rs: RunState
  healed: boolean
  notes: string[]
}

/**
 * Heal RunState by fixing common issues
 * Only performs safe repairs
 */
export function healRunState(rs: RunState): HealResult {
  const notes: string[] = []
  let healed = false
  let healedRs = { ...rs }

  const validStatementIds = getValidStatementIds()

  // Heal: Missing lane_ratings keys
  const ratingKeys = Object.keys(healedRs.lane_ratings || {})
  const missingLanes = ALL_LANES.filter(id => !ratingKeys.includes(id))
  if (missingLanes.length > 0) {
    // Rebuild from baseline and replay history
    healedRs.lane_ratings = rebuildLaneRatingsFromHistory(healedRs.history || [])
    notes.push(`Rebuilt lane_ratings (was missing: ${missingLanes.join(', ')})`)
    healed = true
  }

  // Heal: Missing presented_statement_ids
  if (!healedRs.presented_statement_ids || healedRs.presented_statement_ids.length === 0) {
    const presented: string[] = []
    
    // Add from history
    const history = healedRs.history || []
    for (let i = 0; i < history.length; i++) {
      const entry = history[i]
      if (entry.statement_id && validStatementIds.has(entry.statement_id)) {
        if (!presented.includes(entry.statement_id)) {
          presented.push(entry.statement_id)
        }
      }
    }
    
    // Add current if valid
    if (healedRs.current_statement_id && validStatementIds.has(healedRs.current_statement_id)) {
      if (!presented.includes(healedRs.current_statement_id)) {
        presented.push(healedRs.current_statement_id)
      }
    }
    
    healedRs.presented_statement_ids = presented
    notes.push('Rebuilt presented_statement_ids from history + current')
    healed = true
  }

  // Heal: current_statement_id != last presented
  const presentedIds = healedRs.presented_statement_ids || []
  if (presentedIds.length > 0 && healedRs.current_statement_id !== presentedIds[presentedIds.length - 1]) {
    healedRs.current_statement_id = presentedIds[presentedIds.length - 1]
    notes.push(`Fixed current_statement_id to match last presented`)
    healed = true
  }

  // Heal: Missing derived fields
  if (!healedRs.seen_statement_ids || !healedRs.lane_counts_shown || !healedRs.answer_counts) {
    healedRs = rebuildDerivedFields(healedRs)
    notes.push('Rebuilt derived fields (seen_statement_ids, lane_counts_shown, answer_counts)')
    healed = true
  }

  // Heal: Invalid current_statement_id
  if (healedRs.current_statement_id && !validStatementIds.has(healedRs.current_statement_id)) {
    // Try to find first unseen statement
    const seenSet = new Set(healedRs.seen_statement_ids || [])
    const unseen = statements.find(s => !seenSet.has(s.id))
    
    if (unseen) {
      healedRs.current_statement_id = unseen.id
      if (!presentedIds.includes(unseen.id)) {
        healedRs.presented_statement_ids = [...presentedIds, unseen.id]
      }
      notes.push(`Replaced invalid current_statement_id with first unseen: ${unseen.id}`)
    } else {
      // Last resort: try selector
      const next = getNextStatement(statements, healedRs)
      if (next) {
        healedRs.current_statement_id = next.id
        if (!presentedIds.includes(next.id)) {
          healedRs.presented_statement_ids = [...presentedIds, next.id]
        }
        notes.push(`Replaced invalid current_statement_id via selector: ${next.id}`)
      } else {
        // No statements available - reset to null (will trigger route to results)
        healedRs.current_statement_id = null
        notes.push('No valid statements available, set current_statement_id to null')
      }
    }
    healed = true
  }

  // Heal: Remove duplicates from presented_statement_ids
  const presentedSet = new Set(presentedIds)
  if (presentedSet.size !== presentedIds.length) {
    healedRs.presented_statement_ids = [...presentedSet]
    notes.push('Removed duplicates from presented_statement_ids')
    healed = true
  }

  // Heal: Filter invalid IDs from seen_statement_ids
  const seenIds = healedRs.seen_statement_ids || []
  const validSeenIds = seenIds.filter(id => validStatementIds.has(id))
  if (validSeenIds.length !== seenIds.length) {
    healedRs.seen_statement_ids = validSeenIds
    notes.push(`Filtered ${seenIds.length - validSeenIds.length} invalid IDs from seen_statement_ids`)
    healed = true
  }

  return {
    rs: healedRs,
    healed,
    notes
  }
}

