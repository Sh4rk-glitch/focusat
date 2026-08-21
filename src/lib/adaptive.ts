import type { Difficulty, Question, ReviewItem, SessionMode, SkillCell, SkillId } from '../types'
import { QUESTIONS } from '../data/questions'
import { ELA_SKILLS, MATH_SKILLS, questionMeta } from '../data/catalog'

const START = 1000
const K = 28

export function emptySkill(now: string | null = null): SkillCell {
  return { rating: START, seen: 0, correct: 0, totalTimeMs: 0, lastAt: now }
}

export function emptySkills(): Record<SkillId, SkillCell> {
  const ids = [...MATH_SKILLS, ...ELA_SKILLS]
  return Object.fromEntries(ids.map((id) => [id, emptySkill()])) as Record<
    SkillId,
    SkillCell
  >
}

function oppRating(difficulty: number): number {
  return 720 + difficulty * 150
}

export function applyAnswer(
  skills: Record<SkillId, SkillCell>,
  question: Question,
  correct: boolean,
  elapsedMs = 0,
): Record<SkillId, SkillCell> {
  const { skill, difficulty } = questionMeta(question)
  const prev = skills[skill] ?? emptySkill()
  const expected =
    1 / (1 + 10 ** ((oppRating(difficulty) - prev.rating) / 400))
  const score = correct ? 1 : 0
  const next: SkillCell = {
    rating: Math.round(prev.rating + K * (score - expected)),
    seen: prev.seen + 1,
    correct: prev.correct + (correct ? 1 : 0),
    totalTimeMs: prev.totalTimeMs + Math.max(0, elapsedMs),
    lastAt: new Date().toISOString(),
  }
  return { ...skills, [skill]: next }
}

export function difficultyLabel(difficulty: number): Difficulty {
  if (difficulty <= 1) return 'easy'
  if (difficulty <= 3) return 'medium'
  if (difficulty === 4) return 'hard'
  return 'challenge'
}

export function estimatedSatScore(rating: number): number {
  const curve = 1 / (1 + Math.exp(-(rating - 1000) / 190))
  return Math.max(200, Math.min(800, Math.round(200 + curve * 600)))
}

export function updateReview(
  review: ReviewItem[],
  questionId: string,
  correct: boolean,
): ReviewItem[] {
  const today = new Date()
  const rest = review.filter((r) => r.id !== questionId)
  if (!correct) {
    const due = new Date(today)
    due.setDate(due.getDate() + 1)
    return [...rest, { id: questionId, due: due.toISOString(), interval: 1 }]
  }
  const hit = review.find((r) => r.id === questionId)
  if (!hit) return rest
  const interval = Math.min(21, Math.max(2, Math.round(hit.interval * 2.2)))
  const due = new Date(today)
  due.setDate(due.getDate() + interval)
  return [...rest, { id: questionId, due: due.toISOString(), interval }]
}

function inMode(q: Question, mode: SessionMode): boolean {
  if (mode === 'math') return q.section === 'Math'
  if (mode === 'ela') return q.section !== 'Math'
  return true
}

function daysSince(iso: string | null): number {
  if (!iso) return 10
  return Math.max(0, (Date.now() - new Date(iso).getTime()) / 86_400_000)
}

function weight(
  q: Question,
  skills: Record<SkillId, SkillCell>,
  due: boolean,
): number {
  const meta = questionMeta(q)
  const cell = skills[meta.skill] ?? emptySkill()
  const weakness = Math.exp(-(cell.rating - START) / 110)
  const stale = 0.55 + Math.min(4, daysSince(cell.lastAt)) / 5
  const target = cell.rating
  const item = oppRating(meta.difficulty)
  const fit = 1 / (1 + Math.abs(item - target) / 220)
  const averageTime = cell.seen ? cell.totalTimeMs / cell.seen : 0
  const slowResponseBoost = averageTime > 30_000 ? 1 + Math.min(1.4, (averageTime - 30_000) / 30_000) : 1
  const reviewBoost = due ? 1.85 : 1
  return Math.max(0.05, weakness * stale * fit * slowResponseBoost * reviewBoost)
}

