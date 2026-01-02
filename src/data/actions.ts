/**
 * Next Actions (15-60 min) for each lane
 * Edit this file to modify actions for any lane
 */

export type Action = {
  id: string
  title: string
  minutes: number
  description: string
  deliverable: string
}

type LaneId =
  | 'partnerships'
  | 'content'
  | 'community'
  | 'growth'
  | 'nil'
  | 'talent'
  | 'bizops'
  | 'product'

/**
 * Actions organized by lane_id
 * Each lane has exactly 3 actions (15-60 min each)
 */
export const actionsByLane: Record<LaneId, Action[]> = {
  partnerships: [
    {
      id: 'action-partnerships-1',
      title: 'Research 3 potential sponsors in your target market',
      minutes: 30,
      description: 'Identify companies that align with your values and have sponsorship budgets.',
      deliverable: 'List of 3 companies with contact info and alignment notes',
    },
    {
      id: 'action-partnerships-2',
      title: 'Draft a 1-page sponsorship pitch deck',
      minutes: 45,
      description:
        'Create a concise deck highlighting audience, engagement, and ROI opportunities.',
      deliverable: '1-page PDF pitch deck',
    },
    {
      id: 'action-partnerships-3',
      title: 'Map your current partnership renewal pipeline',
      minutes: 20,
      description: 'List all active partnerships, renewal dates, and key decision-makers.',
      deliverable: 'Spreadsheet with renewal timeline and contacts',
    },
  ],
  content: [
    {
      id: 'action-content-1',
      title: 'Outline a 3-episode content series concept',
      minutes: 25,
      description: 'Define the narrative arc, key moments, and distribution strategy.',
      deliverable: '1-page series outline document',
    },
    {
      id: 'action-content-2',
      title: 'Audit your top 5 content pieces from the last quarter',
      minutes: 40,
      description: 'Analyze performance metrics and identify what resonated with your audience.',
      deliverable: 'Analysis document with insights and recommendations',
    },
    {
      id: 'action-content-3',
      title: 'Create a content calendar for the next 2 weeks',
      minutes: 30,
      description: 'Plan posts across platforms with themes, formats, and posting times.',
      deliverable: '2-week content calendar spreadsheet',
    },
  ],
  community: [
    {
      id: 'action-community-1',
      title: 'Design a member onboarding welcome sequence',
      minutes: 35,
      description: 'Create a 3-email sequence that introduces new members to key benefits.',
      deliverable: 'Email sequence template with copy and timing',
    },
    {
      id: 'action-community-2',
      title: 'Plan a virtual community event for next month',
      minutes: 45,
      description: 'Define format, agenda, speakers, and promotion strategy.',
      deliverable: 'Event plan document with logistics and timeline',
    },
    {
      id: 'action-community-3',
      title: 'Survey your community on their top 3 needs',
      minutes: 20,
      description: 'Create a short survey to understand what members value most.',
      deliverable: 'Survey form and response analysis framework',
    },
  ],
  growth: [
    {
      id: 'action-growth-1',
      title: 'Analyze pricing tiers for your next campaign',
      minutes: 40,
      description: 'Review competitor pricing and test different price points for conversion.',
      deliverable: 'Pricing analysis document with recommendations',
    },
    {
      id: 'action-growth-2',
      title: 'Map your customer journey from awareness to purchase',
      minutes: 35,
      description: 'Identify touchpoints, friction points, and optimization opportunities.',
      deliverable: 'Customer journey map diagram',
    },
    {
      id: 'action-growth-3',
      title: 'Design a retention email campaign for at-risk customers',
      minutes: 30,
      description:
        "Create a 3-email sequence to re-engage customers who haven't purchased recently.",
      deliverable: 'Email campaign template with subject lines and copy',
    },
  ],
  nil: [
    {
      id: 'action-nil-1',
      title: 'Research NIL compliance rules for your state',
      minutes: 30,
      description:
        'Understand current regulations and any recent changes affecting student-athletes.',
      deliverable: 'Compliance summary document with key rules',
    },
    {
      id: 'action-nil-2',
      title: 'Create a student-athlete partnership proposal template',
      minutes: 45,
      description: 'Develop a standard template for approaching and structuring NIL deals.',
      deliverable: 'Partnership proposal template document',
    },
    {
      id: 'action-nil-3',
      title: 'Map your athletic department stakeholder network',
      minutes: 25,
      description: 'Identify key contacts in compliance, coaching, and administration.',
      deliverable: 'Stakeholder contact list with roles and relationships',
    },
  ],
  talent: [
    {
      id: 'action-talent-1',
      title: 'Research 5 creators in your target niche',
      minutes: 30,
      description: 'Identify talent whose audience and values align with your brand.',
      deliverable: 'Creator research document with contact info and alignment notes',
    },
    {
      id: 'action-talent-2',
      title: 'Draft a standard talent partnership agreement outline',
      minutes: 40,
      description: 'Create a template covering deliverables, compensation, and exclusivity terms.',
      deliverable: 'Partnership agreement outline document',
    },
    {
      id: 'action-talent-3',
      title: 'Plan a multi-channel campaign rollout for a talent partnership',
      minutes: 35,
      description: 'Define content formats, posting schedule, and cross-platform promotion.',
      deliverable: 'Campaign rollout plan with timeline and deliverables',
    },
  ],
  bizops: [
    {
      id: 'action-bizops-1',
      title: 'Frame a strategic problem using a structured framework',
      minutes: 45,
      description:
        'Apply a problem-solving framework (e.g., 5 Whys, Issue Tree) to a current challenge.',
      deliverable: 'Problem framing document with root cause analysis',
    },
    {
      id: 'action-bizops-2',
      title: 'Design a weekly operating cadence for your team',
      minutes: 30,
      description: 'Create meeting structure, agenda templates, and decision-making processes.',
      deliverable: 'Operating cadence document with meeting templates',
    },
    {
      id: 'action-bizops-3',
      title: 'Map cross-functional dependencies for a key initiative',
      minutes: 40,
      description: 'Identify stakeholders, handoffs, and potential bottlenecks across teams.',
      deliverable: 'Dependency map diagram with stakeholder roles',
    },
  ],
  product: [
    {
      id: 'action-product-1',
      title: 'Conduct 3 user interviews to understand fan pain points',
      minutes: 60,
      description: 'Schedule and conduct interviews, then synthesize key insights.',
      deliverable: 'User research summary with key quotes and themes',
    },
    {
      id: 'action-product-2',
      title: 'Design a new feature concept with wireframes',
      minutes: 45,
      description: 'Create low-fidelity wireframes for a feature that addresses a user need.',
      deliverable: 'Wireframe mockups (3-5 screens)',
    },
    {
      id: 'action-product-3',
      title: 'Write a product requirements document for a small feature',
      minutes: 35,
      description: 'Define user stories, acceptance criteria, and success metrics.',
      deliverable: 'PRD document with user stories and metrics',
    },
  ],
}

/**
 * Get actions for a specific lane
 */
export function getActionsByLaneId(laneId: string): Action[] {
  return actionsByLane[laneId as LaneId] || []
}
