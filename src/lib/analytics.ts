import type { ItemLog, SessionRecord, SkillCell, SkillId } from '../types'
import { ELA_SKILLS, MATH_SKILLS, SKILL_LABELS } from '../data/catalog'

export type AnalyticsSnapshot = {
  accuracy: number
  averageTime: number
  totalTime: number
  recentAccuracy: number
  recentAverageTime: number
  sections: { label: string; correct: number; total: number; accuracy: number }[]
  skills: { id: SkillId; label: string; correct: number; total: number; accuracy: number; averageTime: number }[]
}

function sectionForSkill(skill: SkillId): string {
  return MATH_SKILLS.includes(skill) ? 'Math' : 'Reading & Writing'
}

export function buildAnalytics(logs: ItemLog[], skillCells: Record<SkillId, SkillCell>): AnalyticsSnapshot {
  const totalTime = logs.reduce((sum, item) => sum + item.elapsedMs, 0)
  const recent = logs.slice(0, 10)
  const sections = ['Math', 'Reading & Writing'].map((label) => {
    const items = logs.filter((item) => sectionForSkill(item.skill) === label)
    const correct = items.filter((item) => item.correct).length
    return { label, correct, total: items.length, accuracy: items.length ? correct / items.length : 0 }
  })
  const skillRows = [...MATH_SKILLS, ...ELA_SKILLS].map((id) => {
    const items = logs.filter((item) => item.skill === id)
    const correct = items.filter((item) => item.correct).length
    const cell = skillCells[id]
    return { id, label: SKILL_LABELS[id], correct, total: items.length, accuracy: items.length ? correct / items.length : cell?.seen ? cell.correct / cell.seen : 0, averageTime: cell?.seen ? cell.totalTimeMs / cell.seen : 0 }
  }).filter((row) => row.total > 0 || skillCells[row.id]?.seen > 0).sort((a, b) => a.accuracy - b.accuracy || b.total - a.total)
  return {
    accuracy: logs.length ? logs.filter((item) => item.correct).length / logs.length : 0,
    averageTime: logs.length ? totalTime / logs.length : 0,
    totalTime,
    recentAccuracy: recent.length ? recent.filter((item) => item.correct).length / recent.length : 0,
    recentAverageTime: recent.length ? recent.reduce((sum, item) => sum + item.elapsedMs, 0) / recent.length : 0,
    sections,
    skills: skillRows,
  }
}

export function sessionAccuracy(session: SessionRecord): number {
  return session.total ? session.correct / session.total : 0
}