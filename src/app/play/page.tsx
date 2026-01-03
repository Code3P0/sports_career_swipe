'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { RunState, HistoryEntry } from '@/types/schema'
import { updateElo } from '@/lib/elo'
import { statements, type Statement, getStatementById } from '@/data/statements'
import { getNextStatement } from '@/lib/selector'
import { ensureCurrentStatement } from '@/lib/prime'
import {
  loadRunState,
  saveRunState,
  resetRunState,
  rebuildLaneRatingsFromHistory,
  rebuildDerivedFields,
} from '@/lib/state'
import { validateRunState } from '@/lib/invariants'
import { healRunState } from '@/lib/heal'
import { track } from '@/lib/metrics'
import { getSoundEnabled, setSoundEnabled, playSwipeSfx } from '@/lib/sfx'
import { DevPanel } from '@/components/DevPanel'
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
  'product',
]

// Lane accent colors for ambient glow (soft, not neon)
const LANE_GLOW: Record<string, { a: string; b: string }> = {
  partnerships: { a: 'rgba(59,130,246,0.22)', b: 'rgba(147,197,253,0.10)' },
  content: { a: 'rgba(168,85,247,0.20)', b: 'rgba(216,180,254,0.10)' },
  community: { a: 'rgba(34,197,94,0.18)', b: 'rgba(134,239,172,0.10)' },
  growth: { a: 'rgba(249,115,22,0.18)', b: 'rgba(253,186,116,0.10)' },
  nil: { a: 'rgba(234,179,8,0.18)', b: 'rgba(253,224,71,0.10)' },
  talent: { a: 'rgba(236,72,153,0.18)', b: 'rgba(251,207,232,0.10)' },
  bizops: { a: 'rgba(100,116,139,0.18)', b: 'rgba(203,213,225,0.10)' },
  product: { a: 'rgba(14,165,233,0.18)', b: 'rgba(186,230,253,0.10)' },
}

