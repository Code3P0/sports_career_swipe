import type { Project } from '@/types/data'

export const projects: Project[] = [
  {
    id: 'sports-analytics-player-performance-model',
    careerId: 'sports-analytics',
    title: 'Player Performance Prediction Model',
    difficulty: 'intermediate',
    timeEstimate: '6–10 hours',
    description: 'Build a simple model that predicts a player performance metric (e.g., points/usage/efficiency) using historical game logs. Focus on clean data, clear features, and honest evaluation.',
    skills: [
      'data cleaning',
      'feature engineering',
      'model evaluation',
      'Python or R',
      'sports domain intuition'
    ],
    deliverable: 'A short write-up + notebook with model results and takeaways.'
  },
  {
    id: 'sports-analytics-game-strategy-dashboard',
    careerId: 'sports-analytics',
    title: 'In‑Game Strategy Dashboard',
    difficulty: 'intermediate',
    timeEstimate: '4–8 hours',
    description: 'Create a dashboard that summarizes lineup performance, shot profile, or win probability swings. Prioritize usability: what would a coach look at in 60 seconds?',
    skills: [
      'data visualization',
      'dashboarding',
      'SQL',
      'communication'
    ],
    deliverable: 'A dashboard (Tableau/Power BI) or a lightweight web dashboard with a 1‑page explainer.'
  },
  {
    id: 'sports-agent-contract-clause-playbook',
    careerId: 'sports-agent',
    title: 'Contract Clause Playbook',
    difficulty: 'intermediate',
    timeEstimate: '3–6 hours',
    description: 'Write a plain‑English playbook of common contract clauses (termination, exclusivity, moral clauses, deliverables) and how they shift leverage in negotiations.',
    skills: [
      'negotiation',
      'contract literacy',
      'research',
      'writing'
    ],
    deliverable: 'A 2–4 page PDF playbook with clause examples and negotiation notes.'
  },
  {
    id: 'sports-agent-sponsorship-valuation',
    careerId: 'sports-agent',
    title: 'Sponsorship Valuation Report',
    difficulty: 'advanced',
    timeEstimate: '6–12 hours',
    description: 'Build a valuation template for an athlete sponsorship (audience, engagement, deliverables, usage rights) and turn it into a pricing recommendation and negotiation strategy.',
    skills: [
      'pricing & valuation',
      'market research',
      'Excel/Sheets modeling',
      'proposal writing'
    ],
    deliverable: 'A valuation model + a 1‑page pricing recommendation memo.'
  },
  {
    id: 'sports-marketing-team-rebrand-campaign',
    careerId: 'sports-marketing',
    title: 'Team Rebrand Campaign Plan',
    difficulty: 'intermediate',
    timeEstimate: '4–8 hours',
    description: 'Design a launch plan for a hypothetical rebrand: positioning, creative direction, channel plan, timeline, and success metrics.',
    skills: [
      'campaign planning',
      'creative briefing',
      'channel strategy',
      'measurement'
    ],
    deliverable: 'A 6–10 slide deck or 1‑page campaign brief.'
  },
  {
    id: 'sports-marketing-esports-crossover',
    careerId: 'sports-marketing',
    title: 'Esports Crossover Marketing Strategy',
    difficulty: 'intermediate',
    timeEstimate: '4–8 hours',
    description: 'Propose a crossover activation between a sports property and an esports org: audience overlap, activation concept, partner inventory, and measurement plan.',
    skills: [
      'partnership strategy',
      'audience research',
      'brand activation',
      'storytelling'
    ],
    deliverable: 'A partnership one‑pager + activation concept mockups.'
  }
]