function pickWeighted(items: { q: Question; w: number }[]): Question {
  const sum = items.reduce((n, i) => n + i.w, 0)
  let r = Math.random() * sum
  for (const item of items) {
    r -= item.w
    if (r <= 0) return item.q
  }
  return items[items.length - 1].q
}

export function pickNextQuestion(opts: {
  mode: SessionMode
  usedIds: string[]
  skills: Record<SkillId, SkillCell>
  review: ReviewItem[]
  difficulty?: Difficulty | 'all'
  allowedIds?: string[]
}): Question {
  const used = new Set(opts.usedIds)
  const now = Date.now()
  const dueIds = new Set(
    opts.review.filter((r) => new Date(r.due).getTime() <= now).map((r) => r.id),
  )
  let pool = QUESTIONS.filter((q) => {
    if (opts.allowedIds && !opts.allowedIds.includes(q.id)) return false
    if (!inMode(q, opts.mode) || used.has(q.id)) return false
    return !opts.difficulty || opts.difficulty === 'all' || difficultyLabel(questionMeta(q).difficulty) === opts.difficulty
  })
  if (pool.length === 0 && opts.difficulty && opts.difficulty !== 'all') {
    pool = QUESTIONS.filter((q) => inMode(q, opts.mode) && !used.has(q.id) && (!opts.allowedIds || opts.allowedIds.includes(q.id)))
  }
  if (pool.length === 0) {
    pool = QUESTIONS.filter((q) => inMode(q, opts.mode))
  }
  if (Math.random() < 0.12) {
    return pool[Math.floor(Math.random() * pool.length)]
  }
  const weighted = pool.map((q) => ({
    q,
    w: weight(q, opts.skills, dueIds.has(q.id)),
  }))
  return pickWeighted(weighted)
}

export function weakestSkill(
  skills: Record<SkillId, SkillCell>,
  mode: SessionMode,
): SkillId | undefined {
  const ids =
    mode === 'math' ? MATH_SKILLS : mode === 'ela' ? ELA_SKILLS : [...MATH_SKILLS, ...ELA_SKILLS]
  const ranked = ids
    .map((id) => skills[id] ?? emptySkill())
    .map((cell, i) => ({ id: ids[i], cell }))
    .filter((x) => x.cell.seen > 0)
    .sort((a, b) => a.cell.rating - b.cell.rating)
  return ranked[0]?.id
}

export function meanRating(skills: Record<SkillId, SkillCell>, ids: SkillId[]): number {
  const cells = ids.map((id) => skills[id] ?? emptySkill())
  const seen = cells.filter((c) => c.seen > 0)
  const use = seen.length ? seen : cells
  return use.reduce((n, c) => n + c.rating, 0) / use.length
}

export function recommendedMode(skills: Record<SkillId, SkillCell>): SessionMode {
  const math = meanRating(skills, MATH_SKILLS)
  const ela = meanRating(skills, ELA_SKILLS)
  if (math < ela - 35) return 'math'
  if (ela < math - 35) return 'ela'
  return 'mix'
}

export function focusScore(correct: number, total: number, leaks: number, forfeited: boolean): number {
  if (total <= 0) return 0
  const acc = correct / total
  const leakMul = Math.exp(-leaks * 0.2)
  const finishMul = forfeited ? 0.35 : 1
  return Math.max(0, Math.min(100, Math.round(100 * acc * leakMul * finishMul)))
}

export function masteryPct(cell: SkillCell): number {
  const fromElo = 1 / (1 + Math.exp(-(cell.rating - START) / 90))
  const fromAcc = cell.seen === 0 ? 0.45 : cell.correct / cell.seen
  const blend = 0.65 * fromElo + 0.35 * fromAcc
  return Math.round(100 * blend)
}
