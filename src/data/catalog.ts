import type { Question, SkillId } from '../types'

export const SKILL_LABELS: Record<SkillId, string> = {
  linear: 'Linear equations',
  percents: 'Percents & rates',
  functions: 'Linear functions',
  quadratics: 'Quadratics',
  exponents: 'Exponents',
  stats: 'Data & statistics',
  geometry: 'Geometry',
  systems: 'Systems',
  probability: 'Probability',
  inequalities: 'Inequalities',
  trig: 'Right-triangle trig',
  'reading-claim': 'Reading: claims',
  'reading-vocab': 'Reading: words in context',
  'reading-structure': 'Reading: structure',
  'writing-grammar': 'Writing: grammar',
  'writing-punct': 'Writing: punctuation',
  'writing-rhetoric': 'Writing: rhetoric',
}

export const MATH_SKILLS: SkillId[] = [
  'linear',
  'percents',
  'functions',
  'quadratics',
  'exponents',
  'stats',
  'geometry',
  'systems',
  'probability',
  'inequalities',
  'trig',
]

export const ELA_SKILLS: SkillId[] = [
  'reading-claim',
  'reading-vocab',
  'reading-structure',
  'writing-grammar',
  'writing-punct',
  'writing-rhetoric',
]

type Meta = { skill: SkillId; difficulty: 1 | 2 | 3 | 4 | 5 }

const META: Record<string, Meta> = {
  m1: { skill: 'linear', difficulty: 1 },
  m2: { skill: 'percents', difficulty: 4 },
  m3: { skill: 'functions', difficulty: 2 },
  m4: { skill: 'quadratics', difficulty: 2 },
  m5: { skill: 'percents', difficulty: 1 },
  m6: { skill: 'linear', difficulty: 2 },
  m7: { skill: 'stats', difficulty: 2 },
  m8: { skill: 'geometry', difficulty: 2 },
  m9: { skill: 'exponents', difficulty: 1 },
  m10: { skill: 'inequalities', difficulty: 2 },
  m11: { skill: 'percents', difficulty: 1 },
  m12: { skill: 'systems', difficulty: 2 },
  m13: { skill: 'probability', difficulty: 4 },
  m14: { skill: 'geometry', difficulty: 2 },
  m15: { skill: 'linear', difficulty: 2 },
  m16: { skill: 'functions', difficulty: 2 },
  m17: { skill: 'percents', difficulty: 1 },
  m18: { skill: 'exponents', difficulty: 2 },
  m19: { skill: 'stats', difficulty: 1 },
  m20: { skill: 'geometry', difficulty: 1 },
  m21: { skill: 'functions', difficulty: 1 },
  m22: { skill: 'linear', difficulty: 2 },
  m23: { skill: 'stats', difficulty: 2 },
  m24: { skill: 'quadratics', difficulty: 4 },
  m25: { skill: 'trig', difficulty: 2 },
  m26: { skill: 'quadratics', difficulty: 2 },
  m27: { skill: 'percents', difficulty: 5 },
  m28: { skill: 'linear', difficulty: 4 },
  m29: { skill: 'functions', difficulty: 3 },
  m30: { skill: 'stats', difficulty: 2 },
  m31: { skill: 'exponents', difficulty: 2 },
  m32: { skill: 'geometry', difficulty: 4 },
  r1: { skill: 'reading-claim', difficulty: 2 },
  r2: { skill: 'reading-vocab', difficulty: 2 },
  r3: { skill: 'reading-claim', difficulty: 4 },
  r4: { skill: 'reading-structure', difficulty: 2 },
  r5: { skill: 'reading-claim', difficulty: 2 },
  r6: { skill: 'reading-vocab', difficulty: 4 },
  r7: { skill: 'reading-structure', difficulty: 5 },
  r8: { skill: 'reading-claim', difficulty: 2 },
  r9: { skill: 'reading-claim', difficulty: 4 },
  r10: { skill: 'reading-structure', difficulty: 3 },
  w1: { skill: 'writing-grammar', difficulty: 1 },
  w2: { skill: 'writing-punct', difficulty: 2 },
  w3: { skill: 'writing-grammar', difficulty: 1 },
  w4: { skill: 'writing-punct', difficulty: 2 },
  w5: { skill: 'writing-rhetoric', difficulty: 2 },
  w6: { skill: 'writing-grammar', difficulty: 4 },
  w7: { skill: 'writing-grammar', difficulty: 2 },
  w8: { skill: 'writing-grammar', difficulty: 4 },
  w9: { skill: 'writing-punct', difficulty: 2 },
  w10: { skill: 'writing-rhetoric', difficulty: 5 },
  w11: { skill: 'writing-grammar', difficulty: 4 },
  w12: { skill: 'writing-grammar', difficulty: 2 },
  m33: { skill: 'systems', difficulty: 3 },
  m34: { skill: 'quadratics', difficulty: 2 },
  m35: { skill: 'geometry', difficulty: 3 },
  m36: { skill: 'percents', difficulty: 3 },
  m37: { skill: 'functions', difficulty: 2 },
  r11: { skill: 'reading-structure', difficulty: 3 },
  r12: { skill: 'reading-vocab', difficulty: 4 },
  w13: { skill: 'writing-grammar', difficulty: 2 },
  w14: { skill: 'writing-rhetoric', difficulty: 2 },
  w15: { skill: 'writing-punct', difficulty: 2 },
}

export function questionMeta(q: Question): Meta {
  if (META[q.id]) return META[q.id]
  if (q.section === 'Math') return { skill: 'linear', difficulty: 2 }
  if (q.section === 'Reading') return { skill: 'reading-claim', difficulty: 2 }
  return { skill: 'writing-grammar', difficulty: 2 }
}

export function isMathSkill(id: SkillId): boolean {
  return MATH_SKILLS.includes(id)
}
