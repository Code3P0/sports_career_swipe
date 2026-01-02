/**
 * Career Map: Lane positions and adjacency relationships
 *
 * Positions are normalized to 0-100 for flexible rendering
 * Edit this file to adjust layout and connections
 */

export type LanePosition = {
  lane_id: string
  x: number // 0-100
  y: number // 0-100
}

/**
 * Lane positions on the map (normalized 0-100 coordinates)
 * Edit these values to reposition nodes
 */
export const lanePositions: LanePosition[] = [
  { lane_id: 'partnerships', x: 20, y: 30 },
  { lane_id: 'content', x: 50, y: 20 },
  { lane_id: 'community', x: 80, y: 30 },
  { lane_id: 'growth', x: 80, y: 60 },
  { lane_id: 'product', x: 50, y: 70 },
  { lane_id: 'talent', x: 20, y: 60 },
  { lane_id: 'bizops', x: 50, y: 45 },
  { lane_id: 'nil', x: 5, y: 45 },
]

/**
 * Adjacency relationships between lanes
 * Each lane_id maps to an array of adjacent lane_ids (2-4 neighbors each)
 * Edit this object to change which lanes are connected
 */
export const adjacency: Record<string, string[]> = {
  partnerships: ['content', 'talent', 'nil'],
  content: ['partnerships', 'product', 'community', 'talent'],
  community: ['content', 'growth', 'product'],
  growth: ['community', 'product', 'bizops'],
  product: ['content', 'growth', 'bizops', 'community'],
  talent: ['partnerships', 'content', 'bizops'],
  bizops: ['talent', 'product', 'growth', 'partnerships'],
  nil: ['partnerships', 'bizops'],
}
