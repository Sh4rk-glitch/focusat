export type Section = 'Math' | 'Reading' | 'Writing'

export type SessionMode = 'mix' | 'math' | 'ela'

export type Difficulty = 'easy' | 'medium' | 'hard' | 'challenge'

export type SkillId =
  | 'linear'
  | 'percents'
  | 'functions'
  | 'quadratics'
  | 'exponents'
  | 'stats'
  | 'geometry'
  | 'systems'
  | 'probability'
  | 'inequalities'
  | 'trig'
  | 'reading-claim'
  | 'reading-vocab'
  | 'reading-structure'
  | 'writing-grammar'
  | 'writing-punct'
  | 'writing-rhetoric'

export type Question = {
  id: string
  section: Section
  prompt: string
  passage?: string
  choices: [string, string, string, string]
  answer: 0 | 1 | 2 | 3
  explain: string
  desmos?: string
}

export type User = {
  id: string
  email: string
  name: string
  avatarUrl?: string
}

export type SessionRecord = {
  id: string
  at: string
  correct: number
  total: number
  distractions: number
  forfeited: boolean
  mode?: SessionMode
  focusScore?: number
  weakSkill?: SkillId
}

export type Stats = {
  streak: number
  bestStreak: number
  lastCompletedDate: string | null
  totalSessions: number
  totalCorrect: number
  totalQuestions: number
  lastScore: number | null
  lastDistractions: number
}

export type SessionResult = {
  correct: number
  total: number
  distractions: number
  elapsedMs: number
  forfeited: boolean
  mode: SessionMode
  weakSkill?: SkillId
  focusScore: number
}

export type SkillCell = {
  rating: number
  seen: number
  correct: number
  totalTimeMs: number
  lastAt: string | null
}

export type ReviewItem = {
  id: string
  due: string
  interval: number
}

export type ItemLog = {
  id: string
  at: string
  correct: boolean
  skill: SkillId
  mode: SessionMode
  elapsedMs: number
}

export type Suggestion = {
  id: string
  you: string
  should: string
  why: string
  severity: number
}
