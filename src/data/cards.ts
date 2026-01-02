import type { Card } from '@/types/schema'

/**
 * Card data with lane mappings
 * Each card side has lane_ids array - we use the first lane_id as the primary lane
 */
export const cards: Card[] = [
  {
    id: 'card-1',
    type: 'lane_scenario',
    left: {
      title: 'Renegotiate the deal',
      body: 'Work directly with the sponsor to adjust terms and find a win-win solution.',
      lane_ids: ['partnerships'],
      tags: ['negotiation', 'relationships']
    },
    right: {
      title: 'Redesign the activation',
      body: 'Create a new activation package that better aligns with the sponsor\'s goals.',
      lane_ids: ['partnerships', 'content'],
      tags: ['creativity', 'strategy']
    }
  },
  {
    id: 'card-2',
    type: 'lane_scenario',
    left: {
      title: 'Build a content series',
      body: 'Plan and produce a multi-episode series that tells a compelling story.',
      lane_ids: ['content'],
      tags: ['creativity', 'storytelling']
    },
    right: {
      title: 'Optimize ticket pricing',
      body: 'Analyze demand patterns and adjust pricing to maximize revenue.',
      lane_ids: ['growth'],
      tags: ['analytics', 'revenue']
    }
  }
]

/**
 * Get the primary lane ID for a card side
 * Uses the first lane_id in the array
 */
export function getPrimaryLaneId(laneIds: string[]): string | null {
  return laneIds.length > 0 ? laneIds[0] : null
}

