import type { Lane } from '@/types/schema'

/**
 * All 8 MVP lanes with names and descriptions
 */
export const lanes: Lane[] = [
  {
    id: 'partnerships',
    name: 'Partnerships / Sponsorships',
    description: 'Sell + package + renew',
    tags: ['sales', 'sponsorships', 'partnerships']
  },
  {
    id: 'content',
    name: 'Media / Content Strategy',
    description: 'Formats + distribution + programming',
    tags: ['content', 'media', 'strategy']
  },
  {
    id: 'community',
    name: 'Community / Membership / Events',
    description: 'People + programming + ops',
    tags: ['community', 'events', 'membership']
  },
  {
    id: 'growth',
    name: 'Growth / Ticketing / CRM',
    description: 'Funnels + pricing + retention',
    tags: ['growth', 'ticketing', 'crm']
  },
  {
    id: 'nil',
    name: 'NIL / College Athletics Ops',
    description: 'Rules + relationships + execution',
    tags: ['nil', 'athletics', 'operations']
  },
  {
    id: 'talent',
    name: 'Talent / Creator Partnerships',
    description: 'Talent alignment + deal terms + rollout',
    tags: ['talent', 'creators', 'partnerships']
  },
  {
    id: 'bizops',
    name: 'BizOps / Strategy',
    description: 'Problem framing + operating cadence + cross-functional',
    tags: ['strategy', 'operations', 'business']
  },
  {
    id: 'product',
    name: 'Product / Fan Experience',
    description: 'Features + user research + shipping',
    tags: ['product', 'fan experience', 'ux']
  }
]

/**
 * Get lane by ID
 */
export function getLaneById(laneId: string): Lane | undefined {
  return lanes.find(lane => lane.id === laneId)
}

