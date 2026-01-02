import type { RunState } from '@/types/schema'
import type { Statement } from '@/data/statements'
import { getNextStatement } from './selector'

/**
 * Present a statement: set it as current and add to presented stack
 * Does NOT update seen_statement_ids or lane_counts_shown (those are for commits)
 */
export function presentStatement(rs: RunState, statementId: string): RunState {
  const presentedIds = [...(rs.presented_statement_ids || [])]
  if (!presentedIds.includes(statementId)) {
    presentedIds.push(statementId)
  }

  return {
    ...rs,
    current_statement_id: statementId,
    presented_statement_ids: presentedIds,
  }
}

/**
 * Ensure RunState has a current statement, priming it if needed
 * Returns { rs, changed } to indicate if state was modified
 */
export function ensureCurrentStatement(
  rs: RunState,
  statements: Statement[]
): { rs: RunState; changed: boolean } {
  // If already has current statement and presented stack, return as-is
  if (rs.current_statement_id && (rs.presented_statement_ids?.length ?? 0) > 0) {
    return { rs, changed: false }
  }

  // If presented_statement_ids exists and has items, restore from last item
  if (rs.presented_statement_ids && rs.presented_statement_ids.length > 0) {
    const lastId = rs.presented_statement_ids[rs.presented_statement_ids.length - 1]
    // Use canonical statements list for validation
    const isValid = statements.some((s) => s.id === lastId)

    if (isValid) {
      // Restore current from stack (deterministic, no new selection)
      return {
        rs: {
          ...rs,
          current_statement_id: lastId,
        },
        changed: !rs.current_statement_id, // Only changed if current was null
      }
    }
    // Last ID is invalid, fall through to select new
  }

  // No stack or invalid last item: select next statement using existing selector
  const next = getNextStatement(statements, rs)
  if (!next) {
    // No statements available, return state as-is (will route to results)
    return { rs, changed: false }
  }

  // Prime the state: present the new statement
  return {
    rs: presentStatement(rs, next.id),
    changed: true,
  }
}
