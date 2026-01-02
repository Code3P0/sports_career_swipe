'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { RunState, HistoryEntry } from '@/types/schema'
import { updateElo } from '@/lib/elo'
import { statements, type Statement, getStatementById, getValidStatementIds } from '@/data/statements'
import { getNextStatement } from '@/lib/selector'
import styles from './play.module.css'

// All 8 MVP lanes
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

// Initialize all lanes to 1000
const INITIAL_LANE_RATINGS: Record<string, number> = Object.fromEntries(
  ALL_LANES.map(lane => [lane, 1000])
)

// Swipe threshold: drag distance in pixels to trigger action
// Adjust this value to make swipes more/less sensitive
const SWIPE_THRESHOLD = 80

// End zone start: progress threshold (0-1) where full wash and stroke begin
// Adjust this value (0.85 = 85% progress) to change when effects kick in
const END_ZONE_START = 0.85

// Max stroke width: maximum stroke thickness in pixels at 100% progress
// Adjust this value to make stroke thicker/thinner
const MAX_STROKE_WIDTH = 10

// Color constants for direction-aware effects
// Adjust these rgba values to change stroke/wash colors
const YES_COLOR = 'rgba(76, 175, 80, 1)' // Green
const NO_COLOR = 'rgba(244, 67, 54, 1)' // Red
const SKIP_COLOR = 'rgba(255, 193, 7, 0.3)' // Gold/yellow with transparency

// Fill color constants (premium muted tones)
// Adjust these rgba values to change fill gradient colors
const YES_FILL = 'rgba(76, 175, 80, 1)' // Green - darker edge
const YES_FILL_SOFT = 'rgba(129, 199, 132, 1)' // Green - softer interior
const NO_FILL = 'rgba(244, 67, 54, 1)' // Red - darker edge
const NO_FILL_SOFT = 'rgba(239, 154, 154, 1)' // Red - softer interior

// Fill opacity ramp constants
// Adjust these values to control fill visibility progression
const FILL_OPACITY_BASE = 0.05 // Base opacity (very subtle early)
const FILL_OPACITY_RAMP = 0.55 // Ramp multiplier
const FILL_OPACITY_END_BOOST = 0.20 // Extra boost in end zone

// Glow intensity constants
// Adjust these values to control stroke glow strength
const GLOW_BASE = 4 // Base glow radius in pixels
const GLOW_RAMP = 10 // Glow ramp multiplier
const GLOW_ALPHA = 0.35 // Glow opacity multiplier
const GLOW_PULSE_BOOST = 6 // Extra pulse boost in last 5-10%

// Skip animation duration in milliseconds
// Adjust this value to make skip animation faster/slower
const SKIP_ANIMATION_DURATION = 180

// Baseline rating for ELO calculations
// Adjust this value to change how much YES/NO affects ratings
const BASELINE_RATING = 1000

// Run length: number of statements to show
// Adjust these values to change game length and early finish
const MIN_SWIPES = 18 // Minimum swipes before early finish allowed
const MAX_ROUNDS = 32 // Maximum swipes (current max)
const FINISH_GAP = 75 // ELO points gap required for early finish
const MAX_SKIP_RATE_FOR_STRONG = 0.35 // Max skip rate for strong confidence

// Card size: max width for square card
// Adjust this value to change card size
const CARD_MAX_WIDTH = 420

