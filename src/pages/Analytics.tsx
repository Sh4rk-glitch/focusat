import { Link, Navigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/Logo'
import { loadItemLog } from '../lib/storage'
import { QUESTIONS } from '../data/questions'
import { questionMeta, SKILL_LABELS } from '../data/catalog'
import { buildAnalytics } from '../lib/analytics'
import { loadHistory, loadSkills } from '../lib/storage'
import { estimatedTotalScore } from '../lib/adaptive'

function formatTime(milliseconds: number): string {
  const seconds = Math.max(0, Math.round(milliseconds / 1000))
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

function expectedTime(difficulty: number): number {
  if (difficulty <= 1) return 30_000
  if (difficulty <= 3) return 45_000
  if (difficulty === 4) return 60_000
  return 75_000
}

export function Analytics() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/signin" replace />
  const logs = loadItemLog()
  const rows = logs.map((item) => {
    const question = QUESTIONS.find((candidate) => candidate.id === item.id)
    const meta = question ? questionMeta(question) : null
    const threshold = meta ? expectedTime(meta.difficulty) : 45_000
    return { ...item, question, meta, slow: item.elapsedMs > threshold }
  })
  const totalTime = logs.reduce((sum, item) => sum + item.elapsedMs, 0)
  const averageTime = logs.length ? totalTime / logs.length : 0
  const flagged = rows.filter((row) => row.slow).length
  const history = loadHistory()
  const analytics = buildAnalytics(logs, loadSkills())
  const attempts = history.slice().reverse().map((session, index) => ({ index: index + 1, score: estimatedTotalScore(session.correct, session.total, logs.find((item) => item.at === session.at)?.elapsedMs ?? 45_000) }))
  const graphWidth = 720
  const graphHeight = 260
  const graphPoint = (attempt: { index: number; score: number }) => `${attempts.length > 1 ? (attempt.index - 1) / (attempts.length - 1) * graphWidth : graphWidth / 2},${graphHeight - (Math.max(400, Math.min(1600, attempt.score)) - 400) / 1200 * graphHeight}`

  return (
    <div className="page analytics-page">
      <header className="nav">
        <Link to="/" className="logo"><Logo /></Link>
        <nav><Link to="/dashboard">Dashboard</Link><Link to="/settings" className="profile-link">Profile</Link></nav>
      </header>
      <motion.main initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <p className="eyebrow">Performance lab</p>
        <Link to="/dashboard" className="btn btn-ghost back-link">← Back to dashboard</Link>
        <h1 className="analytics-title">Your practice, question by question.</h1>
        <div className="analytics-summary">
          <div><strong>{logs.length}</strong><span>questions</span></div>
          <div><strong>{formatTime(totalTime)}</strong><span>total practice</span></div>
          <div><strong>{formatTime(averageTime)}</strong><span>average answer</span></div>
          <div><strong>{flagged}</strong><span>timing flags</span></div>
        </div>
        <section className="analytics-overview">
          <div className="analytics-chart analytics-trend"><div className="panel-heading"><div><p className="eyebrow">Trend</p><h2>Predicted SAT score</h2></div><strong>{attempts.length ? attempts[attempts.length - 1].score : 400}</strong></div><div className="score-graph"><div className="score-axis">{[1600, 1200, 800, 400].map((score) => <span key={score}>{score}</span>)}</div><svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} role="img" aria-label="Predicted SAT score by practice attempt"><path d="M0 0V260H720" className="graph-axis" />{[0, 1, 2, 3].map((line) => <line key={line} x1="0" x2="720" y1={line * graphHeight / 3} y2={line * graphHeight / 3} className="graph-gridline" />)}{attempts.length > 1 ? <polyline points={attempts.map(graphPoint).join(' ')} className="score-line" /> : null}{attempts.map((attempt) => <circle key={attempt.index} cx={graphPoint(attempt).split(',')[0]} cy={graphPoint(attempt).split(',')[1]} r="4" className="score-dot" />)}</svg><div className="attempt-axis">{attempts.map((attempt) => <span key={attempt.index}>{attempt.index}</span>)}</div></div><p className="muted">Attempts <span className="graph-y-label">SAT score</span></p></div>
          <div className="analytics-chart"><div className="panel-heading"><div><p className="eyebrow">By section</p><h2>Where points live</h2></div></div>{analytics.sections.map((section) => <div className="section-meter" key={section.label}><div><span>{section.label}</span><strong>{section.total ? `${Math.round(section.accuracy * 100)}%` : '—'}</strong></div><i><b style={{ width: `${section.accuracy * 100}%` }} /></i></div>)}</div>
        </section>
        <section className="analytics-chart analytics-skills"><div className="panel-heading"><div><p className="eyebrow">Skill map</p><h2>Strengths and gaps</h2></div><span className="muted">{analytics.skills.length} skills tracked</span></div>{analytics.skills.length ? analytics.skills.map((skill) => <div className="skill-meter" key={skill.id}><span>{skill.label}</span><i><b style={{ width: `${skill.accuracy * 100}%` }} /></i><strong>{Math.round(skill.accuracy * 100)}%</strong></div>) : <p className="muted">Complete a few questions to map your skills.</p>}</section>
        {rows.length === 0 ? <p className="muted">Complete a session to see your answer-level analytics.</p> : (
          <section className="analytics-list">
            {rows.map((row, index) => (
              <article className={`analytics-row ${row.slow ? 'is-flagged' : ''}`} key={`${row.id}-${row.at}-${index}`}>
                <div className="analytics-row-top"><span>{String(rows.length - index).padStart(2, '0')} · {row.meta ? SKILL_LABELS[row.meta.skill] : 'Question'}</span><time>{new Date(row.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time></div>
                <h2>{row.question?.prompt ?? `Question ${row.id}`}</h2>
                <div className="analytics-row-bottom"><strong>{row.correct ? 'Correct' : 'Incorrect'}</strong><span>{formatTime(row.elapsedMs)} spent</span>{row.slow ? <em>Review timing</em> : <em>On pace</em>}</div>
              </article>
            ))}
          </section>
        )}
      </motion.main>
    </div>
  )
}
