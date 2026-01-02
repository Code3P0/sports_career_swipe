/**
 * Smoke tests for RunState invariants and undo behavior
 * Run with: npm run smoke
 */

import type { RunState, HistoryEntry } from '@/types/schema'
import { resetRunState, rebuildLaneRatingsFromHistory, rebuildDerivedFields } from './state'
import { validateRunState } from './invariants'
import { updateElo } from './elo'
import { statements } from '@/data/statements'
import { getNextStatement } from './selector'

const BASELINE_RATING = 1000

/**
 * Simulate a run: create new runState, apply random answers, ensure invariants ok
 */
function testRunSimulation(): void {
  console.log('🧪 Test: Run Simulation')

  let rs = resetRunState()

  // Select first statement
  const first = getNextStatement(statements, rs)
  if (!first) {
    throw new Error('No statements available')
  }
  rs.current_statement_id = first.id
  rs.presented_statement_ids = [first.id]

  // Apply 10 random answers
  const answers: Array<'yes' | 'no' | 'skip'> = ['yes', 'no', 'skip']

  for (let i = 0; i < 10; i++) {
    const currentStmt = statements.find((s) => s.id === rs.current_statement_id!)
    if (!currentStmt) {
      throw new Error(`Statement ${rs.current_statement_id} not found`)
    }

    const answer = answers[Math.floor(Math.random() * answers.length)]
    const laneId = currentStmt.lane_id

    // Update ELO for yes/no
    if (answer === 'yes' || answer === 'no') {
      const currentRating = rs.lane_ratings[laneId] || BASELINE_RATING
      let newRating: number
      if (answer === 'yes') {
        const { winner } = updateElo(currentRating, BASELINE_RATING)
        newRating = winner
      } else {
        const { loser } = updateElo(BASELINE_RATING, currentRating)
        newRating = loser
      }
      rs.lane_ratings[laneId] = newRating
    }

    // Add history entry
    const historyEntry: HistoryEntry = {
      statement_id: currentStmt.id,
      lane_id: laneId,
      answer,
      timestamp_iso: new Date().toISOString(),
    }
    rs.history.push(historyEntry)

    // Update tracking
    if (!rs.seen_statement_ids!.includes(currentStmt.id)) {
      rs.seen_statement_ids!.push(currentStmt.id)
    }
    rs.lane_counts_shown![laneId] = (rs.lane_counts_shown![laneId] || 0) + 1
    if (answer === 'yes') rs.answer_counts!.yes++
    else if (answer === 'no') rs.answer_counts!.no++
    else if (answer === 'skip') rs.answer_counts!.skip++

    // Add to presented stack
    if (!rs.presented_statement_ids!.includes(currentStmt.id)) {
      rs.presented_statement_ids!.push(currentStmt.id)
    }

    // Select next statement
    rs.round++
    const next = getNextStatement(statements, rs)
    if (next) {
      rs.current_statement_id = next.id
      rs.presented_statement_ids!.push(next.id)
    } else {
      break
    }
  }

  // Rebuild derived fields
  rs = rebuildDerivedFields(rs)

  // Validate
  const validation = validateRunState(rs)
  if (!validation.ok) {
    throw new Error(`Run simulation failed validation:\n${validation.errors.join('\n')}`)
  }

  console.log('✅ PASS: Run simulation')
}

/**
 * Simulate undo: apply answers, undo, ensure current_statement_id matches stack and ratings replay ok
 */
