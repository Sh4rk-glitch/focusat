import { useEffect, useMemo, useState } from 'react'
import { motion, useSpring, useTransform } from 'motion/react'
import { Link, useLocation } from 'react-router-dom'
import { loadHistory, loadSkills, loadStats, nextModeHint } from '../lib/storage'
import { SESSION_QUESTION_COUNT } from '../data/questions'
import { SKILL_LABELS } from '../data/catalog'
import { buildSuggestions } from '../lib/coach'
import { useAuth } from '../context/AuthContext'
import type { SessionMode, SkillId } from '../types'

type ResultState = {
  correct: number
  total: number
  distractions: number
  forfeited: boolean
  remaining: number
  mode?: SessionMode
  focusScore?: number
  weakSkill?: SkillId
}

function CountUp({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 80, damping: 18 })
  const shown = useTransform(spring, (v) => Math.round(v))
  const [n, setN] = useState(0)

  useEffect(() => {
    spring.set(value)
    const unsub = shown.on('change', setN)
    return () => unsub()
  }, [shown, spring, value])

  return <>{n}</>
}

export function Results() {
  const { user } = useAuth()
  const location = useLocation()
  const state = location.state as ResultState | null
  const stats = loadStats()
  const hint = nextModeHint()
  const tips = buildSuggestions(loadSkills(), loadHistory())

  const view = useMemo(() => {
    if (state) return state
    return {
      correct: stats.lastScore ?? 0,
      total: SESSION_QUESTION_COUNT,
      distractions: stats.lastDistractions,
      forfeited: false,
      remaining: 0,
      focusScore: undefined,
      weakSkill: undefined,
    }
  }, [state, stats.lastDistractions, stats.lastScore])

  const denom = Math.max(1, view.total)
  const pct = Math.round((view.correct / denom) * 100)

  return (
    <div className="page results">
      <div className="orb orb-a" />
      <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {view.forfeited ? 'Session forfeited' : 'Session complete'}
      </motion.p>
      <motion.h1
        className="display score-display"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <CountUp value={view.correct} />
        <span>/{view.total || 0}</span>
      </motion.h1>
      <p className="lede">
        {view.forfeited
          ? 'No streak. Forfeits do not move the skill ratings.'
          : view.weakSkill
            ? `Next items will lean into ${SKILL_LABELS[view.weakSkill]}.`
            : pct >= 75
              ? 'Sharp. Do not cash that in for a three-hour scroll.'
              : 'You showed up. The model now knows a little more about you.'}
      </p>

      <motion.div
        className="stat-row"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <strong>{view.forfeited ? '—' : stats.streak}</strong>
          <span>day streak</span>
        </div>
        <div>
          <strong>{view.distractions}</strong>
          <span>focus leaks</span>
        </div>
        <div>
          <strong>{view.focusScore ?? '—'}</strong>
          <span>focus score</span>
        </div>
      </motion.div>

      {tips[0] ? (
        <section className="coach-card">
          <p className="eyebrow">You vs should</p>
          <p className="you">{tips[0].you}</p>
          <p className="should">{tips[0].should}</p>
          <p className="why">{tips[0].why}</p>
        </section>
      ) : null}

      <div className="hero-actions">
        <Link to={`/session?mode=${hint}`} className="btn btn-gold">
          Next: {hint === 'mix' ? 'Mix' : hint === 'math' ? 'Math' : 'ELA'}
        </Link>
        <Link to={user ? '/dashboard' : '/signup'} className="btn btn-ghost">
          {user ? 'Dashboard' : 'Sign in to save'}
        </Link>
      </div>
    </div>
  )
}
