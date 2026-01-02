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
        className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-250"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto transform transition-transform duration-250 ease-out">
        <div className="p-6">
          {/* Handle bar */}
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Saved actions</h2>
            <button
              onClick={onClose}
              className="text-2xl text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          {/* Saved actions list */}
          {savedActions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No saved actions yet
            </div>
          ) : (
            <ul className="space-y-3">
              {savedActions.map((action) => (
                <li
                  key={action.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">
                        {action.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {action.minutes} min
                      </div>
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