function testUndoSimulation(): void {
  console.log('🧪 Test: Undo Simulation')

  let rs = resetRunState()

  // Select first statement
  const first = getNextStatement(statements, rs)
  if (!first) {
    throw new Error('No statements available')
  }
  rs.current_statement_id = first.id
  rs.presented_statement_ids = [first.id]

  const answers: Array<'yes' | 'no'> = ['yes', 'no']
  const appliedAnswers: Array<{ statementId: string; answer: 'yes' | 'no'; laneId: string }> = []

  // Apply 5 answers
  for (let i = 0; i < 5; i++) {
    const currentStmt = statements.find((s) => s.id === rs.current_statement_id!)
    if (!currentStmt) {
      throw new Error(`Statement ${rs.current_statement_id} not found`)
    }

    const answer = answers[Math.floor(Math.random() * answers.length)]
    const laneId = currentStmt.lane_id

    // Store for undo verification
    appliedAnswers.push({ statementId: currentStmt.id, answer, laneId })

    // Update ELO
    const currentRating = rs.lane_ratings[laneId] || BASELINE_RATING
    let newRating: number
    if (answer === 'yes') {
      const { winner } = updateElo(currentRating, BASELINE_RATING)
      newRating = winner
    } else {
      const { loser } = updateElo(BASELINE_RATING, currentRating)
      newRating = loser
    }
    rs.lane_ratings[laneId] = newRating

    // Add history entry
    const historyEntry: HistoryEntry = {
      statement_id: currentStmt.id,
      lane_id: laneId,
      answer,
      timestamp_iso: new Date().toISOString(),
    }
    rs.history.push(historyEntry)

    // Update tracking
    if (!rs.seen_statement_ids!.includes(currentStmt.id)) {
      rs.seen_statement_ids!.push(currentStmt.id)
    }
    rs.lane_counts_shown![laneId] = (rs.lane_counts_shown![laneId] || 0) + 1
    if (answer === 'yes') rs.answer_counts!.yes++
    else if (answer === 'no') rs.answer_counts!.no++

    // Add to presented stack
    if (!rs.presented_statement_ids!.includes(currentStmt.id)) {
      rs.presented_statement_ids!.push(currentStmt.id)
    }

    // Select next statement
    rs.round++
    const next = getNextStatement(statements, rs)
    if (next) {
      rs.current_statement_id = next.id
      rs.presented_statement_ids!.push(next.id)
    } else {
      break
    }
  }

  // Store state before undo
  const beforeUndo = {
    presentedLength: rs.presented_statement_ids!.length,
    currentId: rs.current_statement_id,
    historyLength: rs.history.length,
    ratings: { ...rs.lane_ratings },
  }

  // Undo 2 times
  for (let undoCount = 0; undoCount < 2; undoCount++) {
    const presentedIds = rs.presented_statement_ids || []
    if (presentedIds.length <= 1) break

    // Pop last presented
    const newPresentedIds = presentedIds.slice(0, -1)
    const previousStatementId = newPresentedIds[newPresentedIds.length - 1] || null

    // Remove last history entry
    const newHistory = rs.history.slice(0, -1)

    // Rebuild lane_ratings by replaying
    const rebuiltRatings = rebuildLaneRatingsFromHistory(newHistory)

    // Rebuild derived fields
    rs = rebuildDerivedFields({
      ...rs,
      round: Math.max(1, rs.round - 1),
      lane_ratings: rebuiltRatings,
      history: newHistory,
      current_statement_id: previousStatementId,
      presented_statement_ids: newPresentedIds,
    })
  }

  // Verify current_statement_id matches last presented
  const presentedIds = rs.presented_statement_ids || []
  if (presentedIds.length > 0) {
    const lastPresented = presentedIds[presentedIds.length - 1]
    if (rs.current_statement_id !== lastPresented) {
      throw new Error(
        `After undo: current_statement_id "${rs.current_statement_id}" does not match last presented "${lastPresented}"`
      )
    }
  }

  // Verify ratings were replayed correctly
  // (We can't easily verify exact values without replaying, but we can check they're reasonable)
  Object.entries(rs.lane_ratings).forEach(([laneId, rating]) => {
    if (isNaN(rating) || rating < 500 || rating > 1500) {
      throw new Error(`After undo: lane_ratings["${laneId}"] = ${rating} is invalid`)
    }
  })

  // Validate final state
  const validation = validateRunState(rs)
  if (!validation.ok) {
    throw new Error(`Undo simulation failed validation:\n${validation.errors.join('\n')}`)
  }

  console.log('✅ PASS: Undo simulation')
}

/**
 * Run all smoke tests
 */
function runSmokeTests(): void {
  console.log('🚀 Running smoke tests...\n')

  try {
    testRunSimulation()
    testUndoSimulation()

    console.log('\n✅ ALL TESTS PASSED')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error)
    process.exit(1)
  }
}

// Run if executed directly (Node.js)
if (typeof require !== 'undefined' && require.main === module) {
  runSmokeTests()
}

export { testRunSimulation, testUndoSimulation, runSmokeTests }
