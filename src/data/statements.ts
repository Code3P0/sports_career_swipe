/**
 * Statement data for YES/NO gameplay
 * Each statement is tied to a lane and uses first-person preference language
 */

export type Statement = {
  id: string
  text: string
  lane_id: string
  roles?: string[] // Max 2 roles for peek details
  example?: string // 1 sentence example project
}

export const statements: Statement[] = [
  // Partnerships / Sponsorships (4 statements)
  {
    id: 'stmt-partnerships-1',
    text: 'I like building long-term relationships with corporate partners',
    lane_id: 'partnerships',
    roles: ['Partnership Manager', 'Sponsorship Director'],
    example:
      'Renew a 3-year deal with a major sponsor by demonstrating ROI through fan engagement metrics.',
  },
  {
    id: 'stmt-partnerships-2',
    text: 'I enjoy negotiating deals that create value for both sides',
    lane_id: 'partnerships',
  },
  {
    id: 'stmt-partnerships-3',
    text: "I'd rather package creative sponsorship activations than optimize ad campaigns",
    lane_id: 'partnerships',
  },
  {
    id: 'stmt-partnerships-4',
    text: 'I like renewing partnerships by showing measurable ROI',
    lane_id: 'partnerships',
  },

  // Media / Content Strategy (4 statements)
  {
    id: 'stmt-content-1',
    text: 'I enjoy planning content series that tell compelling stories',
    lane_id: 'content',
    roles: ['Content Strategist', 'Media Producer'],
    example: "Plan a 6-episode documentary series following a team's journey through the season.",
  },
  {
    id: 'stmt-content-2',
    text: 'I like thinking about distribution and audience engagement',
    lane_id: 'content',
  },
  {
    id: 'stmt-content-3',
    text: "I'd rather produce a documentary series than manage ticket sales",
    lane_id: 'content',
  },
  {
    id: 'stmt-content-4',
    text: 'I enjoy programming content across multiple platforms',
    lane_id: 'content',
  },

  // Community / Membership / Events (4 statements)
  {
    id: 'stmt-community-1',
    text: 'I like creating experiences that bring people together',
    lane_id: 'community',
    roles: ['Community Manager', 'Events Coordinator'],
    example:
      'Design a fan meetup event that combines networking, exclusive content, and team access.',
  },
  {
    id: 'stmt-community-2',
    text: 'I enjoy building membership programs that drive loyalty',
    lane_id: 'community',
  },
  {
    id: 'stmt-community-3',
    text: "I'd rather plan a fan event than analyze revenue data",
    lane_id: 'community',
  },
  {
    id: 'stmt-community-4',
    text: 'I like managing day-to-day community programming',
    lane_id: 'community',
  },

  // Growth / Ticketing / CRM (4 statements)
  {
    id: 'stmt-growth-1',
    text: 'I enjoy optimizing pricing strategies to maximize revenue',
    lane_id: 'growth',
    roles: ['Growth Analyst', 'Revenue Manager'],
    example:
      'A/B test dynamic pricing tiers for playoff tickets to optimize conversion and revenue.',
  },
  {
    id: 'stmt-growth-2',
    text: 'I like building funnels that convert fans into customers',
    lane_id: 'growth',
  },
  {
    id: 'stmt-growth-3',
    text: "I'd rather analyze customer data than create content",
    lane_id: 'growth',
  },
  {
    id: 'stmt-growth-4',
    text: 'I enjoy designing retention campaigns that keep fans engaged',
    lane_id: 'growth',
  },

  // NIL / College Athletics Ops (4 statements)
  {
    id: 'stmt-nil-1',
    text: 'I like navigating complex rules and compliance requirements',
    lane_id: 'nil',
    roles: ['NIL Coordinator', 'Compliance Officer'],
    example: 'Structure a compliant NIL deal for a student-athlete with a local business partner.',
  },
  {
    id: 'stmt-nil-2',
    text: 'I enjoy building relationships with student-athletes',
    lane_id: 'nil',
  },
  {
    id: 'stmt-nil-3',
    text: "I'd rather manage athletic operations than create marketing campaigns",
    lane_id: 'nil',
  },
  {
    id: 'stmt-nil-4',
    text: 'I like executing programs that support athlete development',
    lane_id: 'nil',
  },

  // Talent / Creator Partnerships (4 statements)
  {
    id: 'stmt-talent-1',
    text: 'I enjoy aligning talent with brand partnerships',
    lane_id: 'talent',
    roles: ['Talent Manager', 'Creator Partnerships Lead'],
    example:
      'Match a creator with a brand campaign that aligns with both their audience and brand values.',
  },
  {
    id: 'stmt-talent-2',
    text: 'I like structuring deals that benefit both athletes and brands',
    lane_id: 'talent',
  },
  {
    id: 'stmt-talent-3',
    text: "I'd rather manage creator relationships than optimize ticketing",
    lane_id: 'talent',
  },
  {
    id: 'stmt-talent-4',
    text: 'I enjoy rolling out talent campaigns across multiple channels',
    lane_id: 'talent',
  },

  // BizOps / Strategy (4 statements)
  {
    id: 'stmt-bizops-1',
    text: 'I like framing complex problems and finding solutions',
    lane_id: 'bizops',
    roles: ['Business Operations Manager', 'Strategy Lead'],
    example: 'Frame a cross-functional initiative to improve fan retention across all touchpoints.',
  },
  {
    id: 'stmt-bizops-2',
    text: 'I enjoy building operating cadences that keep teams aligned',
    lane_id: 'bizops',
  },
  {
    id: 'stmt-bizops-3',
    text: "I'd rather work cross-functionally than focus on one lane",
    lane_id: 'bizops',
  },
  {
    id: 'stmt-bizops-4',
    text: 'I like strategic planning that drives long-term growth',
    lane_id: 'bizops',
  },

  // Product / Fan Experience (4 statements)
  {
    id: 'stmt-product-1',
    text: 'I enjoy designing digital experiences that enhance fan engagement',
    lane_id: 'product',
    roles: ['Product Manager', 'UX Designer'],
    example: 'Design a mobile feature that lets fans vote on in-game decisions in real-time.',
  },
  {
    id: 'stmt-product-2',
    text: 'I like conducting user research to understand fan needs',
    lane_id: 'product',
  },
  {
    id: 'stmt-product-3',
    text: "I'd rather ship product features than manage partnerships",
    lane_id: 'product',
  },
  {
    id: 'stmt-product-4',
    text: 'I enjoy building products that connect fans with live sports',
    lane_id: 'product',
  },
]

/**
 * Get all statements for a specific lane
 */
export function getStatementsByLaneId(laneId: string): Statement[] {
  return statements.filter((s) => s.lane_id === laneId)
}

/**
 * Get statement by ID
 */
export function getStatementById(id: string): Statement | undefined {
  return statements.find((s) => s.id === id)
}

/**
 * Get set of all valid statement IDs (for migration/validation)
 */
export function getValidStatementIds(): Set<string> {
  return new Set(statements.map((s) => s.id))
}
