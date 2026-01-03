/**
 * Optional swipe sound effects (default OFF)
 * Uses Web Audio API for short, non-blocking audio feedback
 */

const STORAGE_KEY = 'sports-career-swipe:sfx:v1'

/**
 * Get current sound enabled state (defaults to false)
 */
export function getSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === null) return false
    return stored === 'true'
  } catch {
    return false
  }
}

/**
 * Set sound enabled state
 */
export function setSoundEnabled(on: boolean): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, String(on))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Play a short swipe sound effect
 * Fails silently if AudioContext is unavailable or errors occur
 */
export function playSwipeSfx(intent: 'yes' | 'no' | 'skip'): void {
  if (typeof window === 'undefined') return

  try {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return

    const audioContext = new AudioContextClass()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Configure based on intent
    if (intent === 'yes') {
      // YES: ascending tone (660Hz -> 880Hz, 70ms)
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(660, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.07)
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.07)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.07)
    } else if (intent === 'no') {
      // NO: descending tone (440Hz -> 330Hz, 70ms)
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(330, audioContext.currentTime + 0.07)
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.07)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.07)
    } else if (intent === 'skip') {
      // SKIP: soft tone (520Hz, ~90ms with softer envelope)
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(520, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.09)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.09)
    }
  } catch {
    // Fail silently - SFX is optional
  }
}
