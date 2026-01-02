/**
 * Unit tests for lane guides
 */

import { describe, it, expect } from 'vitest'
import { LANE_GUIDES, getLaneGuide } from './laneGuides'
import { lanes } from './lanes'

describe('LaneGuides', () => {
  it('every lane_id in lanes data has a guide entry', () => {
    lanes.forEach((lane) => {
      const guide = getLaneGuide(lane.id)
      expect(guide).toBeDefined()
      expect(guide?.lane_id).toBe(lane.id)
    })
  })

  it('roles length >= 3 and starter_companies length >= 6', () => {
    Object.values(LANE_GUIDES).forEach((guide) => {
      expect(guide.roles.length).toBeGreaterThanOrEqual(3)
      expect(guide.starter_companies.length).toBeGreaterThanOrEqual(6)
    })
  })
})
