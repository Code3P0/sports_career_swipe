'use client'

import type { Lane } from '@/types/schema'

type ResultsHeroProps = {
  topLane: Lane | null
  runnerUpLane: Lane | null
  confidenceLabel: string
  activeSection: 'learn_more' | 'next_steps' | 'explore' | null
  onSectionToggle: (section: 'learn_more' | 'next_steps' | 'explore') => void
  onWhyClick: () => void
}

export function ResultsHero({
  topLane,
  runnerUpLane,
  confidenceLabel,
  activeSection,
  onSectionToggle,
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

      {/* Three section buttons */}
      <div className="mb-6 w-full max-w-sm space-y-3">
        <button
          onClick={() => onSectionToggle('learn_more')}
          className={`w-full rounded-lg px-6 py-4 font-semibold transition-colors duration-200 ${
            activeSection === 'learn_more'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Learn More
        </button>
        <button
          onClick={() => onSectionToggle('next_steps')}
          className={`w-full rounded-lg px-6 py-4 font-semibold transition-colors duration-200 ${
            activeSection === 'next_steps'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Next Steps
        </button>
        <button
          onClick={() => onSectionToggle('explore')}
          className={`w-full rounded-lg px-6 py-4 font-semibold transition-colors duration-200 ${
            activeSection === 'explore'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Explore
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
