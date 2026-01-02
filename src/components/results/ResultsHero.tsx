'use client'

import type { Lane } from '@/types/schema'

type ResultsHeroProps = {
  topLane: Lane | null
  runnerUpLane: Lane | null
  confidenceLabel: string
  onStartPlan: () => void
  onExploreMap: () => void
  onWhyClick: () => void
}

export function ResultsHero({
  topLane,
  runnerUpLane,
  confidenceLabel,
  onStartPlan,
  onExploreMap,
  onWhyClick,
}: ResultsHeroProps) {
  if (!topLane) return null

  return (
    <div className="mb-8 flex flex-col items-center text-center">
      {/* Eyebrow label */}
      <div className="mb-2 text-xs uppercase tracking-wider text-gray-500">Your lane</div>

      {/* Big lane name */}
      <h1 className="mb-3 text-3xl font-bold text-gray-900">{topLane.name}</h1>

      {/* One-line description */}
      <p className="mb-4 max-w-sm text-base text-gray-600">{topLane.description}</p>

      {/* Runner-up line */}
      {runnerUpLane && (
        <div className="mb-6 text-sm text-gray-500">
          Runner-up: <span className="font-medium text-gray-700">{runnerUpLane.name}</span>
        </div>
      )}

      {/* Two primary buttons */}
      <div className="mb-6 w-full max-w-sm space-y-3">
        <button
          onClick={onStartPlan}
          className="w-full rounded-lg bg-blue-600 px-6 py-4 font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
        >
          Start my 3-step plan
        </button>
        <button
          onClick={onExploreMap}
          className="w-full rounded-lg border border-gray-300 bg-white px-6 py-4 font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-50"
        >
          Explore the map
        </button>
      </div>

      {/* Confidence pill */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">Confidence:</span>
        <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
          {confidenceLabel}
        </span>
        <button
          onClick={onWhyClick}
          className="text-xs text-blue-600 underline hover:text-blue-700"
        >
          What's this?
        </button>
      </div>
    </div>
  )
}
