/**
 * Saved Actions: localStorage helpers for persisting saved action IDs
 *
 * Storage key: sports-career-swipe:saved-actions:v1
 * Format: string[] of action IDs
 */

const STORAGE_KEY = 'sports-career-swipe:saved-actions:v1'

/**
 * Load saved action IDs from localStorage
 * Returns empty array if none exist or on error
 */
export function loadSavedActionIds(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is string => typeof id === 'string')
    }
    return []
  } catch (e) {
    console.warn('Failed to load saved actions:', e)
    return []
  }
}

/**
 * Toggle a saved action ID
 * If the ID is saved, removes it. If not saved, adds it.
 * Returns the updated list of saved IDs
 */
export function toggleSavedAction(id: string): string[] {
  if (typeof window === 'undefined') return []

  const current = loadSavedActionIds()
  const isSaved = current.includes(id)

  const updated = isSaved ? current.filter((savedId) => savedId !== id) : [...current, id]

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    console.warn('Failed to save actions:', e)
  }

  return updated
}

/**
 * Check if an action ID is saved
 */
export function isSaved(id: string, savedIds: string[]): boolean {
  return savedIds.includes(id)
}
