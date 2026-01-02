'use client'

import { useState, useEffect } from 'react'
import type { RunState } from '@/types/schema'
import { validateRunState } from '@/lib/invariants'
import { resetRunState, saveRunState } from '@/lib/state'
import { getLaneById } from '@/data/lanes'
import { useRouter } from 'next/navigation'

type DevPanelProps = {
  runState: RunState | null
}

export function DevPanel({ runState }: DevPanelProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isDev = process.env.NODE_ENV === 'development'
    if (!isDev) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        setIsOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return null
  if (!isOpen) return null

  const validation = runState
    ? validateRunState(runState)
    : { ok: false, errors: ['No runState'], warnings: [] }

  // Get top lanes
  const sortedLanes = runState
    ? Object.entries(runState.lane_ratings || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
    : []
  const topLaneId = sortedLanes[0]?.[0]
  const runnerUpLaneId = sortedLanes[1]?.[0]
  const topRating = sortedLanes[0]?.[1] || 1000
  const runnerUpRating = sortedLanes[1]?.[1] || 1000
  const gap = topRating - runnerUpRating

  const topLane = topLaneId ? getLaneById(topLaneId) : null
  const runnerUpLane = runnerUpLaneId ? getLaneById(runnerUpLaneId) : null

  const handleReset = () => {
    const newState = resetRunState()
    saveRunState(newState)
    router.push('/play')
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border-2 border-gray-300 bg-white p-4 text-sm shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Dev Panel</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
          ×
        </button>
      </div>

      {runState ? (
        <div className="space-y-2 text-xs">
          <div>
            <strong>current_statement_id:</strong> {runState.current_statement_id || 'null'}
          </div>
          <div>
            <strong>round:</strong> {runState.round} / {runState.max_rounds}
          </div>
          <div>
            <strong>answers:</strong> {runState.answer_counts?.yes || 0} yes /{' '}
            {runState.answer_counts?.no || 0} no / {runState.answer_counts?.skip || 0} skip
          </div>
          <div>
            <strong>presented stack:</strong> {runState.presented_statement_ids?.length || 0} items
          </div>
          {topLane && (
            <div>
              <strong>top lane:</strong> {topLane.name} ({topRating})
            </div>
          )}
          {runnerUpLane && (
            <div>
              <strong>runner-up:</strong> {runnerUpLane.name} ({runnerUpRating})
            </div>
          )}
          <div>
            <strong>gap:</strong> {gap}
          </div>

          {/* Invariant status */}
          <div className="mt-3 border-t border-gray-200 pt-3">
            <div className="mb-1 flex items-center gap-2">
              <strong>Invariants:</strong>
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${
                  validation.ok && validation.warnings.length === 0
                    ? 'bg-green-100 text-green-800'
                    : validation.errors.length > 0
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {validation.errors.length > 0
                  ? 'ERROR'
                  : validation.warnings.length > 0
                    ? 'WARN'
                    : 'OK'}
              </span>
            </div>
            {(validation.errors.length > 0 || validation.warnings.length > 0) && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-blue-600 underline hover:text-blue-700"
              >
                {showDetails ? 'Hide' : 'Show'} details
              </button>
            )}
            {showDetails && (
              <div className="mt-2 space-y-1 text-xs">
                {validation.errors.map((err, idx) => (
                  <div key={idx} className="text-red-600">
                    ✗ {err}
                  </div>
                ))}
                {validation.warnings.map((warn, idx) => (
                  <div key={idx} className="text-yellow-600">
                    ⚠ {warn}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleReset}
            className="mt-3 w-full rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Reset Run
          </button>
        </div>
      ) : (
        <div className="text-xs text-gray-500">No runState loaded</div>
      )}
    </div>
  )
}
