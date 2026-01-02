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
    <div className="mb-6 overflow-hidden rounded-lg border border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between bg-white px-4 py-3 text-left transition-colors duration-200 hover:bg-gray-50"
      >
        <span className="font-medium text-gray-900">Examples in this lane</span>
        <span className="text-lg text-gray-500">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div className="space-y-3 bg-gray-50 px-4 py-3">
          {displayedFigures.map((figure) => (
            <div key={figure.id} className="text-sm">
              <div className="font-semibold text-gray-900">
                {figure.name} — {figure.role}
              </div>
              <div className="mt-1 text-xs text-gray-600">{figure.one_liner}</div>
            </div>
          ))}
          {figures.length > 2 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-blue-600 underline hover:text-blue-700"
            >
              {showAll ? 'Show less' : `Show more (${figures.length - 2} more)`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
