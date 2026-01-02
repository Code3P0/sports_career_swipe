'use client'

import { useState } from 'react'
import type { NotableFigure } from '@/data/figures'

type ExploreAccordionProps = {
  figures: NotableFigure[]
}

export function ExploreAccordion({ figures }: ExploreAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  
  const displayedFigures = showAll ? figures : figures.slice(0, 2)

  if (figures.length === 0) return null

  return (
    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white hover:bg-gray-50 flex items-center justify-between text-left transition-colors duration-200"
      >
        <span className="font-medium text-gray-900">Examples in this lane</span>
        <span className="text-gray-500 text-lg">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      
      {isOpen && (
        <div className="px-4 py-3 bg-gray-50 space-y-3">
          {displayedFigures.map((figure) => (
            <div key={figure.id} className="text-sm">
              <div className="font-semibold text-gray-900">
                {figure.name} — {figure.role}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {figure.one_liner}
              </div>
            </div>
          ))}
          {figures.length > 2 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              {showAll ? 'Show less' : `Show more (${figures.length - 2} more)`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

