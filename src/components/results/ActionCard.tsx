'use client'

import type { Action } from '@/data/actions'

type ActionCardProps = {
  action: Action
  isSaved: boolean
  onToggleSave: () => void
}

export function ActionCard({ action, isSaved, onToggleSave }: ActionCardProps) {
  return (
    <div className={`p-4 rounded-lg border ${
      isSaved ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-base font-semibold text-gray-900">
              {action.title}
            </h4>
            <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
              {action.minutes} min
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2 leading-relaxed">
            {action.description}
          </p>
          <div className="text-xs text-gray-600">
            <strong>Deliverable:</strong> {action.deliverable}
          </div>
        </div>
        <button
          onClick={onToggleSave}
          className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded transition-all duration-200 ${
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

