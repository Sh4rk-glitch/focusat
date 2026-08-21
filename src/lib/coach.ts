import type { SessionMode, SessionRecord, SkillCell, SkillId, Suggestion } from '../types'
import { ELA_SKILLS, MATH_SKILLS, SKILL_LABELS } from '../data/catalog'
import { meanRating, recommendedMode, weakestSkill } from './adaptive'

function modeLabel(mode: SessionMode): string {
  if (mode === 'math') return 'Math only'
  if (mode === 'ela') return 'ELA only'
  return 'Mix (ELA + Math)'
}

function practicedSkill(
  skills: Record<SkillId, SkillCell>,
): SkillId | undefined {
  const ids = [...MATH_SKILLS, ...ELA_SKILLS]
  return ids
    .map((id) => ({ id, cell: skills[id] }))
    .filter((x) => x.cell && x.cell.seen > 0)
    .sort((a, b) => b.cell.seen - a.cell.seen)[0]?.id
}

export function buildSuggestions(
  skills: Record<SkillId, SkillCell>,
  history: SessionRecord[],
): Suggestion[] {
  const out: Suggestion[] = []
  const finished = history.filter((h) => !h.forfeited)
  const last5 = history.slice(0, 5)
  const rec = recommendedMode(skills)
  const lastMode = last5.find((h) => h.mode)?.mode
  const modes = last5.map((h) => h.mode).filter(Boolean) as SessionMode[]
  const recShare = modes.length
    ? modes.filter((m) => m === rec).length / modes.length
    : 1

  if (lastMode && lastMode !== rec && recShare < 0.5) {
    out.push({
      id: 'mode',
      you: `You keep running ${modeLabel(lastMode)} sessions.`,
      should: `Run ${modeLabel(rec)} for the next 3 sessions.`,
      why: 'Ratings are lower on that side of the test. Mixing while one side is lagging hides the gap.',
      severity: 90,
    })
  }

  const weak = weakestSkill(skills, 'mix')
  const loved = practicedSkill(skills)
  if (weak && loved && weak !== loved) {
    const wCell = skills[weak]
    const lCell = skills[loved]
    if (wCell && lCell && lCell.seen >= wCell.seen + 3 && wCell.rating + 40 < lCell.rating) {
      out.push({
        id: 'avoid',
        you: `You answer ${SKILL_LABELS[loved]} the most.`,
        should: `Bias the next session toward ${SKILL_LABELS[weak]}.`,
        why: 'The picker already up-weights misses. You still spend volume on the skill you already survive.',
        severity: 82,
      })
    }
  }

  const leakAvg =
    finished.length === 0
      ? 0
      : finished.slice(0, 8).reduce((n, h) => n + h.distractions, 0) /
        Math.min(8, finished.length)
  if (leakAvg >= 1.2) {
    out.push({
      id: 'leaks',
      you: `You average ${leakAvg.toFixed(1)} leaks per finished session.`,
      should: 'Do the next session at a desk, notifications off, before you open anything else.',
      why: 'Leak rate is costing more predicted points than a typical content miss. Content review will not fix Alt+Tab.',
      severity: 95,
    })
  }

  const forfeits = history.slice(0, 8).filter((h) => h.forfeited).length
  if (forfeits >= 2) {
    out.push({
      id: 'forfeit',
      you: `You forfeited ${forfeits} of your last ${Math.min(8, history.length)} sessions.`,
      should: 'Finish the eight minutes even if you guess. Forfeits do not train the skill model.',
      why: 'The adaptive ratings only move when you lock answers. Walking away freezes the map.',
      severity: 88,
    })
  }

  const math = meanRating(skills, MATH_SKILLS)
  const ela = meanRating(skills, ELA_SKILLS)
  if (Math.abs(math - ela) > 50 && rec === 'mix' && lastMode === 'mix') {
    out.push({
      id: 'split',
      you: 'You treat the SAT as one mixed quiz.',
      should:
        math < ela
          ? 'Isolate Math until the rating gap is under ~35 Elo.'
          : 'Isolate ELA until the rating gap is under ~35 Elo.',
      why: `Math rating ${Math.round(math)} vs ELA ${Math.round(ela)}. Mixed sessions equalize exposure, not mastery.`,
      severity: 70,
    })
  }

  const late = finished.filter((h) => new Date(h.at).getHours() >= 23)
  if (late.length >= 3 && finished.length >= 4) {
    const lateAcc =
      late.reduce((n, h) => n + h.correct / Math.max(1, h.total), 0) / late.length
    const other = finished.filter((h) => new Date(h.at).getHours() < 23)
    const dayAcc =
      other.length === 0
        ? lateAcc
        : other.reduce((n, h) => n + h.correct / Math.max(1, h.total), 0) /
          other.length
    if (lateAcc + 0.08 < dayAcc) {
      out.push({
        id: 'time',
        you: 'You practice after 11pm, when accuracy drops.',
        should: 'Move the session earlier by a few hours.',
        why: 'Same skills, worse lock-in. That is fatigue, not a content hole.',
        severity: 60,
      })
    }
  }

  if (out.length === 0 && finished.length === 0) {
    out.push({
      id: 'start',
      you: 'You have not finished a scored session yet.',
      should: 'Start with Mix once, then let the ratings tell you where to specialize.',
      why: 'The model needs a first pass over both sides of the test.',
      severity: 40,
    })
  }

  return out.sort((a, b) => b.severity - a.severity).slice(0, 4)
}
