export interface Card {
  id: string
  type: 'interest' | 'values' | 'scenario' | 'skills'
  content: string
  detail?: string
  careerWeights: Record<string, number> // career-id -> weight 0-1
}

export interface Career {
  id: string
  slug: string
  name: string
  category: 'data' | 'media' | 'business' | 'operations' | 'talent' | 'tech'
  tagline: string
  description: string
  whatYouDo: string[]
  salaryRange: { entry: string; mid: string; senior: string }
  pathIn: { entryRoles: string[]; timeline: string; requiredSkills: string[] }
  topCompanies: string[]
  relatedCareers: string[]
  dayInLife: string
  prosAndCons: { pros: string[]; cons: string[] }
}

export interface Visionary {
  id: string
  name: string
  title: string
  company: string
  careerId: string
  category: string
  bio: string
  keyInsight: string
  notableAchievement?: string
  twitter?: string
}

export interface Company {
  id: string
  name: string
  category: string
  description: string
  headquarters?: string
  careers: string[] // career IDs this company hires for
  website?: string
}

export interface Resource {
  careerId: string
  courses: { name: string; platform: string; url?: string }[]
  books: { title: string; author: string }[]
  podcasts: { name: string; url?: string }[]
  newsletters: { name: string; url?: string }[]
}

export interface Project {
  id: string
  careerId: string
  title: string
  difficulty: 'starter' | 'intermediate' | 'advanced'
  timeEstimate: string
  description: string
  skills: string[]
  deliverable: string
}

