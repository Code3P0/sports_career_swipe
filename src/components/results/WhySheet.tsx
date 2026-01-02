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
  topLaneName,
}: WhySheetProps) {
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
            <h2 className="text-xl font-semibold text-gray-900">Why this lane?</h2>
            <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">
              ×
            </button>
          </div>

          {/* Top signals */}
          {topSignals.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">
                Top signals
              </h3>
              <ul className="space-y-3">
                {topSignals.map((signal, idx) => {
                  if (!signal.statement) return null

                  const answer = signal.entry.answer
                  const answerColor =
                    answer === 'yes'
                      ? 'text-green-600'
                      : answer === 'no'
                        ? 'text-red-600'
                        : 'text-gray-500'

                  const maxLength = 120
                  const statementText =
                    signal.statement.text.length > maxLength
                      ? signal.statement.text.substring(0, maxLength) + '...'
                      : signal.statement.text

                  return (
                    <li key={idx} className="relative pl-5">
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
                          <div className="mt-1 text-xs italic text-gray-500">
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
            <div className="mb-4 text-sm leading-relaxed text-gray-600">
              <strong>Your pattern:</strong> You said{' '}
              <strong className="text-green-600">YES</strong> to {supportSummary.yesCount},{' '}
              <strong className="text-red-600">NO</strong> to {supportSummary.noCount}
              {supportSummary.skipCount > 0 && (
                <>
                  , <strong className="text-gray-500">SKIP</strong> {supportSummary.skipCount}
                </>
              )}{' '}
              for <strong>{topLaneName}</strong> statements.
            </div>
          )}

          {/* Confidence explanation */}
          <div className="text-xs italic leading-relaxed text-gray-500">
            Confidence is based on rating gap + signal quality + coverage.
          </div>
        </div>
      </div>
    </>
  )
}
