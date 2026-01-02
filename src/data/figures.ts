/**
 * Notable figures data for each lane
 * Each figure has: id, name, role, one_liner, lane_id
 */

export type NotableFigure = {
  id: string
  name: string
  role: string
  one_liner: string
  lane_id: string
}

export const figures: NotableFigure[] = [
  // Partnerships / Sponsorships
  {
    id: 'fig-partnerships-1',
    name: 'Amy Brooks',
    role: 'Chief Revenue Officer',
    one_liner: 'Built multi-year partnership strategy for major sports franchises',
    lane_id: 'partnerships'
  },
  {
    id: 'fig-partnerships-2',
    name: 'Dan Cohen',
    role: 'VP of Global Partnerships',
    one_liner: 'Negotiated landmark sponsorship deals across leagues',
    lane_id: 'partnerships'
  },
  {
    id: 'fig-partnerships-3',
    name: 'Renee Washington',
    role: 'Head of Corporate Partnerships',
    one_liner: 'Developed activation programs that drive sponsor ROI',
    lane_id: 'partnerships'
  },
  {
    id: 'fig-partnerships-4',
    name: 'Chris Allphin',
    role: 'Partnerships Director',
    one_liner: 'Specializes in renewals and long-term relationship building',
    lane_id: 'partnerships'
  },

  // Media / Content Strategy
  {
    id: 'fig-content-1',
    name: 'Rachel Jacobson',
    role: 'VP of Content Strategy',
    one_liner: 'Created award-winning digital content series for sports brands',
    lane_id: 'content'
  },
  {
    id: 'fig-content-2',
    name: 'Jemele Hill',
    role: 'Content Creator & Strategist',
    one_liner: 'Built personal brand through authentic storytelling and commentary',
    lane_id: 'content'
  },
  {
    id: 'fig-content-3',
    name: 'Adam White',
    role: 'Head of Programming',
    one_liner: 'Developed multi-platform content distribution strategies',
    lane_id: 'content'
  },
  {
    id: 'fig-content-4',
    name: 'Sarah Spain',
    role: 'Content Director',
    one_liner: 'Produced engaging formats that connect with diverse audiences',
    lane_id: 'content'
  },

  // Community / Membership / Events
  {
    id: 'fig-community-1',
    name: 'Meredith Starkey',
    role: 'VP of Community Engagement',
    one_liner: 'Built membership programs that drive fan loyalty and retention',
    lane_id: 'community'
  },
  {
    id: 'fig-community-2',
    name: 'David Katz',
    role: 'Events Director',
    one_liner: 'Produced large-scale fan experiences and community gatherings',
    lane_id: 'community'
  },
  {
    id: 'fig-community-3',
    name: 'Jessica Berman',
    role: 'Head of Membership',
    one_liner: 'Designed membership tiers that create value for fans',
    lane_id: 'community'
  },
  {
    id: 'fig-community-4',
    name: 'Chris Granger',
    role: 'Community Operations Lead',
    one_liner: 'Managed day-to-day community programming and member services',
    lane_id: 'community'
  },

  // Growth / Ticketing / CRM
  {
    id: 'fig-growth-1',
    name: 'Danielle du Toit',
    role: 'VP of Revenue Strategy',
    one_liner: 'Optimized pricing and inventory to maximize ticket revenue',
    lane_id: 'growth'
  },
  {
    id: 'fig-growth-2',
    name: 'Jason Kint',
    role: 'Growth Marketing Director',
    one_liner: 'Built data-driven acquisition funnels for sports properties',
    lane_id: 'growth'
  },
  {
    id: 'fig-growth-3',
    name: 'Amy Latimer',
    role: 'CRM Strategy Lead',
    one_liner: 'Developed customer segmentation and retention campaigns',
    lane_id: 'growth'
  },
  {
    id: 'fig-growth-4',
    name: 'Brett Yormark',
    role: 'Revenue Operations Director',
    one_liner: 'Integrated ticketing, marketing, and analytics systems',
    lane_id: 'growth'
  },

  // NIL / College Athletics Ops
  {
    id: 'fig-nil-1',
    name: 'Blake Lawrence',
    role: 'NIL Operations Director',
    one_liner: 'Navigated complex compliance rules to enable athlete partnerships',
    lane_id: 'nil'
  },
  {
    id: 'fig-nil-2',
    name: 'Julie Cromer',
    role: 'Athletics Administrator',
    one_liner: 'Managed operations across multiple sports programs',
    lane_id: 'nil'
  },
  {
    id: 'fig-nil-3',
    name: 'Oliver Luck',
    role: 'College Athletics Executive',
    one_liner: 'Balanced competitive goals with regulatory requirements',
    lane_id: 'nil'
  },
  {
    id: 'fig-nil-4',
    name: 'Jen Cohen',
    role: 'Athletic Director',
    one_liner: 'Led strategic initiatives in evolving college sports landscape',
    lane_id: 'nil'
  },

  // Talent / Creator Partnerships
  {
    id: 'fig-talent-1',
    name: 'Rich Kleiman',
    role: 'Talent Manager & Executive',
    one_liner: 'Built athlete brands through strategic partnerships and content',
    lane_id: 'talent'
  },
  {
    id: 'fig-talent-2',
    name: 'Maverick Carter',
    role: 'Creator Partnerships Lead',
    one_liner: 'Developed long-term talent relationships and business ventures',
    lane_id: 'talent'
  },
  {
    id: 'fig-talent-3',
    name: 'Jaymee Messler',
    role: 'Talent Strategy Director',
    one_liner: 'Connected athletes with brands for authentic collaborations',
    lane_id: 'talent'
  },
  {
    id: 'fig-talent-4',
    name: 'Paul Wachter',
    role: 'Talent Business Advisor',
    one_liner: 'Structured deals that maximize value for athletes and partners',
    lane_id: 'talent'
  },

  // BizOps / Strategy
  {
    id: 'fig-bizops-1',
    name: 'Danny Ainge',
    role: 'Operations Executive',
    one_liner: 'Led cross-functional teams to execute strategic initiatives',
    lane_id: 'bizops'
  },
  {
    id: 'fig-bizops-2',
    name: 'Amy Trask',
    role: 'Business Strategy Advisor',
    one_liner: 'Framed complex problems and built operating cadences',
    lane_id: 'bizops'
  },
  {
    id: 'fig-bizops-3',
    name: 'Mark Tatum',
    role: 'Deputy Commissioner',
    one_liner: 'Managed league-wide operations and strategic planning',
    lane_id: 'bizops'
  },
  {
    id: 'fig-bizops-4',
    name: 'Cathy Engelbert',
    role: 'League Commissioner',
    one_liner: 'Set strategic direction and operating priorities for the league',
    lane_id: 'bizops'
  },

  // Product / Fan Experience
  {
    id: 'fig-product-1',
    name: 'Sarah Hirshland',
    role: 'Product Strategy Director',
    one_liner: 'Designed digital experiences that enhance fan engagement',
    lane_id: 'product'
  },
  {
    id: 'fig-product-2',
    name: 'Brian Rolapp',
    role: 'Digital Product Executive',
    one_liner: 'Built products that connect fans with live sports experiences',
    lane_id: 'product'
  },
  {
    id: 'fig-product-3',
    name: 'Jessica Gelman',
    role: 'Fan Experience Lead',
    one_liner: 'Used user research to inform product development decisions',
    lane_id: 'product'
  },
  {
    id: 'fig-product-4',
    name: 'Daryl Morey',
    role: 'Product Innovation Director',
    one_liner: 'Shipped features that improve how fans consume sports',
    lane_id: 'product'
  }
]

/**
 * Get figures for a specific lane
 */
export function getFiguresByLaneId(laneId: string): NotableFigure[] {
  return figures.filter(fig => fig.lane_id === laneId)
}

