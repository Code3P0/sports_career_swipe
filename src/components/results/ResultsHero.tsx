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
  onWhyClick
}: ResultsHeroProps) {
  if (!topLane) return null

  return (
    <div className="flex flex-col items-center text-center mb-8">
      {/* Eyebrow label */}
      <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
        Your lane
      </div>
      
      {/* Big lane name */}
      <h1 className="text-3xl font-bold mb-3 text-gray-900">
        {topLane.name}
      </h1>
      
      {/* One-line description */}
      <p className="text-base text-gray-600 mb-4 max-w-sm">
        {topLane.description}
      </p>
      
      {/* Runner-up line */}
      {runnerUpLane && (
        <div className="text-sm text-gray-500 mb-6">
          Runner-up: <span className="font-medium text-gray-700">{runnerUpLane.name}</span>
        </div>
      )}
      
      {/* Two primary buttons */}
      <div className="w-full max-w-sm space-y-3 mb-6">
        <button
          onClick={onStartPlan}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
        >
          Start my 3-step plan
        </button>
        <button
          onClick={onExploreMap}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-lg border border-gray-300 transition-colors duration-200"
        >
          Explore the map
        </button>
      </div>
      
      {/* Confidence pill */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">Confidence:</span>
        <span className="px-3 py-1 bg-gray-100 rounded-full font-medium text-gray-700">
          {confidenceLabel}
        </span>
        <button
          onClick={onWhyClick}
          className="text-blue-600 hover:text-blue-700 underline text-xs"
        >
          What's this?
        </button>
      </div>
    </div>
  )
}

