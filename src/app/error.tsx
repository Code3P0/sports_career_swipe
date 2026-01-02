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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mb-4 text-6xl">⚠️</div>
        <h1 className="text-3xl font-semibold text-gray-900">Something went wrong</h1>
        <p className="text-base leading-relaxed text-gray-600">
          We encountered an unexpected error. Don't worry, your progress is saved.
        </p>

        {isDev && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-left">
            <p className="mb-2 text-sm font-semibold text-red-900">Development Error Details:</p>
            <p className="break-all font-mono text-xs text-red-700">{error.message}</p>
            {error.digest && <p className="mt-2 text-xs text-red-600">Digest: {error.digest}</p>}
          </div>
        )}

        <button
          onClick={reset}
          className="w-full rounded-2xl bg-blue-600 px-6 py-4 font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </main>
  )
}
