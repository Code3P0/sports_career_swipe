'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { RunState } from '@/types/schema'
import { getLaneById } from '@/data/lanes'
import { getFiguresByLaneId, type NotableFigure } from '@/data/figures'
import { getStatementById, statements } from '@/data/statements'
import { getActionsByLaneId, type Action } from '@/data/actions'
import { getArtifactForLane } from '@/data/artifacts'
import { getLaneGuide } from '@/data/laneGuides'
import { loadSavedActionIds, toggleSavedAction } from '@/lib/savedActions'
import { getTopSignals, getLaneSupportSummary, type TopSignal } from '@/lib/explain'
import { loadRunState, resetRunState, migrateRunState } from '@/lib/state'
import { validateRunState } from '@/lib/invariants'
import { healRunState } from '@/lib/heal'
import { track } from '@/lib/metrics'
import { resetOnboarding } from '@/lib/onboarding'
import { DevPanel } from '@/components/DevPanel'
import { ResultsHero } from '@/components/results/ResultsHero'
import { ResultsAccordion } from '@/components/results/ResultsAccordion'
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

function ResultsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [runState, setRunState] = useState<RunState | null>(null)
  const [savedActionIds, setSavedActionIds] = useState<string[]>([])
  const [activeSection, setActiveSection] = useState<
    'learn_more' | 'next_steps' | 'explore' | null
  >('learn_more')
  const [whySheetOpen, setWhySheetOpen] = useState(false)
  const [savedSheetOpen, setSavedSheetOpen] = useState(false)
  const [artifactCopied, setArtifactCopied] = useState(false)
  const [showCelebrate, setShowCelebrate] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const firstActionTimeRef = useRef<number | null>(null)
  const runCompletedTrackedRef = useRef(false)

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
              warnings: validation.warnings,
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

    // Check for celebrate param and show one-time flourish
    const celebrate = searchParams.get('celebrate')
    if (celebrate) {
      const hasShown =
        typeof window !== 'undefined'
          ? sessionStorage.getItem(`celebrate:${celebrate}`) === '1'
          : false
      if (!hasShown) {
        setShowCelebrate(true)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`celebrate:${celebrate}`, '1')
          // Hide after animation
          const fxMs = reducedMotion ? 160 : 520
          setTimeout(() => setShowCelebrate(false), fxMs)
        }
      }
    }

    // Track run_completed (only once per run)
    if (loaded && !runCompletedTrackedRef.current) {
      const answerCounts = loaded.answer_counts || { yes: 0, no: 0, skip: 0 }
      const totalSwipes = answerCounts.yes + answerCounts.no + answerCounts.skip

      // Check if early finish
      const sortedLanes = Object.entries(loaded.lane_ratings || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
      const topRating = sortedLanes[0]?.[1] || 1000
      const runnerUpRating = sortedLanes[1]?.[1] || 1000
      const gap = topRating - runnerUpRating
      const skipRate = totalSwipes > 0 ? answerCounts.skip / totalSwipes : 0
      const earlyFinish = gap >= 75 && totalSwipes >= 18 && skipRate <= 0.35

      // Calculate time (approximate from history timestamps)
      let timeMs = 0
      if (loaded.history.length > 0) {
        const first = new Date(loaded.history[0].timestamp_iso).getTime()
        const last = new Date(loaded.history[loaded.history.length - 1].timestamp_iso).getTime()
        timeMs = last - first
      }

      track('run_completed', {
        swipe_count: totalSwipes,
        yes_count: answerCounts.yes,
        no_count: answerCounts.no,
        skip_count: answerCounts.skip,
        early_finish: earlyFinish,
        time_ms: timeMs,
      })
      runCompletedTrackedRef.current = true
    }
  }, [router])

  const handleReset = () => {
    resetRunState()
    track('run_restarted', { from: 'results' })
    router.push('/play')
  }

  const handleToggleSave = (actionId: string, laneId: string) => {
    const wasSaved = savedActionIds.includes(actionId)
    const updated = toggleSavedAction(actionId)
    setSavedActionIds(updated)

    // Track action_saved ONLY when toggling to saved state
    const isNowSaved = updated.includes(actionId)
    if (isNowSaved && !wasSaved) {
      track('action_saved', { lane_id: laneId, action_id: actionId })
    }
  }

  const handleCopyArtifact = async () => {
    if (!runState || !topLaneId || !topLane) return

    const artifact = getArtifactForLane(topLaneId)
    if (!artifact) return

    const artifactText = artifact.template({
      topLaneName: topLane.name,
      topLaneDesc: topLane.description,
      runnerUpLaneName: runnerUpLane?.name,
      actions: actions,
    })

    try {
      await navigator.clipboard.writeText(artifactText)
      track('artifact_copied', { lane_id: topLaneId, artifact_id: artifact.id })
      setArtifactCopied(true)
      setTimeout(() => setArtifactCopied(false), 1500)
    } catch (err) {
      // Fallback: create textarea and select
      const textarea = document.createElement('textarea')
      textarea.value = artifactText
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        track('artifact_copied', { lane_id: topLaneId, artifact_id: artifact.id })
        setArtifactCopied(true)
        setTimeout(() => setArtifactCopied(false), 1500)
      } catch (fallbackErr) {
        console.error('Failed to copy artifact:', fallbackErr)
        alert('Failed to copy. Please try again.')
      } finally {
        document.body.removeChild(textarea)
      }
    }
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

    // Track plan_copied
    track('plan_copied')
  }

  const handleSectionToggle = (section: 'learn_more' | 'next_steps' | 'explore') => {
    if (!topLaneId) return

    // Toggle: if already open, close it; otherwise open it
    const newSection = activeSection === section ? null : section
    setActiveSection(newSection)

    // Track section open (not when closing)
    if (newSection !== null) {
      track('results_section_opened', { section: newSection, lane_id: topLaneId })
    }

    // Scroll to section header
    if (newSection !== null) {
      setTimeout(() => {
        const sectionId = `section-${newSection.replace('_', '-')}`
        const sectionEl = document.getElementById(sectionId)
        if (sectionEl) {
          sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }

  const handleExamplesExpanded = () => {
    if (!topLaneId) return
    track('examples_expanded', { lane_id: topLaneId })
  }

  const handleExploreMap = () => {
    if (!runState) return
    const sortedLanes = Object.entries(runState.lane_ratings || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 1)
    const topLaneId = sortedLanes[0]?.[0]

    if (topLaneId) {
      track('map_cta_clicked', { from: 'results_explore_section', lane_id: topLaneId })
      router.push(`/map?focus=${topLaneId}`)
    } else {
      router.push('/map')
    }
  }

  if (!runState) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-md px-4 py-6">
          <div className="py-12 text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">No results yet</h1>
            <p className="mb-6 text-gray-600">Complete a run to see your results.</p>
            <button
              onClick={() => router.push('/play')}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
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

  const statementsById = new Map(statements.map((s) => [s.id, s]))
  const topSignals = topLaneId ? getTopSignals(runState, statementsById, topLaneId, 3) : []
  const supportSummary = topLaneId
    ? getLaneSupportSummary(runState, topLaneId)
    : { yesCount: 0, noCount: 0, skipCount: 0, totalCount: 0 }

  const savedActions = actions.filter((action) => savedActionIds.includes(action.id))

  // Get celebrate param for flourish
  const celebrate = searchParams.get('celebrate')
  const fxMs = reducedMotion ? 160 : 520

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-md px-4 py-6">
        {/* Above the fold */}
        <div style={{ position: 'relative' }}>
          {/* Editorial completion flourish (one-time, behind header) */}
          {showCelebrate && celebrate && (
            <div
              key={celebrate}
              className="editorialFinishWrap"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: -8,
                height: 120,
                pointerEvents: 'none',
                zIndex: 0,
                overflow: 'hidden',
                ['--fx-ms' as any]: `${fxMs}ms`,
              }}
            >
              {/* Paper wash just behind header */}
              <div
                className="editorialFinishPaper"
                style={{ position: 'absolute', inset: 0, opacity: 0.55 }}
              />

              {!reducedMotion && (
                <div
                  className="editorialFinishHairline"
                  style={{
                    position: 'absolute',
                    left: '-15%',
                    top: '62%',
                    width: '130%',
                    height: '2px',
                  }}
                />
              )}
            </div>
          )}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <ResultsHero
              topLane={topLane || null}
              runnerUpLane={runnerUpLane || null}
              confidenceLabel={confidenceLabel}
              activeSection={activeSection}
              onSectionToggle={handleSectionToggle}
              onWhyClick={() => setWhySheetOpen(true)}
            />
          </div>
        </div>

        {/* Accordion sections */}
        {topLaneId && topLane && (
          <div id="results-accordion" className="mt-6">
            <ResultsAccordion
              topLane={topLane}
              topLaneId={topLaneId}
              actions={actions}
              savedActionIds={savedActionIds}
              artifactCopied={artifactCopied}
              onToggleSave={handleToggleSave}
              onCopyPlan={handleCopyPlan}
              onShowSaved={() => setSavedSheetOpen(true)}
              onCopyArtifact={handleCopyArtifact}
              laneGuide={getLaneGuide(topLaneId)}
              figures={allFigures}
              onExamplesExpanded={handleExamplesExpanded}
              onExploreMap={handleExploreMap}
              activeSection={activeSection}
              onSectionToggle={handleSectionToggle}
            />
          </div>
        )}

        {/* Start New Run button (always visible at bottom) */}
        <button
          onClick={handleReset}
          className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-4 font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
        >
          Start New Run
        </button>

        {/* Replay onboarding link */}
        <button
          onClick={() => {
            resetOnboarding()
            router.push('/onboarding')
          }}
          className="mt-4 w-full text-sm text-gray-500 underline hover:text-gray-700"
        >
          Replay onboarding
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

export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsPageContent />
    </Suspense>
  )
}
