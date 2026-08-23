import { Navigate, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import {
  loadHistory,
  loadItemLog,
  loadSkills,
  loadStats,
  nextModeHint,
} from '../lib/storage'
import { Logo } from '../components/Logo'
import { ELA_SKILLS, MATH_SKILLS, SKILL_LABELS } from '../data/catalog'
import { estimatedTotalScore, masteryPct, meanRating } from '../lib/adaptive'
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

function ProfileAvatar({ user }: { user: { name: string; avatarUrl?: string } }) {
  return user.avatarUrl
    ? <img className="profile-avatar" src={user.avatarUrl} alt="" />
    : <span className="profile-avatar profile-initials">{user.name.slice(0, 1).toUpperCase()}</span>
}

export function Dashboard() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/signin" replace />

  const stats = loadStats()
  const history = loadHistory()
  const skills = loadSkills()
  const tips = buildSuggestions(skills, history)
  const rec = nextModeHint()
  const math = meanRating(skills, MATH_SKILLS)
  const ela = meanRating(skills, ELA_SKILLS)
  const itemLog = loadItemLog()
  const averageTime = itemLog.length
    ? itemLog.reduce((sum, item) => sum + item.elapsedMs, 0) / itemLog.length
    : 0
  const predictedTotal = estimatedTotalScore(stats.totalCorrect, stats.totalQuestions, averageTime)
  const accuracy =
    stats.totalQuestions === 0
      ? 0
      : Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
  const hasPractice = stats.totalQuestions > 0
  const recent = history.filter((h) => !h.forfeited).slice(0, 12)

  if (!hasPractice) {
    return (
      <div className="page dash diagnostic-welcome">
        <header className="nav">
          <Link to="/" className="logo"><Logo /></Link>
          <nav><Link to="/settings" className="profile-link" aria-label="Open settings"><ProfileAvatar user={user} /></Link></nav>
        </header>
        <motion.main initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <p className="eyebrow">First session</p>
          <h1 className="dash-hello">Let’s find your starting line, {user.name}.</h1>
          <p className="diagnostic-copy">8 minutes, 8 questions. Thats all it takes to get your predicted score.</p>
          <div className="diagnostic-facts">
            <span><strong>8</strong> SAT questions</span>
            <span><strong>8</strong>minutes long.</span>
          </div>
          <Link to="/session?diagnostic=1" className="btn btn-gold diagnostic-start">Start diagnostic <span className="btn-shine" /></Link>
          <p className="muted diagnostic-note">Your dashboard will appear after your first completed diagnostic.</p>
        </motion.main>
      </div>
    )
  }

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
          <Link to="/settings" className="profile-link" aria-label="Open settings"><ProfileAvatar user={user} /></Link>
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
      <div className="dashboard-primary-action">
        <Link to={`/session?mode=${rec}`} className="btn btn-gold">
          Start recommended {rec === 'mix' ? 'mix' : rec === 'math' ? 'math' : 'ELA'} session
          <span className="btn-shine" />
        </Link>
        <span className="muted">Built from your latest answers and response times.</span>
      </div>
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
          <strong>{predictedTotal}</strong>
          <span>/ 1600</span>
        </div>
        <div className="score-breakdown">
          <div><span>Math</span><strong>{Math.round(predictedTotal / 2 / 10) * 10}<small>/800</small></strong></div>
          <div><span>Reading and Writing</span><strong>{Math.round(predictedTotal / 2 / 10) * 10}<small>/800</small></strong></div>
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
          <Link to="/leaderboard" className="btn btn-ghost">
            Leaderboard
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
          <div className="score-list">
            {recent.map((h, index) => {
                const newer = recent[index - 1]
                const sessionTime = itemLog.filter((item) =>
                  new Date(item.at) <= new Date(h.at) &&
                  (!newer || new Date(item.at) < new Date(newer.at)),
                )
                const sessionAverage = sessionTime.length
                  ? sessionTime.reduce((sum, item) => sum + item.elapsedMs, 0) / sessionTime.length
                  : 0
                const score = estimatedTotalScore(h.correct, h.total, sessionAverage)
                return <div key={h.id} className="score-row" title={`${score}/1600 · ${h.correct}/${h.total}`}>
                  <div className="score-row-meta"><strong>{score}</strong><span>{h.correct}/{h.total} correct</span><time>{new Date(h.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time></div>
                  <div className="score-track"><i style={{ width: `${(score / 1600) * 100}%` }} /></div>
                </div>
              })}
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

    </div>
  )
}
