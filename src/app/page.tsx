'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { hasCompletedOnboarding, resetOnboarding } from '@/lib/onboarding'

export default function Home() {
  const router = useRouter()
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)

  useEffect(() => {
    setOnboardingCompleted(hasCompletedOnboarding())
  }, [])

  const handleStart = () => {
    if (onboardingCompleted) {
      router.push('/play')
    } else {
      router.push('/onboarding')
    }
  }

  const handleReplayOnboarding = () => {
    resetOnboarding()
    router.push('/onboarding')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Sports Career Swipe</h1>
      <p className="mb-8 max-w-md text-lg text-gray-600">
        Find your sports business lane in under 3 minutes
      </p>

      <button
        onClick={handleStart}
        className="mb-6 rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
      >
        Start
      </button>

      {/* Replay onboarding link */}
      <button
        onClick={handleReplayOnboarding}
        className="text-sm text-gray-500 underline hover:text-gray-700"
      >
        Replay onboarding
      </button>
    </main>
  )
}
