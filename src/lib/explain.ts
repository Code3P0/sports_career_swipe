/**
 * Explainability helpers: Analyze history to explain why user got their top lane
 */

import type { RunState, HistoryEntry } from '@/types/schema'
import type { Statement } from '@/data/statements'

export type TopSignal = {
  entry: HistoryEntry
  statement: Statement | null
  supportScore: number // +1 for YES, -1 for NO, 0 for SKIP/MEH
}

export type LaneSupportSummary = {
  yesCount: number
  noCount: number
  skipCount: number
  totalCount: number
}

/**
 * Get top n history entries that most strongly support the top lane
 * Prioritizes YES answers on the top lane, then NO answers (showing rejection)
 * Returns entries sorted by support score (YES first, then NO, then SKIP/MEH)
 */
export function getTopSignals(
  runState: RunState,
  statementsById: Map<string, Statement>,
  topLaneId: string,
  n: number = 3
): TopSignal[] {
  // Filter history to entries for the top lane
  const topLaneEntries = runState.history.filter((entry) => {
    // Must have lane_id matching top lane
    if (!entry.lane_id || entry.lane_id !== topLaneId) return false
    // Must have answer (new format)
    if (!entry.answer) return false
    return true
  })

  // Map to TopSignal with support scores
  const signals: TopSignal[] = topLaneEntries.map((entry) => {
    const statement = entry.statement_id ? statementsById.get(entry.statement_id) || null : null

    // Calculate support score: YES=+1, NO=-1, SKIP/MEH=0
    let supportScore = 0
    if (entry.answer === 'yes') {
      supportScore = 1
    } else if (entry.answer === 'no') {
      supportScore = -1
    } else {
      supportScore = 0
    }

    return {
      entry,
      statement,
      supportScore,
    }
  })

  // Sort by support score (YES first, then NO, then SKIP/MEH)
  // Within same score, sort by timestamp (most recent first)
  signals.sort((a, b) => {
    if (b.supportScore !== a.supportScore) {
      return b.supportScore - a.supportScore // YES (1) before NO (-1) before SKIP (0)
    }
    // Same score: most recent first
    const timeA = new Date(a.entry.timestamp_iso).getTime()
    const timeB = new Date(b.entry.timestamp_iso).getTime()
    return timeB - timeA
  })

  // Return top n
  return signals.slice(0, n)
}

/**
 * Get summary of YES/NO/SKIP counts for statements mapped to topLaneId
 */
export function getLaneSupportSummary(runState: RunState, topLaneId: string): LaneSupportSummary {
  const topLaneEntries = runState.history.filter((entry) => {
    if (!entry.lane_id || entry.lane_id !== topLaneId) return false
    if (!entry.answer) return false
    return true
  })

  let yesCount = 0
  let noCount = 0
  let skipCount = 0

  topLaneEntries.forEach((entry) => {
    if (entry.answer === 'yes') {
      yesCount++
    } else if (entry.answer === 'no') {
      noCount++
    } else if (entry.answer === 'skip' || entry.answer === 'meh') {
      skipCount++
    }
  })

  return {
    yesCount,
    noCount,
    skipCount,
    totalCount: topLaneEntries.length,
  }
}
