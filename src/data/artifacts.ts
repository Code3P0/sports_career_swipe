/**
 * Artifact templates for each lane
 * Ready-to-ship templates users can copy and fill in
 */

type ArtifactContext = {
  topLaneName: string
  topLaneDesc: string
  runnerUpLaneName?: string
  actions: Array<{ title: string; minutes: number; description: string; deliverable: string }>
}

export type ArtifactTemplate = {
  id: string
  lane_id: string
  title: string
  estimated_minutes: number
  template: (ctx: ArtifactContext) => string
}

const artifacts: ArtifactTemplate[] = [
  {
    id: 'artifact-partnerships',
    lane_id: 'partnerships',
    title: 'Sponsorship Pitch Deck',
    estimated_minutes: 30,
    template: (ctx) => {
      return `SPONSORSHIP PITCH: ${ctx.topLaneName}

TL;DR:
A partnership opportunity that aligns [your brand/entity] with [partner brand] to drive value through [key benefit].

Overview:
${ctx.topLaneDesc}

Why this partnership:
• [Your unique value prop]
• [Target audience alignment]
• [Engagement opportunity]

What we're offering:
• [Package details]
• [Deliverables]

Next steps:
${ctx.actions.map((a, i) => `${i + 1}. ${a.title}`).join('\n')}

Deliverable checklist:
• [ ] 1-page sponsorship pitch deck
• [ ] List of 5 target sponsors with contact info
• [ ] Tiered offer structure (3 tiers)

Estimated timeline: [X weeks/months]
Budget ask: $[amount]

Let's discuss how this partnership can drive value.

---

Share caption (LinkedIn):
Built a sponsorship pitch deck today to practice the ${ctx.topLaneName} lane.

What's inside:
• 1-page pitch template with value props
• List of 5 target sponsors with alignment notes
• Tiered offer structure (bronze/silver/gold)

What's the biggest mistake you see in sponsorship pitches? #Partnerships #SportsBusiness
`
    },
  },
  {
    id: 'artifact-content',
    lane_id: 'content',
    title: 'Content Strategy Brief',
    estimated_minutes: 30,
    template: (ctx) => {
      return `CONTENT STRATEGY: ${ctx.topLaneName}

TL;DR:
A content strategy that leverages [key format/channel] to engage [target audience] and drive [primary goal] through consistent, valuable storytelling.

Objective:
${ctx.topLaneDesc}

Content pillars:
1. [Pillar 1 - e.g., Behind-the-scenes]
2. [Pillar 2 - e.g., Athlete stories]
3. [Pillar 3 - e.g., Fan engagement]

Distribution channels:
• [Primary platform]
• [Secondary platform]
• [Owned channels]

Immediate actions:
${ctx.actions.map((a, i) => `${i + 1}. ${a.title}`).join('\n')}

Deliverable checklist:
• [ ] 4-week content calendar (1-pager)
• [ ] Content pillar definitions (3 bullets each)
• [ ] KPI sketch with 3 target metrics

Success metrics:
• [Metric 1]
• [Metric 2]

Timeline: [X weeks]

---

Share caption (LinkedIn):
Built a content strategy brief today to practice the ${ctx.topLaneName} lane.

What's inside:
• 4-week content calendar template
• 3 content pillars with definitions
• KPI sketch with target metrics

Which content format gets the most engagement in your lane? #ContentStrategy #SportsMarketing
`
    },
  },
  {
    id: 'artifact-community',
    lane_id: 'community',
    title: 'Community Program Plan',
    estimated_minutes: 30,
    template: (ctx) => {
      return `COMMUNITY PROGRAM: ${ctx.topLaneName}

TL;DR:
A community program that brings together [target group] through [key activities] to build lasting relationships and drive [primary outcome].

Mission:
${ctx.topLaneDesc}

Program structure:
• [Event type 1]
• [Event type 2]
• [Ongoing engagement]

Target audience:
[Describe your community]

Key activities:
${ctx.actions.map((a, i) => `${i + 1}. ${a.title}`).join('\n')}

Deliverable checklist:
• [ ] Program structure outline (1-pager)
• [ ] Event script template for first event
• [ ] Community guidelines draft (3 sections)

Resources needed:
• [Resource 1]
• [Resource 2]

Launch date: [Date]

---

Share caption (LinkedIn):
Built a community program plan today to practice the ${ctx.topLaneName} lane.

What's inside:
• Program structure with 3 event types
• Event script template for launch
• Community guidelines draft

What's the hardest part of building community from scratch? #CommunityBuilding #SportsCommunity
`
    },
  },
  {
    id: 'artifact-growth',
    lane_id: 'growth',
    title: 'Growth Campaign Brief',
    estimated_minutes: 30,
    template: (ctx) => {
      return `GROWTH CAMPAIGN: ${ctx.topLaneName}

TL;DR:
A growth campaign targeting [primary KPI] through [key channels] to drive [specific outcome] within [timeline].

Goal:
${ctx.topLaneDesc}

Target metrics:
• [Primary KPI]
• [Secondary KPI]

Campaign elements:
${ctx.actions.map((a, i) => `${i + 1}. ${a.title}`).join('\n')}

Deliverable checklist:
• [ ] Campaign brief (1-pager)
• [ ] Channel mix recommendation (3 channels)
• [ ] KPI tracking sheet template

Channels:
• [Channel 1]
• [Channel 2]

Timeline: [X weeks]
Budget: $[amount]

Success criteria:
[Define what success looks like]

---

Share caption (LinkedIn):
Built a growth campaign brief today to practice the ${ctx.topLaneName} lane.

What's inside:
• Campaign brief template
• Channel mix recommendation (3 channels)
• KPI tracking sheet

What channel drives the best ROI for your growth campaigns? #GrowthMarketing #SportsBusiness
`
    },
  },
  {
    id: 'artifact-nil',
    lane_id: 'nil',
    title: 'NIL Program Framework',
    estimated_minutes: 30,
    template: (ctx) => {
      return `NIL PROGRAM: ${ctx.topLaneName}

TL;DR:
An NIL program that connects [athletes/students] with [brands/opportunities] while ensuring full compliance and maximizing value for all parties.

Scope:
${ctx.topLaneDesc}

Program components:
• [Component 1]
• [Component 2]

Athlete selection criteria:
[Criteria]

Partnership structure:
[Structure details]

Action items:
${ctx.actions.map((a, i) => `${i + 1}. ${a.title}`).join('\n')}

Deliverable checklist:
• [ ] NIL program framework (1-pager)
• [ ] Athlete selection criteria checklist
• [ ] Compliance checklist (5 key points)

Compliance:
• [Compliance point 1]
• [Compliance point 2]

Launch: [Date]

---

Share caption (LinkedIn):
Built an NIL program framework today to practice the ${ctx.topLaneName} lane.

What's inside:
• Program framework outline
• Athlete selection criteria checklist
• Compliance checklist (5 key points)

What's the biggest compliance risk you see in NIL programs? #NIL #CollegeAthletics
`
    },
  },
  {
    id: 'artifact-talent',
    lane_id: 'talent',
    title: 'Talent Partnership Proposal',
    estimated_minutes: 30,
    template: (ctx) => {
      return `TALENT PARTNERSHIP: ${ctx.topLaneName}

TL;DR:
A talent partnership that aligns [talent name] with [brand/entity] to reach [target audience] and drive [primary goal] through authentic collaboration.

Partnership overview:
${ctx.topLaneDesc}

Talent alignment:
• [Why this talent fits]
• [Audience overlap]
• [Brand values match]

Proposed collaboration:
${ctx.actions.map((a, i) => `${i + 1}. ${a.title}`).join('\n')}

Deliverable checklist:
• [ ] Talent partnership proposal (1-pager)
• [ ] Content collaboration brief template
• [ ] Compensation structure outline (3 tiers)

Deliverables:
• [Deliverable 1]
• [Deliverable 2]

Timeline: [X months]
Compensation: [Structure]

Next steps:
[Action items]

---

Share caption (LinkedIn):
Built a talent partnership proposal today to practice the ${ctx.topLaneName} lane.

What's inside:
• Partnership proposal template
• Content collaboration brief
• Compensation structure (3 tiers)

How do you evaluate talent fit beyond follower count? #TalentPartnerships #SportsMarketing
`
    },
  },
  {
    id: 'artifact-bizops',
    lane_id: 'bizops',
    title: 'Strategic Initiative Brief',
    estimated_minutes: 30,
    template: (ctx) => {
      return `STRATEGIC INITIATIVE: ${ctx.topLaneName}

TL;DR:
An initiative that addresses [problem] through [solution approach] to achieve [primary outcome] within [timeline].

Problem statement:
[Define the problem]

Solution approach:
${ctx.topLaneDesc}

Key activities:
${ctx.actions.map((a, i) => `${i + 1}. ${a.title}`).join('\n')}

Deliverable checklist:
• [ ] Initiative brief (1-pager)
• [ ] Problem statement + solution sketch
• [ ] Success metrics worksheet (3 KPIs)

Stakeholders:
• [Stakeholder 1]
• [Stakeholder 2]

Success metrics:
• [Metric 1]
• [Metric 2]

Timeline: [X weeks]
Resources: [What's needed]

Risks & mitigation:
[Key risks and how to address]

---

Share caption (LinkedIn):
Built an initiative brief today to practice the ${ctx.topLaneName} lane.

What's inside:
• Problem statement + solution sketch
• Initiative brief template
• Success metrics worksheet (3 KPIs)

What's the hardest part of getting stakeholder buy-in on new initiatives? #BusinessStrategy #SportsBusiness
`
    },
  },
  {
    id: 'artifact-product',
    lane_id: 'product',
    title: 'Product Feature Brief',
    estimated_minutes: 30,
    template: (ctx) => {
      return `PRODUCT FEATURE: ${ctx.topLaneName}

TL;DR:
A product feature that solves [user problem] by [solution approach] to improve [user outcome] and drive [business metric].

Feature overview:
${ctx.topLaneDesc}

User problem:
[What problem does this solve?]

Solution:
[How this feature addresses the problem]

Key actions:
${ctx.actions.map((a, i) => `${i + 1}. ${a.title}`).join('\n')}

Deliverable checklist:
• [ ] Feature brief (1-pager)
• [ ] User flow sketch (3 steps)
• [ ] Success criteria worksheet

User stories:
• [Story 1]
• [Story 2]

Success criteria:
• [Criterion 1]
• [Criterion 2]

Timeline: [X weeks]

---

Share caption (LinkedIn):
Built a product feature brief today to practice the ${ctx.topLaneName} lane.

What's inside:
• Feature brief template
• User flow sketch (3 steps)
• Success criteria worksheet

What's the biggest gap between user research and what actually ships? #ProductManagement #SportsTech
`
    },
  },
]

/**
 * Get artifact template for a lane
 */
export function getArtifactForLane(laneId: string): ArtifactTemplate | undefined {
  return artifacts.find((a) => a.lane_id === laneId)
}
