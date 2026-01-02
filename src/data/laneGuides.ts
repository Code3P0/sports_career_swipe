/**
 * Lane guides: roles and starter companies for each lane
 */

export type LaneGuide = {
  lane_id: string
  roles: string[] // 3-6
  starter_companies: string[] // 6-10
}

export const LANE_GUIDES: Record<string, LaneGuide> = {
  partnerships: {
    lane_id: 'partnerships',
    roles: [
      'Partnership Manager',
      'Sponsorship Sales',
      'Account Executive',
      'Corporate Partnerships',
      'Business Development',
    ],
    starter_companies: [
      'Nike',
      'Coca-Cola',
      'Anheuser-Busch',
      'State Farm',
      'FedEx',
      'AT&T',
      'Verizon',
      'PepsiCo',
    ],
  },
  content: {
    lane_id: 'content',
    roles: [
      'Content Strategist',
      'Social Media Manager',
      'Digital Producer',
      'Content Creator',
      'Video Producer',
    ],
    starter_companies: [
      'ESPN',
      'The Athletic',
      'Bleacher Report',
      'Barstool Sports',
      'Overtime',
      'House of Highlights',
      'Stadium',
      'Sports Illustrated',
    ],
  },
  community: {
    lane_id: 'community',
    roles: [
      'Community Manager',
      'Events Coordinator',
      'Membership Manager',
      'Fan Engagement',
      'Community Programs',
    ],
    starter_companies: ['MLB', 'NBA', 'NFL', 'NHL', 'MLS', 'UFC', 'Premier League', 'Formula 1'],
  },
  growth: {
    lane_id: 'growth',
    roles: [
      'Growth Marketing Manager',
      'CRM Manager',
      'Ticketing Manager',
      'Revenue Operations',
      'Marketing Analytics',
    ],
    starter_companies: [
      'Ticketmaster',
      'StubHub',
      'SeatGeek',
      'Fanatics',
      'DraftKings',
      'FanDuel',
      'TheScore',
      'Strava',
    ],
  },
  nil: {
    lane_id: 'nil',
    roles: [
      'NIL Coordinator',
      'Athlete Relations',
      'Compliance Manager',
      'Student-Athlete Services',
      'Athletic Operations',
    ],
    starter_companies: [
      'Opendorse',
      'INFLCR',
      'Campus Ink',
      'YOKE',
      'MarketPryce',
      'NOCAP Sports',
      'NIL Network',
      'On3',
    ],
  },
  talent: {
    lane_id: 'talent',
    roles: [
      'Talent Manager',
      'Creator Partnerships',
      'Influencer Relations',
      'Brand Partnerships',
      'Talent Acquisition',
    ],
    starter_companies: [
      'Wasserman',
      'CAA Sports',
      'Excel Sports',
      'Roc Nation Sports',
      'Klutch Sports',
      'UTA',
      'IMG',
      'Octagon',
    ],
  },
  bizops: {
    lane_id: 'bizops',
    roles: [
      'Business Operations',
      'Strategy Manager',
      'Operations Analyst',
      'Program Manager',
      'Business Analyst',
    ],
    starter_companies: [
      'Fanatics',
      'DraftKings',
      'ESPN',
      'The Athletic',
      'OneTeam Partners',
      'Learfield',
      'AEG',
      'Madison Square Garden',
    ],
  },
  product: {
    lane_id: 'product',
    roles: [
      'Product Manager',
      'UX Designer',
      'Product Designer',
      'Product Analyst',
      'Technical Product Manager',
    ],
    starter_companies: [
      'ESPN',
      'The Athletic',
      'Fanatics',
      'DraftKings',
      'Strava',
      'Peloton',
      'Nike',
      'Under Armour',
    ],
  },
}

/**
 * Get lane guide by lane ID
 */
export function getLaneGuide(laneId: string): LaneGuide | null {
  return LANE_GUIDES[laneId] || null
}
