'use client'

import { useEffect } from 'react'

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error for debugging
    console.error('Application error:', error)
  }, [error])

  const isDev = process.env.NODE_ENV === 'development'

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-3xl font-semibold text-gray-900">Something went wrong</h1>
        <p className="text-base text-gray-600 leading-relaxed">
          We encountered an unexpected error. Don't worry, your progress is saved.
        </p>

        {isDev && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="text-sm font-semibold text-red-900 mb-2">Development Error Details:</p>
            <p className="text-xs text-red-700 font-mono break-all">{error.message}</p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">Digest: {error.digest}</p>
            )}
          </div>
        )}

        <button
          onClick={reset}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-2xl transition-colors duration-200"
        >
          Try again
        </button>
      </div>
    </main>
  )
}

