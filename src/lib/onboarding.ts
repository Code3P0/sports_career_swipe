/**
 * Onboarding state management
 * Tracks whether user has completed onboarding
 */

const STORAGE_KEY = 'sports-career-swipe:onboarding:v1'

type OnboardingState = {
  completed: boolean
  completed_at: number
}

/**
 * Check if user has completed onboarding
 */
export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return false

    const parsed = JSON.parse(stored) as OnboardingState
    return parsed.completed === true
  } catch (e) {
    return false
  }
}

/**
 * Mark onboarding as completed
 */
export function markOnboardingCompleted(): void {
  if (typeof window === 'undefined') return

  try {
    const state: OnboardingState = {
      completed: true,
      completed_at: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save onboarding state:', e)
  }
}

/**
 * Reset onboarding (for replay)
 */
export function resetOnboarding(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.warn('Failed to reset onboarding state:', e)
  }
}
