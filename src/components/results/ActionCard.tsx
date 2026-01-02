'use client'

import type { Action } from '@/data/actions'

type ActionCardProps = {
  action: Action
  isSaved: boolean
  onToggleSave: () => void
}

export function ActionCard({ action, isSaved, onToggleSave }: ActionCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        isSaved ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h4 className="text-base font-semibold text-gray-900">{action.title}</h4>
            <span className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-600">
              {action.minutes} min
            </span>
          </div>
          <p className="mb-2 text-sm leading-relaxed text-gray-600">{action.description}</p>
          <div className="text-xs text-gray-600">
            <strong>Deliverable:</strong> {action.deliverable}
          </div>
        </div>
        <button
          onClick={onToggleSave}
          className={`flex-shrink-0 rounded px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
            isSaved
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isSaved ? '✓' : '○'}
        </button>
      </div>
    </div>
  )
}
