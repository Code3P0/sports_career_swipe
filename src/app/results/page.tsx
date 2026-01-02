'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { RunState } from '@/types/schema'
import { getLaneById } from '@/data/lanes'
import { getFiguresByLaneId, type NotableFigure } from '@/data/figures'
import { getStatementById, statements } from '@/data/statements'
import { getActionsByLaneId, type Action } from '@/data/actions'
import { loadSavedActionIds, toggleSavedAction } from '@/lib/savedActions'
import { getTopSignals, getLaneSupportSummary, type TopSignal } from '@/lib/explain'
import { loadRunState, resetRunState, migrateRunState } from '@/lib/state'
import { validateRunState } from '@/lib/invariants'
import { healRunState } from '@/lib/heal'
import { DevPanel } from '@/components/DevPanel'
import { ResultsHero } from '@/components/results/ResultsHero'
import { PlanPanel } from '@/components/results/PlanPanel'
import { ExploreAccordion } from '@/components/results/ExploreAccordion'
import { WhySheet } from '@/components/results/WhySheet'
import { SavedSheet } from '@/components/results/SavedSheet'

/**
 * Confidence thresholds incorporating rating gap and signal quality:
 * Strong: big gap (>= 80) + good signal (skipRate <= 0.35)
 * Medium: moderate gap (>= 40) OR higher skip rate
 * Weak/Exploratory: small gap (< 40) OR very high skip rate (> 0.5)
 */
function getConfidenceLabel(ratingGap: number, skipRate: number): string {
  const hasBigGap = ratingGap >= 80
  const hasModerateGap = ratingGap >= 40
  const hasGoodSignal = skipRate <= 0.35
  const hasVeryHighSkip = skipRate > 0.5
  
  if (hasBigGap && hasGoodSignal) return 'Strong'
  if (hasModerateGap && hasGoodSignal) return 'Medium'
  if (hasVeryHighSkip) return 'Exploratory'
  if (!hasModerateGap) return 'Weak'
  return 'Medium'
}

type ResultsVM = {
  topLane: ReturnType<typeof getLaneById> | null
  runnerUpLane: ReturnType<typeof getLaneById> | null
  confidenceLabel: string
  actions: Action[]
  savedActionIds: string[]
  figuresPreview: NotableFigure[]
  figuresAll: NotableFigure[]
  topSignals: TopSignal[]
  supportSummary: ReturnType<typeof getLaneSupportSummary>
}

