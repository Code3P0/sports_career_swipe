'use client'

import { ActionCard } from './ActionCard'
import type { Action } from '@/data/actions'

type PlanPanelProps = {
  actions: Action[]
  savedActionIds: string[]
  onToggleSave: (actionId: string) => void
  onCopyPlan: () => void
  onShowSaved: () => void
}

export function PlanPanel({
  actions,
  savedActionIds,
  onToggleSave,
  onCopyPlan,
  onShowSaved
}: PlanPanelProps) {
  const savedCount = savedActionIds.length

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">
        Your 3-step plan (15–60 min)
      </h2>
      
      <div className="space-y-3 mb-4">
        {actions.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
            isSaved={savedActionIds.includes(action.id)}
            onToggleSave={() => onToggleSave(action.id)}
          />
        ))}
      </div>
      
      {/* Copy and Saved buttons row */}
      <div className="flex gap-3">
        <button
          onClick={onCopyPlan}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
        >
          Copy plan
        </button>
        <button
          onClick={onShowSaved}
          className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-lg border border-gray-300 transition-colors duration-200"
        >
          Saved ({savedCount})
        </button>
      </div>
    </div>
  )
}

