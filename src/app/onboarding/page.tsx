'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { markOnboardingCompleted } from '@/lib/onboarding'
import { track } from '@/lib/metrics'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [startTime] = useState(Date.now())

  const handleNext = () => {
    if (step === 1) {
      setStep(2)
    }
  }

  const handleStart = () => {
    const elapsed = Date.now() - startTime
    markOnboardingCompleted()
    track('onboarding_completed', { elapsed_ms: elapsed })
    router.push('/play')
  }

  const handleSkip = () => {
    track('onboarding_skipped', { step })
    markOnboardingCompleted()
    router.push('/play')
  }

  useEffect(() => {
    track('onboarding_started')
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        {step === 1 ? (
          <>
            {/* Screen 1 */}
            <div className="space-y-6 text-center">
              <div className="mb-4 text-6xl">👆</div>
              <h1 className="text-3xl font-semibold text-gray-900">Swipe to find your lane</h1>
              <p className="text-base leading-relaxed text-gray-600">
                Swipe YES or NO on statements. Skip if you're unsure. Undo anytime.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleNext}
                className="w-full rounded-2xl bg-blue-600 px-6 py-4 font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
              >
                Next
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Skip
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Screen 2 */}
            <div className="space-y-6 text-center">
              <div className="mb-4 text-6xl">🗺️</div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Get direction, not just a label
              </h1>
              <p className="text-base leading-relaxed text-gray-600">
                You'll get a lane, a 3-step plan, and a map to explore adjacent paths.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleStart}
                className="w-full rounded-2xl bg-blue-600 px-6 py-4 font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
              >
                Start swiping
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Skip
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
