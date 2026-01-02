'use client'

import type { Action } from '@/data/actions'

type SavedSheetProps = {
  isOpen: boolean
  onClose: () => void
  savedActions: Action[]
}

export function SavedSheet({ isOpen, onClose, savedActions }: SavedSheetProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="duration-250 fixed inset-0 z-40 bg-black/30 transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="duration-250 fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] transform overflow-y-auto rounded-t-2xl bg-white shadow-2xl transition-transform ease-out">
        <div className="p-6">
          {/* Handle bar */}
          <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-gray-300" />

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Saved actions</h2>
            <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">
              ×
            </button>
          </div>

          {/* Saved actions list */}
          {savedActions.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No saved actions yet</div>
          ) : (
            <ul className="space-y-3">
              {savedActions.map((action) => (
                <li key={action.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{action.title}</div>
                      <div className="mt-1 text-xs text-gray-500">{action.minutes} min</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
