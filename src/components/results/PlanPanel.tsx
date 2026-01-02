'use client'

import { ActionCard } from './ActionCard'
import type { Action } from '@/data/actions'

type PlanPanelProps = {
  actions: Action[]
  savedActionIds: string[]
  laneId: string
  onToggleSave: (actionId: string, laneId: string) => void
  onCopyPlan: () => void
  onShowSaved: () => void
}

export function PlanPanel({
  actions,
  savedActionIds,
  laneId,
  onToggleSave,
  onCopyPlan,
  onShowSaved,
}: PlanPanelProps) {
  const savedCount = savedActionIds.length

  return (
    <div className="mb-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">Your 3-step plan (15–60 min)</h2>

      <div className="mb-4 space-y-3">
        {actions.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
            isSaved={savedActionIds.includes(action.id)}
            onToggleSave={() => onToggleSave(action.id, laneId)}
          />
        ))}
      </div>

      {/* Copy and Saved buttons row */}
      <div className="flex gap-3">
        <button
          onClick={onCopyPlan}
          className="flex-1 rounded-lg bg-gray-600 px-4 py-2.5 font-medium text-white transition-colors duration-200 hover:bg-gray-700"
        >
          Copy plan
        </button>
        <button
          onClick={onShowSaved}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50"
        >
          Saved ({savedCount})
        </button>
      </div>
    </div>
  )
}
