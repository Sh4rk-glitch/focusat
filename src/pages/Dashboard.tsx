import { Navigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import {
  loadHistory,
  loadSkills,
  loadStats,
  nextModeHint,
  resetProgress,
} from '../lib/storage'
import { Logo } from '../components/Logo'
import { SESSION_QUESTION_COUNT } from '../data/questions'
import { ELA_SKILLS, MATH_SKILLS, SKILL_LABELS } from '../data/catalog'
import { estimatedSatScore, masteryPct, meanRating } from '../lib/adaptive'
import { buildSuggestions } from '../lib/coach'
import type { SkillId } from '../types'

function SkillList({ ids }: { ids: SkillId[] }) {
  const skills = loadSkills()
  const rows = ids
    .map((id) => ({ id, pct: masteryPct(skills[id]) }))
    .sort((a, b) => a.pct - b.pct)
  return (
    <ul className="skill-list">
      {rows.map((r) => (
        <li key={r.id}>
          <span>{SKILL_LABELS[r.id]}</span>
          <span className="skill-bar">
            <i style={{ width: `${r.pct}%` }} />
          </span>
          <em>{r.pct}</em>
        </li>
      ))}
    </ul>
  )
}

export function Dashboard() {
  const { user, signOut, updateName } = useAuth()
  const [dark, setDark] = useState(() => localStorage.getItem('focusat-theme') !== 'light')
  const [name, setName] = useState(user?.name ?? '')
  const [settingsOpen, setSettingsOpen] = useState(false)
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])
  if (!user) return <Navigate to="/signin" replace />

  const stats = loadStats()
  const history = loadHistory()
  const skills = loadSkills()
  const tips = buildSuggestions(skills, history)
  const rec = nextModeHint()
  const math = meanRating(skills, MATH_SKILLS)
  const ela = meanRating(skills, ELA_SKILLS)
  const predictedMath = estimatedSatScore(math)
  const predictedEla = estimatedSatScore(ela)
  const accuracy =
    stats.totalQuestions === 0
      ? 0
      : Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
  const recent = history.filter((h) => !h.forfeited).slice(0, 12)
  const max = Math.max(SESSION_QUESTION_COUNT, ...recent.map((h) => h.correct), 1)

  return (
    <div className="page dash">
      <div className="aurora" aria-hidden="true">
        <span />
        <span />
      </div>
      <header className="nav">
        <Link to="/" className="logo">
          <Logo />
        </Link>
        <nav>
          <button type="button" className="ghost-link" onClick={signOut}>
            Sign out
          </button>
          <Link to={`/session?mode=${rec}`} className="nav-cta">
            Start
          </Link>
        </nav>
      </header>

      <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Dashboard
      </motion.p>
      <motion.h1
        className="dash-hello"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {user.name}, the phone can wait.
      </motion.h1>
      <div className="dash-grid">
        {[
          { n: stats.streak, l: 'day streak' },
          { n: `${accuracy}%`, l: 'lifetime accuracy' },
          { n: stats.totalSessions, l: 'sessions' },
          { n: Math.round((math + ela) / 2), l: 'mean Elo' },
        ].map((c, i) => (
          <motion.div
            key={c.l}
            className="dash-stat"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i }}
          >
            <strong>{c.n}</strong>
            <span>{c.l}</span>
          </motion.div>
        ))}
      </div>

      <motion.section
        className="score-widget"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="score-widget-copy">
          <p className="eyebrow">Algorithmic forecast</p>
          <h2>Predicted SAT score</h2>
          <p>Based on your accuracy, question difficulty, and response time. The curve is calibrated to the 200–800 section scale.</p>
        </div>
        <div className="score-total">
          <strong>{predictedMath + predictedEla}</strong>
          <span>/ 1600</span>
        </div>
        <div className="score-breakdown">
          <div><span>Math</span><strong>{predictedMath}<small>/800</small></strong></div>
          <div><span>Reading and Writing</span><strong>{predictedEla}<small>/800</small></strong></div>
        </div>
      </motion.section>

      <section className="dash-panel coach-panel">
        <h2>You vs should</h2>
        {tips.length === 0 ? (
          <p className="muted">Finish a session and the rules will compare your habits to the plan.</p>
        ) : (
          <ul className="coach-list">
            {tips.map((t) => (
              <li key={t.id}>
                <p className="you">{t.you}</p>
                <p className="should">{t.should}</p>
                <p className="why">{t.why}</p>
              </li>
            ))}
          </ul>
        )}
        <div className="hero-actions">
          <Link to={`/session?mode=${rec}`} className="btn btn-gold">
            Recommended: {rec === 'mix' ? 'Mix' : rec === 'math' ? 'Math only' : 'ELA only'}
          </Link>
          <Link to="/session" className="btn btn-ghost">
            Pick a lane
          </Link>
          <Link to="/review" className="btn btn-ghost">
            Review wrong answers
          </Link>
        </div>
      </section>

      <div className="dash-split">
        <section className="dash-panel">
          <h2>Math mastery</h2>
          <SkillList ids={MATH_SKILLS} />
        </section>
        <section className="dash-panel">
          <h2>ELA mastery</h2>
          <SkillList ids={ELA_SKILLS} />
        </section>
      </div>

      <section className="dash-panel">
        <h2>Recent scores</h2>
        {recent.length === 0 ? (
          <p className="muted">No finished sessions yet.</p>
        ) : (
          <div className="bars">
            {recent
              .slice()
              .reverse()
              .map((h) => (
                <div key={h.id} className="bar-col" title={`${h.correct}/${h.total}`}>
                  <div className="bar" style={{ height: `${(h.correct / max) * 100}%` }} />
                </div>
              ))}
          </div>
        )}
      </section>

      <section className="dash-panel">
        <h2>History</h2>
        <ul className="history">
          {history.slice(0, 10).map((h) => (
            <li key={h.id}>
              <span>
                {new Date(h.at).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
              <span>
                {h.forfeited
                  ? 'Forfeit'
                  : `${h.correct}/${h.total}${h.mode ? ` · ${h.mode}` : ''}`}
              </span>
              <span>{h.distractions} leaks</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="dash-panel settings-panel">
        <button type="button" className="settings-heading" onClick={() => setSettingsOpen((open) => !open)}>
          <h2>Settings</h2><span>{settingsOpen ? 'Hide' : 'Open'}</span>
        </button>
        {settingsOpen ? (
          <div className="settings-grid">
            <form onSubmit={(event) => { event.preventDefault(); updateName(name) }}>
              <label>Your Name<input value={name} onChange={(event) => setName(event.target.value)} /></label>
              <button type="submit" className="btn btn-ghost">Save name</button>
            </form>
            <button type="button" className="theme-toggle" onClick={(event) => {
              const next = !dark
              const button = event.currentTarget
              document.body.style.setProperty('--wave-x', `${event.clientX}px`)
              document.body.style.setProperty('--wave-y', `${event.clientY}px`)
              button.classList.remove('wave-active')
              void button.offsetWidth
              button.classList.add('wave-active')
              document.body.dataset.themeWave = next ? 'dark' : 'light'
              window.setTimeout(() => {
                delete document.body.dataset.themeWave
                button.classList.remove('wave-active')
              }, 720)
              setDark(next)
              localStorage.setItem('focusat-theme', next ? 'dark' : 'light')
            }}>
              <span className="theme-icon" aria-hidden="true">{dark ? '☼' : '☾'}</span>
              Switch to {dark ? 'light' : 'dark'} mode
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => {
              if (window.confirm('Delete all sessions, ratings, and wrong answers?')) {
                resetProgress()
                window.location.reload()
              }
            }}>Delete all progress</button>
            <button type="button" className="btn btn-ghost" onClick={signOut}>Log out</button>
          </div>
        ) : null}
      </section>
    </div>
  )
}
