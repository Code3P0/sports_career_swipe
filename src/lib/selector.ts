import type { Statement } from '@/data/statements'
import type { RunState } from '@/types/schema'

// Minimum statements to show per lane before focusing on top lanes
// Adjust this value to change coverage requirements
const MIN_LANE_COVERAGE = 2

// Exploration probability: chance to pick a non-top lane after coverage
// Adjust this value (0-1) to change exploration rate
const EXPLORE_PROBABILITY = 0.12

/**
 * Get the next statement using adaptive selection logic
 */
export function getNextStatement(
  statements: Statement[],
  runState: RunState
): Statement | null {
  const seenIds = runState.seen_statement_ids || []
  const laneCounts = runState.lane_counts_shown || {}
  
  // Get unseen statements
  const unseenStatements = statements.filter(s => !seenIds.includes(s.id))
  
  if (unseenStatements.length === 0) {
    // All statements seen, return null (shouldn't happen in normal flow)
    return null
  }
  
  // Check if we need to prioritize coverage
  const allLanesCovered = ALL_LANES.every(lane => 
    (laneCounts[lane] || 0) >= MIN_LANE_COVERAGE
  )
  
  if (!allLanesCovered) {
    // Coverage phase: prioritize lanes with lowest counts
    const laneCountsArray = ALL_LANES.map(lane => ({
      lane,
      count: laneCounts[lane] || 0
    }))
    
    // Sort by count ascending
    laneCountsArray.sort((a, b) => a.count - b.count)
    
    // Find lanes that need coverage
    const needsCoverage = laneCountsArray.filter(
      item => item.count < MIN_LANE_COVERAGE
    )
    
    // Pick from the lane(s) with lowest count
    const targetLanes = needsCoverage.filter(
      item => item.count === needsCoverage[0].count
    )
    
    // Get unseen statements for target lanes
    const candidates = unseenStatements.filter(s =>
      targetLanes.some(tl => tl.lane === s.lane_id)
    )
    
    if (candidates.length > 0) {
      // Randomly pick from candidates
      return candidates[Math.floor(Math.random() * candidates.length)]
    }
  }
  
  // After coverage: focus on top lanes or explore
  const shouldExplore = Math.random() < EXPLORE_PROBABILITY
  
  if (shouldExplore) {
    // Exploration: pick from non-top lanes
    const sortedLanes = Object.entries(runState.lane_ratings)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([lane]) => lane)
    
    const exploreCandidates = unseenStatements.filter(s =>
      !sortedLanes.includes(s.lane_id)
    )
    
    if (exploreCandidates.length > 0) {
      return exploreCandidates[Math.floor(Math.random() * exploreCandidates.length)]
    }
  }
  
  // Focus on top 3 lanes with smallest rating gaps
  const sortedLanes = Object.entries(runState.lane_ratings)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
  
  if (sortedLanes.length < 2) {
    // Not enough lanes, pick from top lane
    const topLane = sortedLanes[0]?.[0]
    if (topLane) {
      const candidates = unseenStatements.filter(s => s.lane_id === topLane)
      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)]
      }
    }
  } else {
    // Find lanes with smallest gaps among top 3
    const topRating = sortedLanes[0]?.[1] || 1000
    const gaps = sortedLanes.map(([lane, rating]) => ({
      lane,
      gap: topRating - rating
    }))
    
    // Sort by gap (smallest first) - most uncertain
    gaps.sort((a, b) => a.gap - b.gap)
    
    // Pick from lanes with smallest gaps
    const smallestGap = gaps[0].gap
    const uncertainLanes = gaps.filter(g => g.gap === smallestGap)
    
    // Get candidates from uncertain lanes
    const candidates = unseenStatements.filter(s =>
      uncertainLanes.some(ul => ul.lane === s.lane_id)
    )
    
    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)]
    }
  }
  
  // Fallback: any unseen statement
  return unseenStatements[Math.floor(Math.random() * unseenStatements.length)]
}

// All 8 MVP lanes (needed for coverage logic)
const ALL_LANES = [
  'partnerships',
  'content',
  'community',
  'growth',
  'nil',
  'talent',
  'bizops',
  'product'
]

