'use client'

import type { TopSignal } from '@/lib/explain'
import type { LaneSupportSummary } from '@/lib/explain'

type WhySheetProps = {
  isOpen: boolean
  onClose: () => void
  topSignals: TopSignal[]
  supportSummary: LaneSupportSummary
  topLaneName: string
}

export function WhySheet({
  isOpen,
  onClose,
  topSignals,
  supportSummary,
  topLaneName
}: WhySheetProps) {
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
            <h2 className="text-xl font-semibold text-gray-900">Why this lane?</h2>
            <button
              onClick={onClose}
              className="text-2xl text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          {/* Top signals */}
          {topSignals.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                Top signals
              </h3>
              <ul className="space-y-3">
                {topSignals.map((signal, idx) => {
                  if (!signal.statement) return null
                  
                  const answer = signal.entry.answer
                  const answerColor = answer === 'yes' 
                    ? 'text-green-600' 
                    : answer === 'no' 
                    ? 'text-red-600' 
                    : 'text-gray-500'
                  
                  const maxLength = 120
                  const statementText = signal.statement.text.length > maxLength
                    ? signal.statement.text.substring(0, maxLength) + '...'
                    : signal.statement.text

                  return (
                    <li key={idx} className="pl-5 relative">
                      <span className="absolute left-0 text-gray-400">•</span>
                      <div className="text-sm leading-relaxed">
                        <span className={`font-semibold ${answerColor} mr-2`}>
                          {answer === 'meh' 
                            ? 'NOT SURE' 
                            : answer === 'skip'
                            ? 'SKIP'
                            : answer?.toUpperCase()}
                        </span>
                        {statementText}
                        {signal.statement.roles && signal.statement.roles.length > 0 && (
                          <div className="text-xs text-gray-500 italic mt-1">
                            Roles: {signal.statement.roles.join(', ')}
                          </div>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          
          {/* Your pattern */}
          {supportSummary.totalCount > 0 && (
            <div className="mb-4 text-sm text-gray-600 leading-relaxed">
              <strong>Your pattern:</strong> You said{' '}
              <strong className="text-green-600">YES</strong> to {supportSummary.yesCount},{' '}
              <strong className="text-red-600">NO</strong> to {supportSummary.noCount}
              {supportSummary.skipCount > 0 && (
                <>
                  , <strong className="text-gray-500">SKIP</strong> {supportSummary.skipCount}
                </>
              )}
              {' '}for <strong>{topLaneName}</strong> statements.
            </div>
          )}
          
          {/* Confidence explanation */}
          <div className="text-xs text-gray-500 italic leading-relaxed">
            Confidence is based on rating gap + signal quality + coverage.
          </div>
        </div>
      </div>
    </>
  )
}