export default function PlayPage() {
  const router = useRouter()
  const [runState, setRunState] = useState<RunState | null>(null)
  
  // Swipe state
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    startX: number
    currentX: number
  }>({
    isDragging: false,
    startX: 0,
    currentX: 0
  })
  const [isAnimating, setIsAnimating] = useState(false)
  const [exitMode, setExitMode] = useState<'yes' | 'no' | 'skip' | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const undoSnapshotRef = useRef<{ runState: RunState; statementIndex: number } | null>(null)
  const isAdvancingRef = useRef(false) // Guard against double-commit

  // Get valid statement IDs for migration
  const validStatementIds = getValidStatementIds()

  // Get current statement from runState.current_statement_id (deterministic)
  const currentStatement: Statement | null = runState?.current_statement_id
    ? getStatementById(runState.current_statement_id) || null
    : null

  useEffect(() => {
    // Initialize or load RunState from localStorage
    const stored = localStorage.getItem('runState')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RunState
        // Migrate: if lane_ratings is missing or empty, initialize all lanes
        if (!parsed.lane_ratings || Object.keys(parsed.lane_ratings).length === 0) {
          parsed.lane_ratings = { ...INITIAL_LANE_RATINGS }
        }
        // Ensure all lanes exist (add missing ones)
        const migratedRatings = { ...INITIAL_LANE_RATINGS }
        Object.keys(parsed.lane_ratings).forEach(lane => {
          if (ALL_LANES.includes(lane)) {
            migratedRatings[lane] = parsed.lane_ratings[lane]
          }
        })
        parsed.lane_ratings = migratedRatings
        
        // Migrate max_rounds if needed
        if (!parsed.max_rounds || parsed.max_rounds !== MAX_ROUNDS) {
          parsed.max_rounds = MAX_ROUNDS
        }
        
        // Migrate: add tracking fields if missing
        if (!parsed.seen_statement_ids) {
          parsed.seen_statement_ids = []
        }
        if (!parsed.lane_counts_shown) {
          parsed.lane_counts_shown = {}
        }
        if (!parsed.answer_counts) {
          parsed.answer_counts = { yes: 0, no: 0, skip: 0 }
        }
        
        // Filter out invalid statement IDs (handle stale localStorage)
        parsed.seen_statement_ids = parsed.seen_statement_ids.filter(id => validStatementIds.has(id))
        
        // Rebuild tracking from history (filtering invalid entries)
        parsed.history = parsed.history.filter(entry => {
          if (entry.statement_id && !validStatementIds.has(entry.statement_id)) {
            return false // Remove invalid history entries
          }
          return true
        })
        
        parsed.history.forEach(entry => {
          if (entry.statement_id && validStatementIds.has(entry.statement_id) && !parsed.seen_statement_ids!.includes(entry.statement_id)) {
            parsed.seen_statement_ids!.push(entry.statement_id)
          }
          if (entry.lane_id) {
            parsed.lane_counts_shown![entry.lane_id] = (parsed.lane_counts_shown![entry.lane_id] || 0) + 1
          }
          if (entry.answer) {
            if (entry.answer === 'yes') parsed.answer_counts!.yes++
            else if (entry.answer === 'no') parsed.answer_counts!.no++
            else if (entry.answer === 'skip' || entry.answer === 'meh') parsed.answer_counts!.skip++
          }
        })
        
        // Validate current_statement_id
        if (parsed.current_statement_id && !validStatementIds.has(parsed.current_statement_id)) {
          parsed.current_statement_id = null // Invalid ID, will select new one
        }
        
        // If no current_statement_id, select next statement
        if (!parsed.current_statement_id) {
          const next = getNextStatement(statements, parsed)
          if (next) {
            parsed.current_statement_id = next.id
          } else {
            // No statements available, route to results
            router.push('/results')
            return
          }
        }
        
        setRunState(parsed)
      } catch (e) {
        // If parsing fails, initialize new state
        initializeRunState()
      }
    } else {
      initializeRunState()
    }
  }, [])

  const initializeRunState = () => {
    const newState: RunState = {
      round: 1,
      max_rounds: MAX_ROUNDS,
      lane_ratings: { ...INITIAL_LANE_RATINGS },
      history: [],
      seen_statement_ids: [],
      lane_counts_shown: {},
      answer_counts: { yes: 0, no: 0, skip: 0 },
      current_statement_id: null
    }
    
    // Select first statement
    const firstStatement = getNextStatement(statements, newState)
    if (firstStatement) {
      newState.current_statement_id = firstStatement.id
    } else {
      // No statements available, route to results
      router.push('/results')
      return
    }
    
    setRunState(newState)
    localStorage.setItem('runState', JSON.stringify(newState))
    undoSnapshotRef.current = null // Clear undo on new run
  }
  
  // Check if we can finish early
  const canFinishEarly = (state: RunState): boolean => {
    if (state.round < MIN_SWIPES) return false
    
    const answerCounts = state.answer_counts || { yes: 0, no: 0, skip: 0 }
    const totalAnswers = answerCounts.yes + answerCounts.no + answerCounts.skip
    if (totalAnswers < MIN_SWIPES) return false
    
    const skipRate = totalAnswers > 0 ? answerCounts.skip / totalAnswers : 0
    if (skipRate > MAX_SKIP_RATE_FOR_STRONG) return false
    
    const sortedLanes = Object.entries(state.lane_ratings)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
    
    if (sortedLanes.length < 2) return false
    
    const topRating = sortedLanes[0]?.[1] || 1000
    const runnerUpRating = sortedLanes[1]?.[1] || 1000
    const gap = topRating - runnerUpRating
    
    return gap >= FINISH_GAP
  }

  const commitChoice = (answer: 'yes' | 'no') => {
    if (!runState || isAnimating || !currentStatement || isAdvancingRef.current) return

    // Check if we've reached max rounds BEFORE updating state
    if (runState.round >= MAX_ROUNDS) {
      router.push('/results')
      return
    }

    // Set guard to prevent double-commit
    isAdvancingRef.current = true

    // Store snapshot for undo before making changes
    undoSnapshotRef.current = {
      runState: JSON.parse(JSON.stringify(runState)),
      statementIndex: 0 // Not used anymore but kept for compatibility
    }

    setIsAnimating(true)
    setExitMode(answer)
    
    const laneId = currentStatement.lane_id
    const currentRating = runState.lane_ratings[laneId] || BASELINE_RATING

    // Update ELO: YES means lane wins vs baseline, NO means baseline wins vs lane
    let newRating: number
    if (answer === 'yes') {
      const { winner } = updateElo(currentRating, BASELINE_RATING)
      newRating = winner
    } else {
      const { loser } = updateElo(BASELINE_RATING, currentRating)
      newRating = loser
    }

    const updatedRatings = {
      ...runState.lane_ratings,
      [laneId]: newRating
    }

    const historyEntry: HistoryEntry = {
      statement_id: currentStatement.id,
      lane_id: laneId,
      answer,
      timestamp_iso: new Date().toISOString()
    }

    // Update tracking fields
    const seenIds = [...(runState.seen_statement_ids || [])]
    if (!seenIds.includes(currentStatement.id)) {
      seenIds.push(currentStatement.id)
    }
    
    const laneCounts = { ...(runState.lane_counts_shown || {}) }
    laneCounts[laneId] = (laneCounts[laneId] || 0) + 1
    
    const answerCounts = { ...(runState.answer_counts || { yes: 0, no: 0, skip: 0 }) }
    if (answer === 'yes') answerCounts.yes++
    else if (answer === 'no') answerCounts.no++

    const newRound = runState.round + 1
    
    // Check if this will exceed max rounds BEFORE updating state
    if (newRound > MAX_ROUNDS) {
      // Final answer - commit to history but route immediately
      const finalState: RunState = {
        ...runState,
        round: newRound,
        lane_ratings: updatedRatings,
        history: [...runState.history, historyEntry],
        seen_statement_ids: seenIds,
        lane_counts_shown: laneCounts,
        answer_counts: answerCounts,
        current_statement_id: null
      }
      setRunState(finalState)
      localStorage.setItem('runState', JSON.stringify(finalState))
      router.push('/results')
      isAdvancingRef.current = false
      return
    }
    
    // Select next statement BEFORE updating state
    const tempState: RunState = {
      ...runState,
      round: newRound,
      lane_ratings: updatedRatings,
      history: [...runState.history, historyEntry],
      seen_statement_ids: seenIds,
      lane_counts_shown: laneCounts,
      answer_counts: answerCounts,
      current_statement_id: null // Clear current to select next
    }
    
    const nextStatement = getNextStatement(statements, tempState)
    
    // If no next statement available, route to results
    if (!nextStatement) {
      const finalState: RunState = {
        ...tempState,
        current_statement_id: null
      }
      setRunState(finalState)
      localStorage.setItem('runState', JSON.stringify(finalState))
      router.push('/results')
      isAdvancingRef.current = false
      return
    }
    
    const updatedState: RunState = {
      ...tempState,
      current_statement_id: nextStatement.id
    }

    setRunState(updatedState)
    localStorage.setItem('runState', JSON.stringify(updatedState))

    // Animate card off-screen, then move to next statement
    setTimeout(() => {
      setIsAnimating(false)
      setExitMode(null)
      setDragState({
        isDragging: false,
        startX: 0,
        currentX: 0
      })
      isAdvancingRef.current = false // Clear guard after animation
      
      // Check for early finish (max rounds already checked above)
      if (canFinishEarly(updatedState)) {
        router.push('/results')
      }
      // else: current_statement_id already set, card will render
    }, 300)
  }

  // Meh logic: advances game without changing lane_ratings
  const commitMeh = () => {
    if (!runState || isAnimating || !currentStatement || isAdvancingRef.current) return

    // Check if we've reached max rounds BEFORE updating state
    if (runState.round >= MAX_ROUNDS) {
      router.push('/results')
      return
    }

    // Set guard to prevent double-commit
    isAdvancingRef.current = true

    // Store snapshot for undo before making changes
    undoSnapshotRef.current = {
      runState: JSON.parse(JSON.stringify(runState)),
      statementIndex: 0
    }

    setIsAnimating(true)
    setExitMode('skip') // Use skip animation for meh too
    
    const laneId = currentStatement.lane_id

    // DO NOT update lane_ratings for meh
    const historyEntry: HistoryEntry = {
      statement_id: currentStatement.id,
      lane_id: laneId,
      answer: 'meh',
      timestamp_iso: new Date().toISOString()
    }

    // Update tracking fields
    const seenIds = [...(runState.seen_statement_ids || [])]
    if (!seenIds.includes(currentStatement.id)) {
      seenIds.push(currentStatement.id)
    }
    
    const laneCounts = { ...(runState.lane_counts_shown || {}) }
    laneCounts[laneId] = (laneCounts[laneId] || 0) + 1
    
    const answerCounts = { ...(runState.answer_counts || { yes: 0, no: 0, skip: 0 }) }
    answerCounts.skip++

    const newRound = runState.round + 1
    
    // Check if this will exceed max rounds BEFORE updating state
    if (newRound > MAX_ROUNDS) {
      // Final answer - commit to history but route immediately
      const finalState: RunState = {
        ...runState,
        round: newRound,
        // lane_ratings unchanged
        history: [...runState.history, historyEntry],
        seen_statement_ids: seenIds,
        lane_counts_shown: laneCounts,
        answer_counts: answerCounts,
        current_statement_id: null
      }
      setRunState(finalState)
      localStorage.setItem('runState', JSON.stringify(finalState))
      router.push('/results')
      isAdvancingRef.current = false
      return
    }
    
    // Select next statement BEFORE updating state
    const tempState: RunState = {
      ...runState,
      round: newRound,
      // lane_ratings unchanged
      history: [...runState.history, historyEntry],
      seen_statement_ids: seenIds,
      lane_counts_shown: laneCounts,
      answer_counts: answerCounts,
      current_statement_id: null // Clear current to select next
    }
    
    const nextStatement = getNextStatement(statements, tempState)
    
    // If no next statement available, route to results
    if (!nextStatement) {
      const finalState: RunState = {
        ...tempState,
        current_statement_id: null
      }
      setRunState(finalState)
      localStorage.setItem('runState', JSON.stringify(finalState))
      router.push('/results')
      isAdvancingRef.current = false
      return
    }
    
    const updatedState: RunState = {
      ...tempState,
      current_statement_id: nextStatement.id
    }

    setRunState(updatedState)
    localStorage.setItem('runState', JSON.stringify(updatedState))

    // Animate card with skip dissolve, then move to next statement
    setTimeout(() => {
      setIsAnimating(false)
      setExitMode(null)
      setDragState({
        isDragging: false,
        startX: 0,
        currentX: 0
      })
      isAdvancingRef.current = false // Clear guard after animation
      
      // Check for early finish (max rounds already checked above)
      if (canFinishEarly(updatedState)) {
        router.push('/results')
      }
      // else: current_statement_id already set, card will render
    }, SKIP_ANIMATION_DURATION)
  }

  // Skip logic: advances game without changing lane_ratings
  const commitSkip = () => {
    if (!runState || isAnimating || !currentStatement || isAdvancingRef.current) return

    // Check if we've reached max rounds BEFORE updating state
    if (runState.round >= MAX_ROUNDS) {
      router.push('/results')
      return
    }

    // Set guard to prevent double-commit
    isAdvancingRef.current = true

    // Store snapshot for undo before making changes
    undoSnapshotRef.current = {
      runState: JSON.parse(JSON.stringify(runState)),
      statementIndex: 0
    }

    setIsAnimating(true)
    setExitMode('skip')
    
    const laneId = currentStatement.lane_id

    // DO NOT update lane_ratings for skip
    const historyEntry: HistoryEntry = {
      statement_id: currentStatement.id,
      lane_id: laneId,
      answer: 'skip',
      timestamp_iso: new Date().toISOString()
    }

    // Update tracking fields
    const seenIds = [...(runState.seen_statement_ids || [])]
    if (!seenIds.includes(currentStatement.id)) {
      seenIds.push(currentStatement.id)
    }
    
    const laneCounts = { ...(runState.lane_counts_shown || {}) }
    laneCounts[laneId] = (laneCounts[laneId] || 0) + 1
    
    const answerCounts = { ...(runState.answer_counts || { yes: 0, no: 0, skip: 0 }) }
    answerCounts.skip++

    const newRound = runState.round + 1
    
    // Check if this will exceed max rounds BEFORE updating state
    if (newRound > MAX_ROUNDS) {
      // Final answer - commit to history but route immediately
      const finalState: RunState = {
        ...runState,
        round: newRound,
        // lane_ratings unchanged
        history: [...runState.history, historyEntry],
        seen_statement_ids: seenIds,
        lane_counts_shown: laneCounts,
        answer_counts: answerCounts,
        current_statement_id: null
      }
      setRunState(finalState)
      localStorage.setItem('runState', JSON.stringify(finalState))
      router.push('/results')
      isAdvancingRef.current = false
      return
    }
    
    // Select next statement BEFORE updating state
    const tempState: RunState = {
      ...runState,
      round: newRound,
      // lane_ratings unchanged
      history: [...runState.history, historyEntry],
      seen_statement_ids: seenIds,
      lane_counts_shown: laneCounts,
      answer_counts: answerCounts,
      current_statement_id: null // Clear current to select next
    }
    
    const nextStatement = getNextStatement(statements, tempState)
    
    // If no next statement available, route to results
    if (!nextStatement) {
      const finalState: RunState = {
        ...tempState,
        current_statement_id: null
      }
      setRunState(finalState)
      localStorage.setItem('runState', JSON.stringify(finalState))
      router.push('/results')
      isAdvancingRef.current = false
      return
    }
    
    const updatedState: RunState = {
      ...tempState,
      current_statement_id: nextStatement.id
    }

    setRunState(updatedState)
    localStorage.setItem('runState', JSON.stringify(updatedState))

    // Animate card with skip dissolve, then move to next statement
    setTimeout(() => {
      setIsAnimating(false)
      setExitMode(null)
      setDragState({
        isDragging: false,
        startX: 0,
        currentX: 0
      })
      isAdvancingRef.current = false // Clear guard after animation
      
      // Check for early finish (max rounds already checked above)
      if (canFinishEarly(updatedState)) {
        router.push('/results')
      }
      // else: current_statement_id already set, card will render
    }, SKIP_ANIMATION_DURATION)
  }

  // Undo logic: restore previous state (deterministic - restores exact statement)
  const handleUndo = () => {
    if (!undoSnapshotRef.current || isAnimating) return

    const snapshot = undoSnapshotRef.current
    // Restore the exact state including current_statement_id
    setRunState(snapshot.runState)
    localStorage.setItem('runState', JSON.stringify(snapshot.runState))
    undoSnapshotRef.current = null
    // currentStatement is derived from runState.current_statement_id, so it will update automatically
  }

  // Swipe handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isAnimating) return
    const clientX = e.clientX || (e as any).touches?.[0]?.clientX || 0
    setDragState({
      isDragging: true,
      startX: clientX,
      currentX: clientX
    })
    const element = cardRef.current
    if (element) {
      element.setPointerCapture(e.pointerId)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.isDragging || isAnimating) return
    const clientX = e.clientX || (e as any).touches?.[0]?.clientX || 0
    setDragState(prev => ({
      ...prev,
      currentX: clientX
    }))
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragState.isDragging || isAnimating) return
    
    const deltaX = dragState.currentX - dragState.startX
    const element = cardRef.current
    
    if (element) {
      element.releasePointerCapture(e.pointerId)
    }

    // Check if swipe threshold is met
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      // Swipe right = YES, swipe left = NO
      const answer = deltaX > 0 ? 'yes' : 'no'
      commitChoice(answer)
    } else {
      // Reset position if threshold not met
      setDragState({
        isDragging: false,
        startX: 0,
        currentX: 0
      })
    }
  }

  // Handle loading state: if no current statement, check if we should route to results
  if (!runState) {
    return <div>Loading...</div>
  }
  
  // If no current statement and we have history, route to results (end of run)
  if (!currentStatement) {
    if (runState.history.length > 0) {
      // We've answered some questions but no statement available - route to results
      router.push('/results')
      return <div>Loading...</div>
    }
    // Fresh start but selector returned null - should not happen, but route to results
    router.push('/results')
    return <div>Loading...</div>
  }

  const deltaX = dragState.currentX - dragState.startX
  // Calculate swipe progress (0 to 1) clamped
  const progress = Math.min(Math.max(Math.abs(deltaX) / SWIPE_THRESHOLD, 0), 1)
  const direction = deltaX >= 0 ? 'yes' : 'no'
  
  // Calculate end zone progress (0 to 1) for wash and stroke effects
  const end = Math.min(Math.max((progress - END_ZONE_START) / (1 - END_ZONE_START), 0), 1)
  const endSquared = end * end // Easing
  
  // Eased curves for subtle early movement
  const progressSquared = progress * progress
  const progressCubed = progress * progress * progress
  // Use progress^3 for early subtlety, then blend to progress^2
  const subtleProgress = progress < 0.6 
    ? progressCubed 
    : 0.216 + (progress - 0.6) * 0.784 // Smooth transition at 60%
  
  // Fill opacity with non-linear ramp
  const fillOpacity = FILL_OPACITY_BASE + FILL_OPACITY_RAMP * subtleProgress + (end > 0 ? FILL_OPACITY_END_BOOST * endSquared : 0)
  
  // Pulse calculation for last 5-10% (92-100%)
  const pulse = Math.min(Math.max((progress - 0.92) / 0.08, 0), 1)
  
  const isSwipeRight = deltaX > 0
  const isSwipeLeft = deltaX < 0
  
  // Stroke calculations with direction-aware colors
  const strokePx = 1 + MAX_STROKE_WIDTH * endSquared
  const strokeAlpha = 0.8 * endSquared
  const strokeColor = isSwipeRight 
    ? YES_COLOR.replace('1)', `${strokeAlpha})`)
    : isSwipeLeft
    ? NO_COLOR.replace('1)', `${strokeAlpha})`)
    : `rgba(255, 0, 0, ${strokeAlpha})`
  
  // Glow calculations
  const glowPx = GLOW_BASE + GLOW_RAMP * endSquared + GLOW_PULSE_BOOST * pulse
  const glowAlpha = GLOW_ALPHA * endSquared
  const glowColor = isSwipeRight
    ? YES_COLOR.replace('1)', `${glowAlpha})`)
    : isSwipeLeft
    ? NO_COLOR.replace('1)', `${glowAlpha})`)
    : `rgba(255, 0, 0, ${glowAlpha})`
  
  // Clip-path for directional fill reveal
  const clipPath = isSwipeRight
    ? `inset(0 ${(1 - progress) * 100}% 0 0)`
    : isSwipeLeft
    ? `inset(0 0 0 ${(1 - progress) * 100}%)`
    : 'inset(0 0 0 0)'
  
  // Gradient direction and colors
  const fillGradient = isSwipeRight
    ? `linear-gradient(to left, ${YES_FILL.replace('1)', '0.85)')}, ${YES_FILL_SOFT.replace('1)', '0.25)')})`
    : isSwipeLeft
    ? `linear-gradient(to right, ${NO_FILL.replace('1)', '0.85)')}, ${NO_FILL_SOFT.replace('1)', '0.25)')})`
    : 'none'

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto',
      position: 'relative'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '1.5rem',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          {/* Undo button */}
          <button
            onClick={handleUndo}
            disabled={!undoSnapshotRef.current || isAnimating}
            style={{
              padding: '6px 12px',
              fontSize: '0.85rem',
              fontWeight: '500',
              backgroundColor: undoSnapshotRef.current && !isAnimating ? '#666' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: undoSnapshotRef.current && !isAnimating ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s',
              opacity: undoSnapshotRef.current && !isAnimating ? 1 : 0.5
            }}
            onMouseOver={(e) => {
              if (undoSnapshotRef.current && !isAnimating) {
                e.currentTarget.style.backgroundColor = '#555'
              }
            }}
            onMouseOut={(e) => {
              if (undoSnapshotRef.current && !isAnimating) {
                e.currentTarget.style.backgroundColor = '#666'
              }
            }}
          >
            Undo
          </button>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: '600'
          }}>
            Round {runState.round}/{runState.max_rounds}
          </div>
          {/* Spacer for symmetry */}
          <div style={{ width: '60px' }} />
        </div>
        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: '#e0e0e0',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(runState.round / runState.max_rounds) * 100}%`,
            height: '100%',
            backgroundColor: '#0070f3',
            transition: 'width 0.3s ease',
            borderRadius: '3px'
          }} />
        </div>
      </div>

      {/* Statement Card */}
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={styles.swipeCard}
        style={{
          padding: '32px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: dragState.isDragging && end > 0
            ? `0 4px 12px rgba(0,0,0,0.15), 0 0 0 ${strokePx}px ${strokeColor}, 0 0 ${glowPx}px ${glowColor}`
            : '0 4px 12px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          cursor: isAnimating ? 'default' : 'grab',
          touchAction: 'none',
          aspectRatio: '1 / 1',
          maxWidth: `${CARD_MAX_WIDTH}px`,
          width: '92vw',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          transform: dragState.isDragging
            ? `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`
            : isAnimating && exitMode !== 'skip'
            ? `translateX(${deltaX > 0 ? '100vw' : '-100vw'}) rotate(${deltaX > 0 ? '30deg' : '-30deg'})`
            : isAnimating && exitMode === 'skip'
            ? `scale(0.95)`
            : 'translateX(0) rotate(0deg)',
          transition: dragState.isDragging 
            ? 'none' 
            : exitMode === 'skip'
            ? `transform ${SKIP_ANIMATION_DURATION}ms ease, opacity ${SKIP_ANIMATION_DURATION}ms ease, filter ${SKIP_ANIMATION_DURATION}ms ease`
            : 'transform 0.25s ease, opacity 0.25s ease, box-shadow 0.25s ease',
          opacity: isAnimating ? 0 : 1,
          filter: isAnimating && exitMode === 'skip' ? 'blur(4px)' : 'none',
          alignSelf: 'center'
        }}
      >
        {/* Directional edge-to-edge fill overlay */}
        {dragState.isDragging && progress > 0 && (
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: fillOpacity,
            background: fillGradient,
            clipPath: clipPath,
            transition: dragState.isDragging ? 'none' : 'opacity 0.2s ease, clip-path 0.2s ease'
          }} />
        )}

        {/* Skip golden remnant overlay */}
        {isAnimating && exitMode === 'skip' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 4,
            background: SKIP_COLOR,
            transition: 'opacity 0.2s ease'
          }} />
        )}

        <p style={{
          fontSize: '1.4rem',
          fontWeight: '500',
          lineHeight: '1.6',
          textAlign: 'center',
          color: '#333',
          position: 'relative',
          zIndex: 3
        }}>
          {currentStatement.text}
        </p>
      </div>

      {/* Yes/No/Skip buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginTop: '2rem'
      }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => !dragState.isDragging && commitChoice('no')}
            disabled={isAnimating}
            style={{
              padding: '16px 32px',
              fontSize: '1.1rem',
              fontWeight: '600',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: isAnimating ? 'default' : 'pointer',
              transition: 'background-color 0.2s',
              flex: 1,
              maxWidth: '150px'
            }}
            onMouseOver={(e) => {
              if (!isAnimating) e.currentTarget.style.backgroundColor = '#d32f2f'
            }}
            onMouseOut={(e) => {
              if (!isAnimating) e.currentTarget.style.backgroundColor = '#f44336'
            }}
          >
            NO
          </button>
          <button
            onClick={() => !dragState.isDragging && commitChoice('yes')}
            disabled={isAnimating}
            style={{
              padding: '16px 32px',
              fontSize: '1.1rem',
              fontWeight: '600',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: isAnimating ? 'default' : 'pointer',
              transition: 'background-color 0.2s',
              flex: 1,
              maxWidth: '150px'
            }}
            onMouseOver={(e) => {
              if (!isAnimating) e.currentTarget.style.backgroundColor = '#45a049'
            }}
            onMouseOut={(e) => {
              if (!isAnimating) e.currentTarget.style.backgroundColor = '#4CAF50'
            }}
          >
            YES
          </button>
        </div>
        <button
          onClick={() => !dragState.isDragging && commitSkip()}
          disabled={isAnimating}
          style={{
            padding: '12px 24px',
            fontSize: '0.95rem',
            fontWeight: '500',
            backgroundColor: '#9e9e9e',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: isAnimating ? 'default' : 'pointer',
            transition: 'background-color 0.2s',
            alignSelf: 'center',
            maxWidth: '200px'
          }}
          onMouseOver={(e) => {
            if (!isAnimating) e.currentTarget.style.backgroundColor = '#757575'
          }}
          onMouseOut={(e) => {
            if (!isAnimating) e.currentTarget.style.backgroundColor = '#9e9e9e'
          }}
        >
          Skip
        </button>
      </div>

      <div style={{
        fontSize: '0.9rem',
        color: '#999',
        textAlign: 'center',
        marginTop: '1rem'
      }}>
        Swipe right for YES, left for NO
      </div>
    </main>
  )
}