export default function ResultsPage() {
  const router = useRouter()
  const [runState, setRunState] = useState<RunState | null>(null)
  const [savedActionIds, setSavedActionIds] = useState<string[]>([])
  const [showPlan, setShowPlan] = useState(false)
  const [whySheetOpen, setWhySheetOpen] = useState(false)
  const [savedSheetOpen, setSavedSheetOpen] = useState(false)
  const firstActionTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const loaded = loadRunState()
    if (loaded) {
      // Validate lane_ratings exist and are valid
      if (!loaded.lane_ratings || Object.keys(loaded.lane_ratings).length === 0) {
        // Migrate or show empty state
        const migrated = migrateRunState(loaded)
        setRunState(migrated)
      } else {
        // Validate and heal in dev
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          const validation = validateRunState(loaded)
          if (!validation.ok || validation.warnings.length > 0) {
            console.warn('[Dev] RunState validation issues:', {
              errors: validation.errors,
              warnings: validation.warnings
            })
            
            // Heal once
            const healed = healRunState(loaded)
            if (healed.healed) {
              console.warn('[Dev] Auto-healed RunState:', healed.notes)
              // Note: We don't save here in results page, just use healed state
              setRunState(healed.rs)
              setSavedActionIds(loadSavedActionIds())
              return
            }
          }
        }
        setRunState(loaded)
      }
    } else {
      // No state - show empty state (don't redirect, let user see empty state)
      setRunState(null)
    }
    
    setSavedActionIds(loadSavedActionIds())
  }, [router])

  const handleReset = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('runState')
    }
    router.push('/play')
  }

  const handleToggleSave = (actionId: string) => {
    const updated = toggleSavedAction(actionId)
    setSavedActionIds(updated)
  }

  const handleCopyPlan = async () => {
    if (!runState) return
    
    const sortedLanes = Object.entries(runState.lane_ratings)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
    const topLaneId = sortedLanes[0]?.[0]
    const runnerUpLaneId = sortedLanes[1]?.[0]
    const topLane = topLaneId ? getLaneById(topLaneId) : null
    const runnerUpLane = runnerUpLaneId ? getLaneById(runnerUpLaneId) : null
    
    if (!topLane) return
    
    const actions = topLaneId ? getActionsByLaneId(topLaneId) : []
    const runnerUpName = runnerUpLane ? runnerUpLane.name : 'N/A'
    
    const answerCounts = runState.answer_counts || { yes: 0, no: 0, skip: 0 }
    const totalAnswers = answerCounts.yes + answerCounts.no + answerCounts.skip
    const skipRate = totalAnswers > 0 ? answerCounts.skip / totalAnswers : 0
    const topRating = sortedLanes[0]?.[1] || 1000
    const runnerUpRating = sortedLanes[1]?.[1] || 1000
    const ratingGap = topRating - runnerUpRating
    const confidenceLabel = getConfidenceLabel(ratingGap, skipRate)
    
    let text = `Career Swipe Results\n\n`
    text += `Top Lane: ${topLane.name}\n`
    text += `Runner-up: ${runnerUpName}\n`
    text += `Confidence: ${confidenceLabel}\n\n`
    text += `Next Actions (15-60 min):\n\n`
    
    actions.forEach((action, idx) => {
      const saved = savedActionIds.includes(action.id)
      text += `${idx + 1}. ${action.title} (${action.minutes} min)${saved ? ' [Saved]' : ''}\n`
      text += `   ${action.description}\n`
      text += `   Deliverable: ${action.deliverable}\n\n`
    })
    
    if (runnerUpLane) {
      text += `If you're between lanes:\n`
      text += `Consider a hybrid mini-project combining ${topLane.name} and ${runnerUpLane.name}—for example, creating a content series that drives community engagement while measuring growth metrics.\n`
    }
    
    try {
      await navigator.clipboard.writeText(text)
      alert('Plan copied to clipboard!')
    } catch (e) {
      console.error('Failed to copy:', e)
      alert('Failed to copy. Please try again.')
    }
  }

  const handleStartPlan = () => {
    if (firstActionTimeRef.current === null) {
      firstActionTimeRef.current = Date.now()
      const timeToFirstAction = firstActionTimeRef.current - (performance.timing?.navigationStart || Date.now())
      console.log(`time_to_first_primary_action_ms: ${timeToFirstAction}`)
    }
    setShowPlan(true)
  }

  const handleExploreMap = () => {
    const sortedLanes = Object.entries(runState?.lane_ratings || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 1)
    const topLaneId = sortedLanes[0]?.[0]
    if (topLaneId) {
      router.push(`/map?focus=${topLaneId}`)
    } else {
      router.push('/map')
    }
  }

  if (!runState) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">No results yet</h1>
            <p className="text-gray-600 mb-6">Complete a run to see your results.</p>
            <button
              onClick={() => router.push('/play')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Start a run
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Compute ResultsVM
  const sortedLanes = Object.entries(runState.lane_ratings)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)

  const topLaneId = sortedLanes[0]?.[0]
  const runnerUpLaneId = sortedLanes[1]?.[0]
  const topRating = sortedLanes[0]?.[1] || 1000
  const runnerUpRating = sortedLanes[1]?.[1] || 1000
  const ratingGap = topRating - runnerUpRating

  const topLane = topLaneId ? getLaneById(topLaneId) : null
  const runnerUpLane = runnerUpLaneId ? getLaneById(runnerUpLaneId) : null

  const allFigures = topLaneId ? getFiguresByLaneId(topLaneId) : []
  const figuresPreview = allFigures.slice(0, 2)

  const answerCounts = runState.answer_counts || { yes: 0, no: 0, skip: 0 }
  const totalAnswers = answerCounts.yes + answerCounts.no + answerCounts.skip
  const skipRate = totalAnswers > 0 ? answerCounts.skip / totalAnswers : 0
  const confidenceLabel = getConfidenceLabel(ratingGap, skipRate)

  const actions = topLaneId ? getActionsByLaneId(topLaneId) : []

  const statementsById = new Map(statements.map(s => [s.id, s]))
  const topSignals = topLaneId
    ? getTopSignals(runState, statementsById, topLaneId, 3)
    : []
  const supportSummary = topLaneId
    ? getLaneSupportSummary(runState, topLaneId)
    : { yesCount: 0, noCount: 0, skipCount: 0, totalCount: 0 }

  const savedActions = actions.filter(action => savedActionIds.includes(action.id))

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Above the fold */}
        <ResultsHero
          topLane={topLane || null}
          runnerUpLane={runnerUpLane || null}
          confidenceLabel={confidenceLabel}
          onStartPlan={handleStartPlan}
          onExploreMap={handleExploreMap}
          onWhyClick={() => setWhySheetOpen(true)}
        />

        {/* Plan mode (default when user taps "Start my 3-step plan") */}
        {showPlan && (
          <PlanPanel
            actions={actions}
            savedActionIds={savedActionIds}
            onToggleSave={handleToggleSave}
            onCopyPlan={handleCopyPlan}
            onShowSaved={() => setSavedSheetOpen(true)}
          />
        )}

        {/* Explore accordion (collapsed by default) */}
        {showPlan && (
          <ExploreAccordion figures={allFigures} />
        )}

        {/* Start New Run button (always visible at bottom) */}
        <button
          onClick={handleReset}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 mt-8"
        >
          Start New Run
        </button>
      </div>

      {/* Bottom sheets */}
      <WhySheet
        isOpen={whySheetOpen}
        onClose={() => setWhySheetOpen(false)}
        topSignals={topSignals}
        supportSummary={supportSummary}
        topLaneName={topLane?.name || ''}
      />

      <SavedSheet
        isOpen={savedSheetOpen}
        onClose={() => setSavedSheetOpen(false)}
        savedActions={savedActions}
      />

      {/* Dev Panel */}
      <DevPanel runState={runState} />
    </main>
  )
}
