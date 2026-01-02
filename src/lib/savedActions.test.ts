/**
 * Unit tests for saved actions
 */

import { describe, it, expect } from 'vitest'
import { SavedActionsSchema } from './schemas'

describe('SavedActions', () => {
  it('Saved actions invalid payload returns empty array', () => {
    const invalidPayloads = [
      null,
      undefined,
      {},
      { ids: ['action-1'] },
      'not-an-array',
      123,
      [123, 456], // Non-string array
      [{ id: 'action-1' }], // Object array instead of string array
    ]

    invalidPayloads.forEach((payload) => {
      const validation = SavedActionsSchema.safeParse(payload)
      expect(validation.success).toBe(false)
    })
  })

  it('Saved actions valid payload returns array', () => {
    const validPayloads = [[], ['action-1'], ['action-1', 'action-2', 'action-3']]

    validPayloads.forEach((payload) => {
      const validation = SavedActionsSchema.safeParse(payload)
      expect(validation.success).toBe(true)
      if (validation.success) {
        expect(Array.isArray(validation.data)).toBe(true)
        expect(validation.data.length).toBe(payload.length)
      }
    })
  })
})
