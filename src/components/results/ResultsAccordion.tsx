'use client'

import { useState } from 'react'
import type { Action } from '@/data/actions'
import type { NotableFigure } from '@/data/figures'
import type { LaneGuide } from '@/data/laneGuides'
import { PlanPanel } from './PlanPanel'
import { getArtifactForLane } from '@/data/artifacts'
import type { Lane } from '@/types/schema'

type ResultsAccordionProps = {
  topLane: Lane | null
  topLaneId: string
  actions: Action[]
  savedActionIds: string[]
  artifactCopied: boolean
  onToggleSave: (actionId: string, laneId: string) => void
  onCopyPlan: () => void
  onShowSaved: () => void
  onCopyArtifact: () => void
  laneGuide: LaneGuide | null
  figures: NotableFigure[]
  onExamplesExpanded: () => void
  onExploreMap: () => void
  activeSection: 'learn_more' | 'next_steps' | 'explore' | null
  onSectionToggle: (section: 'learn_more' | 'next_steps' | 'explore') => void
}

export function ResultsAccordion({
  topLane,
  topLaneId,
  actions,
  savedActionIds,
  artifactCopied,
  onToggleSave,
  onCopyPlan,
  onShowSaved,
  onCopyArtifact,
  laneGuide,
  figures,
  onExamplesExpanded,
  onExploreMap,
  activeSection,
  onSectionToggle,
}: ResultsAccordionProps) {
  const [showAllFigures, setShowAllFigures] = useState(false)

  const displayedFigures = showAllFigures ? figures : figures.slice(0, 2)

  const handleHeaderClick = (section: 'learn_more' | 'next_steps' | 'explore') => {
    onSectionToggle(section)
  }

  return (
    <div className="space-y-3">
      {/* Learn more section */}
      <div id="section-learn-more" className="overflow-hidden rounded-lg border border-gray-200">
        <button
          onClick={() => handleHeaderClick('learn_more')}
          className="flex w-full items-center justify-between bg-white px-4 py-3 text-left transition-colors duration-200 hover:bg-gray-50"
        >
          <span className="font-semibold text-gray-900">Learn more</span>
          <span className="text-lg text-gray-500">
            {activeSection === 'learn_more' ? '−' : '+'}
          </span>
        </button>

        {activeSection === 'learn_more' && (
          <div className="space-y-4 bg-gray-50 px-4 py-4">
            {/* Lane explainer */}
            {topLane && (
              <div>
                <p className="text-sm text-gray-700">
                  This lane is about: <span className="font-medium">{topLane.description}</span>
                </p>
              </div>
            )}

            {/* Typical roles */}
            {laneGuide && laneGuide.roles.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-900">Typical roles</h4>
                <div className="flex flex-wrap gap-2">
                  {laneGuide.roles.map((role) => (
                    <span
                      key={role}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Starter companies */}
            {laneGuide && laneGuide.starter_companies.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-900">Starter companies</h4>
                <div className="flex flex-wrap gap-2">
                  {laneGuide.starter_companies.map((company) => (
                    <span
                      key={company}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                    >
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Examples in this lane */}
            {figures.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-900">Examples in this lane</h4>
                <div className="space-y-3">
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
                      onClick={() => {
                        setShowAllFigures(!showAllFigures)
                        if (!showAllFigures) {
                          onExamplesExpanded()
                        }
                      }}
                      className="text-sm text-blue-600 underline hover:text-blue-700"
                    >
                      {showAllFigures ? 'Show less' : `Show more (${figures.length - 2} more)`}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Next Steps section */}
      <div id="section-next-steps" className="overflow-hidden rounded-lg border border-gray-200">
        <button
          onClick={() => handleHeaderClick('next_steps')}
          className="flex w-full items-center justify-between bg-white px-4 py-3 text-left transition-colors duration-200 hover:bg-gray-50"
        >
          <span className="font-semibold text-gray-900">Next Steps</span>
          <span className="text-lg text-gray-500">
            {activeSection === 'next_steps' ? '−' : '+'}
          </span>
        </button>

        {activeSection === 'next_steps' && (
          <div className="space-y-6 bg-gray-50 px-4 py-4">
            {/* Ship an Artifact block */}
            {topLane && getArtifactForLane(topLaneId) && (
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="mb-1 text-lg font-semibold text-gray-900">
                  Ship an artifact (30 min)
                </h3>
                <p className="mb-4 text-sm text-gray-600">Copy this template and fill it in.</p>
                <button
                  onClick={onCopyArtifact}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors duration-200 hover:bg-blue-700"
                >
                  {artifactCopied ? '✓ Copied!' : 'Copy artifact'}
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  Estimated: {getArtifactForLane(topLaneId)?.estimated_minutes || 30} min
                </p>
                <p className="mt-1 text-xs text-gray-500">Includes: doc template + share caption</p>
              </div>
            )}

            <PlanPanel
              actions={actions}
              savedActionIds={savedActionIds}
              laneId={topLaneId}
              onToggleSave={onToggleSave}
              onCopyPlan={onCopyPlan}
              onShowSaved={onShowSaved}
            />
          </div>
        )}
      </div>

      {/* Explore section */}
      <div id="section-explore" className="overflow-hidden rounded-lg border border-gray-200">
        <button
          onClick={() => handleHeaderClick('explore')}
          className="flex w-full items-center justify-between bg-white px-4 py-3 text-left transition-colors duration-200 hover:bg-gray-50"
        >
          <span className="font-semibold text-gray-900">Explore</span>
          <span className="text-lg text-gray-500">{activeSection === 'explore' ? '−' : '+'}</span>
        </button>

        {activeSection === 'explore' && (
          <div className="space-y-4 bg-gray-50 px-4 py-4">
            <p className="text-sm text-gray-700">
              Use the map to compare adjacent lanes and test-drive a new direction.
            </p>
            <button
              onClick={onExploreMap}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50"
            >
              Explore Sports Career Map
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