// Initialize all lanes to 1000
const INITIAL_LANE_RATINGS: Record<string, number> = Object.fromEntries(
  ALL_LANES.map((lane) => [lane, 1000])
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
const FILL_OPACITY_END_BOOST = 0.2 // Extra boost in end zone

// Glow intensity constants
// Adjust these values to control stroke glow strength
const GLOW_BASE = 4 // Base glow radius in pixels
const GLOW_RAMP = 10 // Glow ramp multiplier
const GLOW_ALPHA = 0.35 // Glow opacity multiplier
const GLOW_PULSE_BOOST = 6 // Extra pulse boost in last 5-10%

// Skip animation duration in milliseconds
// Adjust this value to make skip animation faster/slower
const SKIP_ANIMATION_DURATION = 180

// Exit animation duration in milliseconds
const EXIT_MS_GESTURE = 280 // Fast for gesture swipes
const EXIT_MS_BUTTON = 380 // Slower for button clicks (more readable)

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
    currentX: 0,
  })
  const [isAnimating, setIsAnimating] = useState(false)
  const [exitMode, setExitMode] = useState<'yes' | 'no' | 'skip' | null>(null)
  const [exitIntent, setExitIntent] = useState<'yes' | 'no' | 'skip' | null>(null)
  type FxState = { intent: null | 'skip'; ms: number; key: number }
  const [fx, setFx] = useState<FxState>({ intent: null, ms: 0, key: 0 })
  const [pressGlow, setPressGlow] = useState<null | 'yes' | 'no' | 'skip'>(null)
  type SwipeIntent = 'yes' | 'no' | 'skip'
  const [uiIntent, setUiIntent] = useState<null | SwipeIntent>(null)
  type FinishFx = { on: boolean; ms: number; key: number; token: string }
  const [finishFx, setFinishFx] = useState<FinishFx>({ on: false, ms: 0, key: 0, token: '' })
  const [isPeekOpen, setIsPeekOpen] = useState(false)
  const [dragUI, setDragUI] = useState<{
    x: number
    p: number
    dir: 'left' | 'right' | 'none'
  }>({ x: 0, p: 0, dir: 'none' })
  const [reducedMotion, setReducedMotion] = useState(false)
  const [soundEnabled, setSoundEnabledState] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const isAdvancingRef = useRef(false) // Guard against double-commit
  const lockRef = useRef(false) // Guard against double-swipe
  const tapStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const dragXRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  // Get current statement from runState.current_statement_id (deterministic)
  const currentStatement: Statement | null = runState?.current_statement_id
    ? getStatementById(runState.current_statement_id) || null
    : null

  // Derive current lane for ambient glow
  const laneId = currentStatement?.lane_id ?? null

  // Lane accent map for ambient glow
  const LANE_GLOW: Record<string, { a: string; b: string }> = {
    partnerships: { a: 'rgba(59,130,246,0.22)', b: 'rgba(147,197,253,0.10)' },
    content: { a: 'rgba(168,85,247,0.20)', b: 'rgba(216,180,254,0.10)' },
    community: { a: 'rgba(34,197,94,0.18)', b: 'rgba(134,239,172,0.10)' },
    growth: { a: 'rgba(249,115,22,0.18)', b: 'rgba(253,186,116,0.10)' },
    nil: { a: 'rgba(234,179,8,0.18)', b: 'rgba(253,224,71,0.10)' },
    talent: { a: 'rgba(236,72,153,0.18)', b: 'rgba(251,207,232,0.10)' },
    bizops: { a: 'rgba(100,116,139,0.18)', b: 'rgba(203,213,225,0.10)' },
    product: { a: 'rgba(14,165,233,0.18)', b: 'rgba(186,230,253,0.10)' },
  }

  const glow = laneId ? LANE_GLOW[laneId] : null

  // Reset peek when statement changes
  useEffect(() => {
    setIsPeekOpen(false)
  }, [currentStatement?.id])

  // RAF cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [])

  // Detect reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  // Load sound enabled state on mount
  useEffect(() => {
    setSoundEnabledState(getSoundEnabled())
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea/contentEditable or locked
      const target = e.target as HTMLElement
      if (
        lockRef.current ||
        isAnimating ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (target && target.isContentEditable)
      ) {
        return
      }

      const key = e.key.toLowerCase()
      const isArrowRight = e.key === 'ArrowRight'
      const isArrowLeft = e.key === 'ArrowLeft'
      const isArrowDown = e.key === 'ArrowDown'
      const isBackspace = e.key === 'Backspace'

      if ((isArrowRight || key === 'y') && !dragState.isDragging && runState) {
        e.preventDefault()
        performSwipe('yes', 'button')
      } else if ((isArrowLeft || key === 'n') && !dragState.isDragging && runState) {
        e.preventDefault()
        performSwipe('no', 'button')
      } else if ((isArrowDown || key === 's') && !dragState.isDragging && runState) {
        e.preventDefault()
        performSwipe('skip', 'button')
      } else if ((isBackspace || key === 'u') && !dragState.isDragging && runState) {
        e.preventDefault()
        handleUndo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAnimating, dragState.isDragging, runState])

  useEffect(() => {
    // Load or initialize RunState using centralized state module
    let loaded = loadRunState()
    if (loaded) {
      // Prime state with current statement if needed (before validation/healing)
      const primedResult = ensureCurrentStatement(loaded, statements)
      if (primedResult.changed) {
        loaded = primedResult.rs
        saveRunState(loaded)
      } else {
        loaded = primedResult.rs
      }

      // Validate and heal in dev
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        const validation = validateRunState(loaded)
        if (!validation.ok || validation.warnings.length > 0) {
          console.warn('[Dev] RunState validation issues:', {
            errors: validation.errors,
            warnings: validation.warnings,
          })

          // Heal once
          const healed = healRunState(loaded)
          if (healed.healed) {
            console.warn('[Dev] Auto-healed RunState:', healed.notes)
            saveRunState(healed.rs)

            // Ensure current statement after heal
            const primedAfterHealResult = ensureCurrentStatement(healed.rs, statements)
            const primedAfterHeal = primedAfterHealResult.rs
            if (primedAfterHealResult.changed) {
              saveRunState(primedAfterHeal)
            }

            // Re-validate after heal + prime
            const reValidation = validateRunState(primedAfterHeal)
            if (!reValidation.ok) {
              console.error('[Dev] RunState still has errors after heal:', reValidation.errors)
            }

            // Check if no statement available after priming
            if (!primedAfterHeal.current_statement_id) {
              router.push('/results')
              return
            }

            setRunState(primedAfterHeal)
            return
          }
        }
      }

      // Check if no statement available after priming
      if (!loaded.current_statement_id) {
        router.push('/results')
        return
      }

      setRunState(loaded)
    } else {
      initializeRunState()
    }
  }, [])

  const initializeRunState = () => {
    const newState = resetRunState()

    // Select first statement
    const firstStatement = getNextStatement(statements, newState)
    if (firstStatement) {
      newState.current_statement_id = firstStatement.id
      newState.presented_statement_ids = [firstStatement.id]
      saveRunState(newState)

      // Track run started (only when creating a new run)
      track('run_started')
    } else {
      // No statements available, route to results
      router.push('/results')
      return
    }

    setRunState(newState)
  }

  /**
   * Start finish transition and route to results after FX
   */
  const startFinishTransition = (ms: number) => {
    const token = String(Date.now())
    setFinishFx({ on: true, ms, key: Date.now(), token })
    // lock inputs immediately
    lockRef.current = true
    setIsAnimating(true)
    window.setTimeout(() => {
      // stop animation state before routing (clean)
      setFinishFx({ on: false, ms: 0, key: Date.now(), token: '' })
      setIsAnimating(false)
      // route to results with token
      router.push(`/results?celebrate=${token}`)
    }, ms)
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

  /**
   * Unified swipe-out function: animates card, then commits answer
   * Used by both gesture swipes and button clicks
   */
  const performSwipe = async (
    intent: 'yes' | 'no' | 'skip',
    source: 'button' | 'gesture' = 'gesture'
  ) => {
    if (lockRef.current || !runState || !currentStatement || isAdvancingRef.current) return

    // Check if we've reached max rounds BEFORE animation
    if (runState.round >= MAX_ROUNDS) {
      const baseMs = 700
      const fxMs = reducedMotion ? 180 : baseMs
      startFinishTransition(fxMs)
      return
    }

    // Reset dragUI before starting exit animation
    setDragUI({ x: 0, p: 0, dir: 'none' })
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    // Play SFX if enabled and not reduced motion
    if (soundEnabled && !reducedMotion) {
      playSwipeSfx(intent)
    }

    // Use different durations based on source and reduced motion
    const baseExitMs = source === 'button' ? EXIT_MS_BUTTON : EXIT_MS_GESTURE
    const exitMs = reducedMotion ? Math.round(baseExitMs * 0.57) : baseExitMs // ~160ms/220ms if reduced

    // Set FX state BEFORE applying transforms (for SKIP shimmer visibility)
    if (intent === 'skip') {
      setFx({ intent: 'skip', ms: exitMs, key: Date.now() })
    } else {
      setFx({ intent: null, ms: 0, key: Date.now() })
    }

    // IMPORTANT: Set state first so React re-renders tint/badges
    lockRef.current = true
    setUiIntent(intent)
    setIsAnimating(true)
    setExitMode(intent)
    setExitIntent(intent)

    // Let React paint the tint/badges before the element moves
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))

    // Calculate offscreen position (pixel-based, not viewport-based)
    const offX = typeof window !== 'undefined' ? window.innerWidth * 1.2 : 800

    // Apply exit transform after paint frame
    const element = cardRef.current
    if (!element) {
      // Guard: if element not found, commit immediately and unlock
      if (intent === 'skip') {
        commitSkip()
      } else {
        commitChoice(intent)
      }
      lockRef.current = false
      return
    }

    // Clear any lingering transitions before starting new animation
    element.style.transition = 'none'
    // Force a reflow to ensure transition reset takes effect
    void element.offsetHeight

    const rotation = reducedMotion ? 0 : 10 // No rotation if reduced motion
    if (intent === 'yes') {
      element.style.transform = `translateX(${offX}px) rotate(${rotation}deg)`
    } else if (intent === 'no') {
      element.style.transform = `translateX(${-offX}px) rotate(${-rotation}deg)`
    } else if (intent === 'skip') {
      element.style.transform = `translate(0px, 220px) rotate(0deg) scale(0.96)`
      element.style.opacity = '0'
      element.style.filter = 'blur(6px) saturate(1.15)'
      element.style.boxShadow = '0 0 30px rgba(250,204,21,0.22), 0 0 80px rgba(250,204,21,0.12)'
    }
    // Update transition duration for this animation
    if (intent === 'skip') {
      element.style.transition = `transform ${exitMs}ms ease, opacity ${exitMs}ms ease, filter ${exitMs}ms ease, box-shadow ${exitMs}ms ease`
    } else {
      element.style.transition = `transform ${exitMs}ms ease, opacity ${exitMs}ms ease`
    }

    // Wait for animation to complete
    await new Promise((resolve) => setTimeout(resolve, exitMs))

    // Commit answer AFTER animation (existing logic)
    if (intent === 'skip') {
      commitSkip()
    } else {
      commitChoice(intent)
    }

    // Reset visuals for next card after commit (use requestAnimationFrame to ensure DOM update)
    // Use the same element reference we animated, not cardRef.current (which may have changed)
    requestAnimationFrame(() => {
      if (element) {
        // Clear transition and reset transform/opacity/filter/boxShadow
        element.style.transition = 'none'
        element.style.transform = 'translate(0px, 0px) rotate(0deg) scale(1)'
        element.style.opacity = '1'
        element.style.filter = 'none'
        element.style.boxShadow = 'none'
      }
      // Reset dragUI after commit/reset so next card never inherits tint/badge
      setDragUI({ x: 0, p: 0, dir: 'none' })
      // Clear FX state after reset completes
      setFx({ intent: null, ms: 0, key: Date.now() })
      // Clear UI intent and press glow
      setUiIntent(null)
      setPressGlow(null)
    })

    // Reset animation state
    setIsAnimating(false)
    setExitMode(null)
    setExitIntent(null)
    setUiIntent(null)

    // Unlock on next tick
    setTimeout(() => {
      lockRef.current = false
    }, 0)
  }

  const commitChoice = (answer: 'yes' | 'no') => {
    if (!runState || !currentStatement || isAdvancingRef.current) return

    // Check if we've reached max rounds BEFORE updating state
    if (runState.round >= MAX_ROUNDS) {
      const baseMs = 700
      const fxMs = reducedMotion ? 180 : baseMs
      startFinishTransition(fxMs)
      return
    }

    // Set guard to prevent double-commit
    isAdvancingRef.current = true

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
      [laneId]: newRating,
    }

    const historyEntry: HistoryEntry = {
      statement_id: currentStatement.id,
      lane_id: laneId,
      answer,
      timestamp_iso: new Date().toISOString(),
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

    // Update presented_statement_ids: add current statement if not already present
    const presentedIds = [...(runState.presented_statement_ids || [])]
    if (!presentedIds.includes(currentStatement.id)) {
      presentedIds.push(currentStatement.id)
    }

    // Check if this will exceed max rounds BEFORE updating state
    if (newRound > MAX_ROUNDS) {
      // Final answer - commit to history but route with finish transition
      const finalState: RunState = {
        ...runState,
        round: newRound,
        lane_ratings: updatedRatings,
        history: [...runState.history, historyEntry],
        seen_statement_ids: seenIds,
        lane_counts_shown: laneCounts,
        answer_counts: answerCounts,
        current_statement_id: null,
        presented_statement_ids: presentedIds,
      }
      setRunState(finalState)
      saveRunState(finalState)
      isAdvancingRef.current = false
      const baseMs = 700
      const fxMs = reducedMotion ? 180 : baseMs
      startFinishTransition(fxMs)
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
      current_statement_id: null, // Clear current to select next
      presented_statement_ids: presentedIds,
    }

    const nextStatement = getNextStatement(statements, tempState)

    // If no next statement available, route to results
    if (!nextStatement) {
      const finalState: RunState = {
        ...tempState,
        current_statement_id: null,
      }
      setRunState(finalState)
      saveRunState(finalState)
      isAdvancingRef.current = false
      const baseMs = 700
      const fxMs = reducedMotion ? 180 : baseMs
      startFinishTransition(fxMs)
      return
    }

    // Add next statement to presented stack
    const updatedPresentedIds = [...presentedIds, nextStatement.id]

    const updatedState: RunState = {
      ...tempState,
      current_statement_id: nextStatement.id,
      presented_statement_ids: updatedPresentedIds,
    }

    setRunState(updatedState)
    saveRunState(updatedState)

    // Reset drag state and clear guard
    setDragState({
      isDragging: false,
      startX: 0,
      currentX: 0,
    })
    isAdvancingRef.current = false // Clear guard after state update

    // Check for early finish (max rounds already checked above)
    if (canFinishEarly(updatedState)) {
      router.push('/results')
    }
    // else: current_statement_id already set, card will render
  }

  // Meh logic: advances game without changing lane_ratings
  const commitMeh = () => {
    if (!runState || isAnimating || !currentStatement || isAdvancingRef.current) return

    // Check if we've reached max rounds BEFORE updating state
    if (runState.round >= MAX_ROUNDS) {
      const baseMs = 700
      const fxMs = reducedMotion ? 180 : baseMs
      startFinishTransition(fxMs)
      return
    }

    // Set guard to prevent double-commit
    isAdvancingRef.current = true

    const laneId = currentStatement.lane_id

    // DO NOT update lane_ratings for meh
    const historyEntry: HistoryEntry = {
      statement_id: currentStatement.id,
      lane_id: laneId,
      answer: 'meh',
      timestamp_iso: new Date().toISOString(),
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

    // Update presented_statement_ids: add current statement if not already present
    const presentedIds = [...(runState.presented_statement_ids || [])]
    if (!presentedIds.includes(currentStatement.id)) {
      presentedIds.push(currentStatement.id)
    }

    const newRound = runState.round + 1

    // Check if this will exceed max rounds BEFORE updating state
    if (newRound > MAX_ROUNDS) {
      // Final answer - commit to history but route with finish transition
      const finalState: RunState = {
        ...runState,
        round: newRound,
        // lane_ratings unchanged
        history: [...runState.history, historyEntry],
        seen_statement_ids: seenIds,
        lane_counts_shown: laneCounts,
        answer_counts: answerCounts,
        current_statement_id: null,
        presented_statement_ids: presentedIds,
      }
      setRunState(finalState)
      saveRunState(finalState)
      isAdvancingRef.current = false
      const baseMs = 700
      const fxMs = reducedMotion ? 180 : baseMs
      startFinishTransition(fxMs)
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
      current_statement_id: null, // Clear current to select next
      presented_statement_ids: presentedIds,
    }

    const nextStatement = getNextStatement(statements, tempState)

    // If no next statement available, route to results
    if (!nextStatement) {
      const finalState: RunState = {
        ...tempState,
        current_statement_id: null,
      }
      setRunState(finalState)
      saveRunState(finalState)
      isAdvancingRef.current = false
      const baseMs = 700
      const fxMs = reducedMotion ? 180 : baseMs
      startFinishTransition(fxMs)
      return
    }

    // Add next statement to presented stack
    const updatedPresentedIds = [...presentedIds, nextStatement.id]

    const updatedState: RunState = {
      ...tempState,
      current_statement_id: nextStatement.id,
      presented_statement_ids: updatedPresentedIds,
    }

    setRunState(updatedState)
    saveRunState(updatedState)

    // Reset drag state and clear guard
    setDragState({
      isDragging: false,
      startX: 0,
      currentX: 0,
    })
    isAdvancingRef.current = false // Clear guard after state update

    // Check for early finish (max rounds already checked above)
    if (canFinishEarly(updatedState)) {
      router.push('/results')
    }
    // else: current_statement_id already set, card will render
  }

  // Skip logic: advances game without changing lane_ratings
  const commitSkip = () => {
    if (!runState || !currentStatement || isAdvancingRef.current) return

    // Check if we've reached max rounds BEFORE updating state
    if (runState.round >= MAX_ROUNDS) {
      const baseMs = 700
      const fxMs = reducedMotion ? 180 : baseMs
      startFinishTransition(fxMs)
      return
    }

    // Set guard to prevent double-commit
    isAdvancingRef.current = true

    const laneId = currentStatement.lane_id

    // DO NOT update lane_ratings for skip
    const historyEntry: HistoryEntry = {
      statement_id: currentStatement.id,
      lane_id: laneId,
      answer: 'skip',
      timestamp_iso: new Date().toISOString(),
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

    // Update presented_statement_ids: add current statement if not already present
    const presentedIds = [...(runState.presented_statement_ids || [])]
    if (!presentedIds.includes(currentStatement.id)) {
      presentedIds.push(currentStatement.id)
    }

    const newRound = runState.round + 1

    // Check if this will exceed max rounds BEFORE updating state
    if (newRound > MAX_ROUNDS) {
      // Final answer - commit to history but route with finish transition
      const finalState: RunState = {
        ...runState,
        round: newRound,
        // lane_ratings unchanged
        history: [...runState.history, historyEntry],
        seen_statement_ids: seenIds,
        lane_counts_shown: laneCounts,
        answer_counts: answerCounts,
        current_statement_id: null,
        presented_statement_ids: presentedIds,
      }
      setRunState(finalState)
      saveRunState(finalState)
      isAdvancingRef.current = false
      const baseMs = 700
      const fxMs = reducedMotion ? 180 : baseMs
      startFinishTransition(fxMs)
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
      current_statement_id: null, // Clear current to select next
      presented_statement_ids: presentedIds,
    }

    const nextStatement = getNextStatement(statements, tempState)

    // If no next statement available, route to results
    if (!nextStatement) {
      const finalState: RunState = {
        ...tempState,
        current_statement_id: null,
      }
      setRunState(finalState)
      saveRunState(finalState)
      isAdvancingRef.current = false
      const baseMs = 700
      const fxMs = reducedMotion ? 180 : baseMs
      startFinishTransition(fxMs)
      return
    }

    // Add next statement to presented stack
    const updatedPresentedIds = [...presentedIds, nextStatement.id]

    const updatedState: RunState = {
      ...tempState,
      current_statement_id: nextStatement.id,
      presented_statement_ids: updatedPresentedIds,
    }

    setRunState(updatedState)
    saveRunState(updatedState)

    // Reset drag state and clear guard
    setDragState({
      isDragging: false,
      startX: 0,
      currentX: 0,
    })
    isAdvancingRef.current = false // Clear guard after state update

    // Check for early finish (max rounds already checked above)
    if (canFinishEarly(updatedState)) {
      router.push('/results')
    }
    // else: current_statement_id already set, card will render
  }

  // Undo logic: restore previous state using deterministic stack replay
  const handleUndo = () => {
    if (!runState || isAnimating) return

    const presentedIds = runState.presented_statement_ids || []

    // If presented stack has <= 1 item, nothing to undo
    if (presentedIds.length <= 1) return

    // Pop the last presented id
    const newPresentedIds = presentedIds.slice(0, -1)
    const previousStatementId = newPresentedIds[newPresentedIds.length - 1] || null

    // Remove the last history entry
    const newHistory = runState.history.slice(0, -1)

    // Rebuild lane_ratings by replaying history from baseline
    const rebuiltRatings = rebuildLaneRatingsFromHistory(newHistory)

    // Rebuild derived fields
    const rebuiltState: RunState = {
      ...runState,
      round: Math.max(1, runState.round - 1),
      lane_ratings: rebuiltRatings,
      history: newHistory,
      current_statement_id: previousStatementId,
      presented_statement_ids: newPresentedIds,
    }

    const finalState = rebuildDerivedFields(rebuiltState)

    setRunState(finalState)
    saveRunState(finalState)
  }

  // Swipe handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isAnimating) return
    const clientX = e.clientX || (e as any).touches?.[0]?.clientX || 0
    const clientY = e.clientY || (e as any).touches?.[0]?.clientY || 0
    setDragState({
      isDragging: true,
      startX: clientX,
      currentX: clientX,
    })
    // Track tap start for peek detection
    tapStartRef.current = {
      x: clientX,
      y: clientY,
      time: Date.now(),
    }
    const element = cardRef.current
    if (element) {
      // Disable transitions during drag for direct feel
      element.style.transition = 'none'
      element.setPointerCapture(e.pointerId)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.isDragging || isAnimating) return
    const clientX = e.clientX || (e as any).touches?.[0]?.clientX || 0
    setDragState((prev) => ({
      ...prev,
      currentX: clientX,
    }))

    // Update dragXRef for drag UI
    const deltaX = clientX - dragState.startX
    dragXRef.current = deltaX

    // Throttle drag UI updates with RAF
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        const x = dragXRef.current
        const p = Math.min(Math.max(Math.abs(x) / SWIPE_THRESHOLD, 0), 1)
        const dir: 'left' | 'right' | 'none' = x > 0 ? 'right' : x < 0 ? 'left' : 'none'
        setDragUI({ x, p, dir })
        rafRef.current = null
      })
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragState.isDragging || isAnimating) return

    const deltaX = dragState.currentX - dragState.startX
    const element = cardRef.current

    if (element) {
      try {
        element.releasePointerCapture(e.pointerId)
      } catch {
        // Ignore errors if pointer capture was already released
      }
    }

    // Check if swipe threshold is met
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      // Swipe right = YES, swipe left = NO
      const intent: 'yes' | 'no' = deltaX > 0 ? 'yes' : 'no'
      tapStartRef.current = null // Clear tap tracking on swipe
      // Reset drag state before animation
      setDragState({
        isDragging: false,
        startX: 0,
        currentX: 0,
      })
      setDragUI({ x: 0, p: 0, dir: 'none' })
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      performSwipe(intent, 'gesture')
      return
    } else {
      // Check if this was a tap (not a swipe)
      const tapStart = tapStartRef.current
      if (tapStart) {
        const clientX = e.clientX || (e as any).changedTouches?.[0]?.clientX || 0
        const clientY = e.clientY || (e as any).changedTouches?.[0]?.clientY || 0
        const deltaX = Math.abs(clientX - tapStart.x)
        const deltaY = Math.abs(clientY - tapStart.y)
        const deltaTime = Date.now() - tapStart.time
        const TAP_THRESHOLD = 18 // pixels
        const TAP_TIME_THRESHOLD = 450 // ms

        // If movement is small and time is short, treat as tap
        if (deltaX < TAP_THRESHOLD && deltaY < TAP_THRESHOLD && deltaTime < TAP_TIME_THRESHOLD) {
          // Toggle peek if statement has peek data
          if (currentStatement && (currentStatement.roles || currentStatement.example)) {
            setIsPeekOpen((prev) => !prev)
          }
        }
        tapStartRef.current = null
      }

      // Reset position if threshold not met
      setDragState({
        isDragging: false,
        startX: 0,
        currentX: 0,
      })
      setDragUI({ x: 0, p: 0, dir: 'none' })
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
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
  const subtleProgress = progress < 0.6 ? progressCubed : 0.216 + (progress - 0.6) * 0.784 // Smooth transition at 60%

  // Fill opacity with non-linear ramp
  const fillOpacity =
    FILL_OPACITY_BASE +
    FILL_OPACITY_RAMP * subtleProgress +
    (end > 0 ? FILL_OPACITY_END_BOOST * endSquared : 0)

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
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* Ambient lane glow (behind card stack) */}
      {glow && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.9,
            filter: 'blur(75px)',
            background: `radial-gradient(circle at 50% 40%, ${glow.a}, transparent 60%), radial-gradient(circle at 20% 80%, ${glow.b}, transparent 55%)`,
            transition: reducedMotion ? 'none' : 'opacity 300ms ease, background 300ms ease',
          }}
        />
      )}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '8px',
          }}
        >
          {/* Undo button */}
          <button
            onClick={handleUndo}
            disabled={(runState?.presented_statement_ids?.length || 0) <= 1 || isAnimating}
            style={{
              padding: '6px 12px',
              fontSize: '0.85rem',
              fontWeight: '500',
              backgroundColor:
                (runState?.presented_statement_ids?.length || 0) > 1 && !isAnimating
                  ? '#666'
                  : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor:
                (runState?.presented_statement_ids?.length || 0) > 1 && !isAnimating
                  ? 'pointer'
                  : 'not-allowed',
              transition: 'background-color 0.2s',
              opacity:
                (runState?.presented_statement_ids?.length || 0) > 1 && !isAnimating ? 1 : 0.5,
            }}
            onMouseOver={(e) => {
              if ((runState?.presented_statement_ids?.length || 0) > 1 && !isAnimating) {
                e.currentTarget.style.backgroundColor = '#555'
              }
            }}
            onMouseOut={(e) => {
              if ((runState?.presented_statement_ids?.length || 0) > 1 && !isAnimating) {
                e.currentTarget.style.backgroundColor = '#666'
              }
            }}
          >
            Undo
          </button>
          <div
            style={{
              fontSize: '1.2rem',
              fontWeight: '600',
            }}
          >
            Swipe {runState.round} / {runState.max_rounds}
          </div>
          {/* Spacer for symmetry */}
          <div style={{ width: '60px' }} />
        </div>
        {/* Progress bar */}
        <div
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e5e7eb',
            borderRadius: '9999px',
            overflow: 'hidden',
            marginTop: '8px',
          }}
        >
          <div
            style={{
              width: `${(runState.round / runState.max_rounds) * 100}%`,
              height: '100%',
              backgroundColor: '#111827',
              borderRadius: '9999px',
              transition: 'width 200ms ease',
            }}
          />
        </div>
        {/* Keyboard shortcuts hint + Sound toggle (desktop only) */}
        <div
          className="hidden md:flex"
          style={{
            fontSize: '0.75rem',
            color: '#9ca3af',
            textAlign: 'center',
            marginTop: '8px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span>Keys: Y / N / S • Undo: U</span>
          <button
            onClick={() => {
              const newState = !soundEnabled
              setSoundEnabled(newState)
              setSoundEnabledState(newState)
              track('sfx_toggled', { on: newState })
            }}
            style={{
              fontSize: '0.75rem',
              color: '#9ca3af',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '2px 4px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#6b7280'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#9ca3af'
            }}
          >
            Sound: {soundEnabled ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {/* Card Stack Container */}
      <div
        style={{
          position: 'relative',
          width: '92vw',
          maxWidth: `${CARD_MAX_WIDTH}px`,
          aspectRatio: '1 / 1',
          alignSelf: 'center',
        }}
      >
        {/* Ambient lane glow (behind card stack) */}
        {glow && (
          <div
            style={{
              position: 'absolute',
              inset: '-40px',
              borderRadius: '16px',
              pointerEvents: 'none',
              zIndex: 0,
              background: `radial-gradient(circle at 50% 40%, ${glow.a}, transparent 60%), radial-gradient(circle at 20% 80%, ${glow.b}, transparent 55%)`,
              opacity: 0.9,
              filter: 'blur(70px)',
              transition: reducedMotion ? 'none' : 'opacity 300ms ease, background 300ms ease',
            }}
          />
        )}
        {/* SKIP shimmer + sparkle overlay (outside fading card, on stack container) */}
        {fx.intent === 'skip' && isAnimating && (
          <div
            key={fx.key}
            className="skipFxWrap"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '16px',
              pointerEvents: 'none',
              zIndex: 50,
              overflow: 'hidden',
              ['--fx-ms' as any]: `${fx.ms}ms`,
            }}
          >
            {/* Gold radial glow */}
            <div
              className="skipFxGlow"
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at 50% 40%, rgba(250,204,21,0.22), transparent 62%)',
                opacity: 1,
                transition: reducedMotion ? 'opacity 120ms ease' : 'none',
              }}
            />
            {/* Shimmer sweep (only if not reduced motion) */}
            {!reducedMotion && (
              <div
                className="skipFxShimmer"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(115deg,
                    transparent 0%,
                    rgba(250,204,21,0.00) 35%,
                    rgba(250,204,21,0.35) 50%,
                    rgba(250,204,21,0.00) 65%,
                    transparent 100%)`,
                  filter: 'blur(1px)',
                  mixBlendMode: 'screen',
                }}
              />
            )}
            {/* Subtle sparkle noise (only if not reduced motion) */}
            {!reducedMotion && (
              <div
                className="skipFxSparkle"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'radial-gradient(rgba(250,204,21,0.35) 1px, transparent 1px)',
                  backgroundSize: '18px 18px',
                  opacity: 0.18,
                }}
              />
            )}
          </div>
        )}

        {/* Back Card (visual stack, no interaction) */}
        <div
          aria-hidden="true"
          role="presentation"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.06)',
            background: 'linear-gradient(180deg, #ffffff, #f9fafb)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            pointerEvents: 'none',
            zIndex: 1,
            // Animate scale and translateY based on drag progress
            // translateY: 10px → 6px, scale: 0.985 → 0.995 as dragUI.p increases
            transform: `translateY(${10 - dragUI.p * 4}px) scale(${0.985 + dragUI.p * 0.01})`,
            transition: dragState.isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
        />

        {/* Statement Card (active, interactive) */}
        <div
          ref={cardRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={(e) => {
            // Reset dragUI on cancel
            setDragUI({ x: 0, p: 0, dir: 'none' })
            if (rafRef.current !== null) {
              cancelAnimationFrame(rafRef.current)
              rafRef.current = null
            }
            handlePointerUp(e)
          }}
          className={styles.swipeCard}
          style={{
            padding: '32px',
            backgroundColor: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            cursor: isAnimating ? 'default' : 'grab',
            touchAction: 'none',
            aspectRatio: '1 / 1',
            maxWidth: `${CARD_MAX_WIDTH}px`,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            zIndex: 2,
            // Premium depth shadow + lift (only when not exiting)
            ...(isAnimating
              ? {
                  boxShadow:
                    dragState.isDragging && end > 0
                      ? `0 4px 12px rgba(0,0,0,0.15), 0 0 0 ${strokePx}px ${strokeColor}, 0 0 ${glowPx}px ${glowColor}`
                      : '0 4px 12px rgba(0,0,0,0.15)',
                  transform: dragState.isDragging
                    ? `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`
                    : undefined,
                }
              : {
                  // Shadow and lift based on drag progress
                  boxShadow: (() => {
                    const p = dragUI.p
                    const baseShadow = `0 ${8 + p * 8}px ${24 + p * 24}px rgba(0,0,0,${0.1 + p * 0.06})`
                    if (dragState.isDragging && end > 0) {
                      return `${baseShadow}, 0 0 0 ${strokePx}px ${strokeColor}, 0 0 ${glowPx}px ${glowColor}`
                    }
                    return baseShadow
                  })(),
                  transform: dragState.isDragging
                    ? `translateX(${deltaX}px) translateY(${-(dragUI.p * 2)}px) rotate(${deltaX * 0.1}deg)`
                    : undefined,
                }),
            transition: dragState.isDragging
              ? 'none' // No transition during drag for direct feel
              : isAnimating
                ? undefined // performSwipe sets transition duration via inline style
                : 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
            opacity: isAnimating && exitMode === 'skip' ? 0 : 1,
            filter: isAnimating && exitMode === 'skip' ? 'blur(4px)' : 'none',
          }}
        >
          {/* Directional edge-to-edge fill overlay */}
          {dragState.isDragging && progress > 0 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                pointerEvents: 'none',
                zIndex: 1,
                opacity: fillOpacity,
                background: fillGradient,
                clipPath: clipPath,
                transition: dragState.isDragging
                  ? 'none'
                  : 'opacity 0.2s ease, clip-path 0.2s ease',
              }}
            />
          )}

          {/* Unified intent UI (drag OR tap OR exiting) */}
          {(() => {
            // Derive unified intent and strength
            const derivedIntent: null | SwipeIntent = isAnimating
              ? (exitMode as SwipeIntent)
              : dragState.isDragging
                ? dragUI.dir === 'right'
                  ? 'yes'
                  : dragUI.dir === 'left'
                    ? 'no'
                    : null
                : uiIntent

            const strength = isAnimating ? 1 : dragState.isDragging ? dragUI.p : uiIntent ? 1 : 0

            // Only show if there's an intent (not during SKIP exit, handled by gold FX)
            if (!derivedIntent || derivedIntent === 'skip') return null

            // Make opacity noticeable
            const tintOpacity = Math.min(0.18, strength * 0.18)

            return (
              <>
                {/* YES badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: 'white',
                    backgroundColor: 'rgba(34, 197, 94, 0.9)',
                    borderRadius: '9999px',
                    pointerEvents: 'none',
                    zIndex: 5,
                    opacity: derivedIntent === 'yes' ? strength : 0,
                    transform: `scale(${0.96 + 0.04 * strength})`,
                    transition: 'opacity 0.1s ease, transform 0.1s ease',
                  }}
                >
                  YES
                </div>
                {/* NO badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: 'white',
                    backgroundColor: 'rgba(239, 68, 68, 0.9)',
                    borderRadius: '9999px',
                    pointerEvents: 'none',
                    zIndex: 5,
                    opacity: derivedIntent === 'no' ? strength : 0,
                    transform: `scale(${0.96 + 0.04 * strength})`,
                    transition: 'opacity 0.1s ease, transform 0.1s ease',
                  }}
                >
                  NO
                </div>
                {/* Intent tint overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                    zIndex: 3,
                    backgroundColor:
                      derivedIntent === 'yes'
                        ? 'rgba(34, 197, 94, 0.1)'
                        : derivedIntent === 'no'
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'transparent',
                    opacity: tintOpacity,
                    transition: 'opacity 0.1s ease, background-color 0.1s ease',
                  }}
                />
              </>
            )
          })()}

          {/* Intent color overlay during exit */}
          {isAnimating && exitIntent && (
            <>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'inherit',
                  pointerEvents: 'none',
                  zIndex: 4,
                  backgroundColor:
                    exitIntent === 'yes'
                      ? 'rgba(76, 175, 80, 0.1)'
                      : exitIntent === 'no'
                        ? 'rgba(244, 67, 54, 0.1)'
                        : 'rgba(158, 158, 158, 0.1)',
                  transition: `opacity ${EXIT_MS_BUTTON}ms ease`,
                  opacity: 1,
                }}
              />
              {/* SKIP gold radial overlay */}
              {exitIntent === 'skip' && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                    zIndex: 4,
                    background:
                      'radial-gradient(circle at 50% 40%, rgba(250,204,21,0.18), transparent 60%)',
                    transition: `opacity ${EXIT_MS_BUTTON}ms ease`,
                    opacity: 1,
                  }}
                />
              )}
            </>
          )}

          {/* Intent color overlay during exit */}
          {isAnimating && exitIntent && (
            <>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'inherit',
                  pointerEvents: 'none',
                  zIndex: 4,
                  backgroundColor:
                    exitIntent === 'yes'
                      ? 'rgba(76, 175, 80, 0.1)'
                      : exitIntent === 'no'
                        ? 'rgba(244, 67, 54, 0.1)'
                        : 'rgba(158, 158, 158, 0.1)',
                  transition: `opacity ${EXIT_MS_BUTTON}ms ease`,
                  opacity: 1,
                }}
              />
            </>
          )}

          <p
            style={{
              fontSize: '1.4rem',
              fontWeight: '500',
              lineHeight: '1.6',
              textAlign: 'center',
              color: '#333',
              position: 'relative',
              zIndex: 3,
            }}
          >
            {currentStatement.text}
          </p>

          {/* Peek details section */}
          {isPeekOpen && (currentStatement.roles || currentStatement.example) && (
            <div
              style={{
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid #e0e0e0',
                position: 'relative',
                zIndex: 3,
                width: '100%',
              }}
            >
              {currentStatement.roles && currentStatement.roles.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: '#666',
                      marginBottom: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Roles:
                  </div>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      fontSize: '0.95rem',
                      color: '#333',
                    }}
                  >
                    {currentStatement.roles.map((role, idx) => (
                      <li
                        key={idx}
                        style={{
                          marginBottom: '4px',
                          paddingLeft: '16px',
                          position: 'relative',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            left: 0,
                            color: '#999',
                          }}
                        >
                          •
                        </span>
                        {role}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {currentStatement.example && (
                <div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: '#666',
                      marginBottom: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Example:
                  </div>
                  <p
                    style={{
                      fontSize: '0.95rem',
                      color: '#333',
                      lineHeight: '1.5',
                      margin: 0,
                    }}
                  >
                    {currentStatement.example}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Clickable Details affordance */}
          {currentStatement && (currentStatement.roles || currentStatement.example) && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsPeekOpen((prev) => !prev)
              }}
              style={{
                marginTop: '16px',
                padding: '8px 12px',
                fontSize: '0.85rem',
                color: '#666',
                backgroundColor: 'transparent',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                position: 'relative',
                zIndex: 3,
                transition: 'all 0.2s',
                width: 'auto',
                alignSelf: 'center',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5'
                e.currentTarget.style.borderColor = '#999'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = '#e0e0e0'
              }}
            >
              <span style={{ fontSize: '1rem' }}>ⓘ</span>
              <span>{isPeekOpen ? 'Hide details' : 'Details'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Yes/No/Skip buttons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginTop: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => {
              if (!dragState.isDragging && !lockRef.current) {
                setPressGlow('no')
                setTimeout(() => setPressGlow(null), 150)
                performSwipe('no', 'button')
              }
            }}
            disabled={isAnimating || lockRef.current}
            style={{
              padding: '16px 32px',
              fontSize: '1.1rem',
              fontWeight: '600',
              background: 'linear-gradient(180deg, #f44336, #d32f2f)',
              color: 'white',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '12px',
              cursor: isAnimating ? 'default' : 'pointer',
              transition: 'all 0.15s ease',
              flex: 1,
              maxWidth: '150px',
              outline: pressGlow === 'no' ? '2px solid rgba(239, 68, 68, 0.6)' : 'none',
              outlineOffset: pressGlow === 'no' ? '2px' : '0',
              boxShadow:
                pressGlow === 'no'
                  ? '0 0 0 4px rgba(239, 68, 68, 0.2), inset 0 1px 2px rgba(255,255,255,0.2)'
                  : 'inset 0 1px 2px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.1)',
              transform: pressGlow === 'no' ? 'scale(0.985)' : 'scale(1)',
            }}
            onMouseOver={(e) => {
              if (!isAnimating)
                e.currentTarget.style.background = 'linear-gradient(180deg, #d32f2f, #b71c1c)'
            }}
            onMouseOut={(e) => {
              if (!isAnimating)
                e.currentTarget.style.background = 'linear-gradient(180deg, #f44336, #d32f2f)'
            }}
          >
            NO
          </button>
          <button
            onClick={() => {
              if (!dragState.isDragging && !lockRef.current) {
                setPressGlow('yes')
                setTimeout(() => setPressGlow(null), 150)
                performSwipe('yes', 'button')
              }
            }}
            disabled={isAnimating || lockRef.current}
            style={{
              padding: '16px 32px',
              fontSize: '1.1rem',
              fontWeight: '600',
              background: 'linear-gradient(180deg, #4CAF50, #45a049)',
              color: 'white',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '12px',
              cursor: isAnimating ? 'default' : 'pointer',
              transition: 'all 0.15s ease',
              flex: 1,
              maxWidth: '150px',
              outline: pressGlow === 'yes' ? '2px solid rgba(34, 197, 94, 0.6)' : 'none',
              outlineOffset: pressGlow === 'yes' ? '2px' : '0',
              boxShadow:
                pressGlow === 'yes'
                  ? '0 0 0 4px rgba(34, 197, 94, 0.2), inset 0 1px 2px rgba(255,255,255,0.2)'
                  : 'inset 0 1px 2px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.1)',
              transform: pressGlow === 'yes' ? 'scale(0.985)' : 'scale(1)',
            }}
            onMouseOver={(e) => {
              if (!isAnimating)
                e.currentTarget.style.background = 'linear-gradient(180deg, #45a049, #388e3c)'
            }}
            onMouseOut={(e) => {
              if (!isAnimating)
                e.currentTarget.style.background = 'linear-gradient(180deg, #4CAF50, #45a049)'
            }}
          >
            YES
          </button>
        </div>
        <button
          onClick={() => {
            if (!dragState.isDragging && !lockRef.current) {
              setPressGlow('skip')
              setTimeout(() => setPressGlow(null), 150)
              performSwipe('skip', 'button')
            }
          }}
          disabled={isAnimating || lockRef.current}
          style={{
            padding: '12px 24px',
            fontSize: '0.95rem',
            fontWeight: '500',
            background: 'linear-gradient(180deg, #9e9e9e, #757575)',
            color: 'white',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '12px',
            cursor: isAnimating ? 'default' : 'pointer',
            transition: 'all 0.15s ease',
            alignSelf: 'center',
            maxWidth: '200px',
            outline: pressGlow === 'skip' ? '2px solid rgba(250, 204, 21, 0.6)' : 'none',
            outlineOffset: pressGlow === 'skip' ? '2px' : '0',
            boxShadow:
              pressGlow === 'skip'
                ? '0 0 0 4px rgba(250, 204, 21, 0.22), inset 0 1px 2px rgba(255,255,255,0.2)'
                : 'inset 0 1px 2px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.1)',
            transform: pressGlow === 'skip' ? 'scale(0.985)' : 'scale(1)',
          }}
          onMouseOver={(e) => {
            if (!isAnimating)
              e.currentTarget.style.background = 'linear-gradient(180deg, #757575, #616161)'
          }}
          onMouseOut={(e) => {
            if (!isAnimating)
              e.currentTarget.style.background = 'linear-gradient(180deg, #9e9e9e, #757575)'
          }}
        >
          Skip
        </button>
      </div>

      <div
        style={{
          fontSize: '0.9rem',
          color: '#999',
          textAlign: 'center',
          marginTop: '1rem',
        }}
      >
        Swipe right for YES, left for NO
      </div>

      {/* Dev Panel */}
      <DevPanel runState={runState} />

      {/* Editorial completion celebration overlay */}
      {finishFx.on && (
        <div
          key={finishFx.key}
          className="editorialFinishWrap"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            pointerEvents: 'none',
            ['--fx-ms' as any]: `${finishFx.ms}ms`,
          }}
        >
          {/* Paper fade */}
          <div className="editorialFinishPaper" style={{ position: 'absolute', inset: 0 }} />

          {/* Hairline sweep (skip if reduced motion) */}
          {!reducedMotion && (
            <div
              className="editorialFinishHairline"
              style={{
                position: 'absolute',
                left: '-20%',
                top: '40%',
                width: '140%',
                height: '2px',
              }}
            />
          )}

          {/* Subtle grain (optional, very low) */}
          {!reducedMotion && (
            <div
              className="editorialFinishGrain"
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27120%27 height=%27120%27%3E%3Cfilter id=%27n%27 x=%270%27 y=%270%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%271%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27120%27 height=%27120%27 filter=%27url(%23n)%27 opacity=%270.35%27/%3E%3C/svg%3E")',
                backgroundSize: '180px 180px',
              }}
            />
          )}
        </div>
      )}
    </main>
  )
}
