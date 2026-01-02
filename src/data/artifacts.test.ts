/**
 * Unit tests for artifacts
 */

import { describe, it, expect } from 'vitest'
import { getArtifactForLane } from './artifacts'
import { lanes } from './lanes'
import { getActionsByLaneId } from './actions'

describe('Artifacts', () => {
  it('getArtifactForLane returns an artifact for each lane id (8 lanes)', () => {
    lanes.forEach((lane) => {
      const artifact = getArtifactForLane(lane.id)
      expect(artifact).toBeDefined()
      expect(artifact?.lane_id).toBe(lane.id)
      expect(artifact?.title).toBeTruthy()
      expect(artifact?.estimated_minutes).toBeGreaterThan(0)
    })
  })

  it('template(ctx) returns a non-empty string that includes topLaneName, at least 1 action title, and Share caption', () => {
    lanes.forEach((lane) => {
      const artifact = getArtifactForLane(lane.id)
      expect(artifact).toBeDefined()

      if (artifact) {
        const actions = getActionsByLaneId(lane.id)
        expect(actions.length).toBeGreaterThan(0)

        const templateText = artifact.template({
          topLaneName: lane.name,
          topLaneDesc: lane.description,
          runnerUpLaneName: 'Test Runner-up',
          actions: actions,
        })

        expect(templateText).toBeTruthy()
        expect(templateText.length).toBeGreaterThan(0)
        expect(templateText).toContain(lane.name)
        expect(templateText).toContain(actions[0].title)
        expect(templateText).toContain('Share caption')
      }
    })
  })

  it('captions do NOT include banned phrases (case-insensitive)', () => {
    const bannedPhrases = [
      'excited to share',
      'strategic',
      'mutual value',
      "let's connect",
      'thrilled to announce',
      'excited to launch',
      'excited to see',
      'excited for',
    ]

    lanes.forEach((lane) => {
      const artifact = getArtifactForLane(lane.id)
      expect(artifact).toBeDefined()

      if (artifact) {
        const actions = getActionsByLaneId(lane.id)
        const templateText = artifact.template({
          topLaneName: lane.name,
          topLaneDesc: lane.description,
          runnerUpLaneName: 'Test Runner-up',
          actions: actions,
        })

        // Extract caption section
        const captionStart = templateText.indexOf('Share caption (LinkedIn):')
        expect(captionStart).toBeGreaterThan(-1)
        const captionText = templateText.substring(captionStart).toLowerCase()

        bannedPhrases.forEach((phrase) => {
          const lowerPhrase = phrase.toLowerCase()
          expect(captionText).not.toContain(lowerPhrase)
        })
      }
    })
  })

  it('captions have <= 4 hashtags', () => {
    lanes.forEach((lane) => {
      const artifact = getArtifactForLane(lane.id)
      expect(artifact).toBeDefined()

      if (artifact) {
        const actions = getActionsByLaneId(lane.id)
        const templateText = artifact.template({
          topLaneName: lane.name,
          topLaneDesc: lane.description,
          runnerUpLaneName: 'Test Runner-up',
          actions: actions,
        })

        // Extract caption section
        const captionStart = templateText.indexOf('Share caption (LinkedIn):')
        expect(captionStart).toBeGreaterThan(-1)
        const captionText = templateText.substring(captionStart)

        // Count hashtags using regex
        const hashtagMatches = captionText.match(/#\w+/g)
        const hashtagCount = hashtagMatches ? hashtagMatches.length : 0

        expect(hashtagCount).toBeLessThanOrEqual(4)
      }
    })
  })
})
