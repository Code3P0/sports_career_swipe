/**
 * Metrics logging (console-based)
 * Logs events as JSON lines with timestamps
 */

const STORAGE_KEY = 'sports-career-swipe:metrics:v1'
const MAX_EVENTS = 200

type MetricEvent = {
  event: string
  ts: number
  [key: string]: any
}

/**
 * Track an event with optional properties
 */
export function track(eventName: string, props?: Record<string, any>): void {
  const event: MetricEvent = {
    event: eventName,
    ts: Date.now(),
    ...props,
  }

  // Log to console as JSON line
  console.log(JSON.stringify(event))

  // Optionally persist to localStorage (rolling array)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const events: MetricEvent[] = stored ? JSON.parse(stored) : []

      events.push(event)

      // Keep only last MAX_EVENTS
      if (events.length > MAX_EVENTS) {
        events.splice(0, events.length - MAX_EVENTS)
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
    } catch (e) {
      // Silently fail if localStorage is full or unavailable
    }
  }
}
