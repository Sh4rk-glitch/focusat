import { Navigate, Link } from 'react-router-dom'
import { motion, AnimatePresence, type Variants } from 'motion/react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  loadHistory,
  loadItemLog,
  loadSkills,
  loadStats,
} from '../lib/storage'
import { Logo } from '../components/Logo'
import { FocusCoinIcon } from '../components/FocusCoinIcon'
import { estimatedTotalScore } from '../lib/adaptive'
import { FirstTimeTutorial } from '../components/FirstTimeTutorial'
import { buildAnalytics, sessionAccuracy } from '../lib/analytics'
import { buildSuggestions } from '../lib/coach'

// ⚙️ CONFIGURE BUILD DURATION HERE (in seconds)
const BUILD_SEQUENCE_DURATION = 1.2

function ProfileAvatar({ user }: { user: { name: string; avatarUrl?: string } }) {
  const [imageFailed, setImageFailed] = useState(false)

  if (user.avatarUrl && !imageFailed) {
    return (
      <img
        className="profile-avatar"
        src={user.avatarUrl}
        alt={user.name}
        onError={() => setImageFailed(true)}
      />
    )
  }

  return (
    <span className="profile-avatar profile-initials">
      {user.name.slice(0, 1).toUpperCase()}
    </span>
  )
}

function monthDays(date: Date): Date[] {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const count = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  return Array.from({ length: count }, (_, index) => new Date(first.getFullYear(), first.getMonth(), index + 1))
}

function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function Dashboard() {
  const { user } = useAuth()
  
  const [introDone, setIntroDone] = useState(() => {
    return sessionStorage.getItem('focusat-dash-intro-done') === 'true'
  })

  const [tutorialOpen, setTutorialOpen] = useState(() => user ? localStorage.getItem(`focusat-tutorial:${user.id}`) !== 'done' : false)
  const [streakMenuOpen, setStreakMenuOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => new Date())
  const [now] = useState(() => Date.now())

  useEffect(() => {
    if (!introDone) {
      const timer = window.setTimeout(() => {
        sessionStorage.setItem('focusat-dash-intro-done', 'true')
        setIntroDone(true)
      }, 3100)
      return () => window.clearTimeout(timer)
    }
  }, [introDone])

  if (!user) return <Navigate to="/signin" replace />

  const stats = loadStats()
  const itemLog = loadItemLog()
  const history = loadHistory()
  const skillCells = loadSkills()
  const analytics = buildAnalytics(itemLog, skillCells)
  const suggestions = buildSuggestions(skillCells, history)
  const weekStart = now - 6 * 24 * 60 * 60 * 1000
  const weekItems = itemLog.filter((item) => new Date(item.at).getTime() >= weekStart)
  const weekSessions = history.filter((session) => new Date(session.at).getTime() >= weekStart).length
  const weekGoal = 5
  const averageTime = itemLog.length
    ? itemLog.reduce((sum, item) => sum + item.elapsedMs, 0) / itemLog.length
    : 0
  const predictedTotal = estimatedTotalScore(stats.totalCorrect, stats.totalQuestions, averageTime)
  const today = new Date().toDateString()
  const completedDays = new Set(history.filter((session) => !session.forfeited).map((session) => localDayKey(new Date(session.at))))
  const calendarDays = monthDays(viewDate)
  const studiedDays = completedDays.size
  const practicedToday = itemLog.filter((item) => new Date(item.at).toDateString() === today).reduce((sum, item) => sum + item.elapsedMs, 0)
  const hasPractice = stats.totalQuestions > 0

  const finishTutorial = () => {
    localStorage.setItem(`focusat-tutorial:${user.id}`, 'done')
    setTutorialOpen(false)
  }

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const stepStagger = BUILD_SEQUENCE_DURATION / 10

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stepStagger,
        delayChildren: 0.05,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 22, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: Math.max(0.35, stepStagger * 2.2),
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  if (!hasPractice) {
    return (
      <div className={`page dash diagnostic-welcome ${introDone ? 'landing-is-ready' : 'landing-is-intro'}`}>
        <AnimatePresence>
          {!introDone ? (
            <motion.div className="landing-intro" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.55 }}>
              <motion.div
                className="landing-intro-logo"
                initial={{ scale: 0.35, opacity: 0, y: 24 }}
                animate={{ scale: [0.35, 1, 1, 0.55], opacity: [0, 1, 1, 0], y: [24, 0, 0, -8], x: [0, 0, 0, 0] }}
                transition={{ duration: 2.85, times: [0, 0.2, 0.7, 1], ease: [0.22, 1, 0.36, 1] }}
              >
                <Logo />
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: [0, 1, 1, 0], y: [18, 0, 0, -12] }} transition={{ duration: 2.4, times: [0, 0.25, 0.68, 1], delay: 0.25 }}>
                8 minutes is all it takes.
              </motion.h1>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <header className="nav">
          <Link to="/" className="logo"><Logo /></Link>
          <nav>
            <Link to="/settings" className="profile-link" aria-label="Open settings">
              <ProfileAvatar user={user} />
            </Link>
          </nav>
        </header>
        <motion.main initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <p className="eyebrow">First session</p>
          <h1 className="dash-hello">Let’s find your starting line, {user.name}.</h1>
          <p className="diagnostic-copy">8 minutes, 8 questions. That's all it takes to get your predicted score.</p>
          <div className="diagnostic-facts">
            <span><strong>8</strong> SAT questions</span>
            <span><strong>8</strong> minutes long.</span>
          </div>
          <Link to="/session?diagnostic=1" className="btn btn-gold diagnostic-start">
            Start diagnostic <span className="btn-shine" />
          </Link>
          <p className="muted diagnostic-note">Your dashboard will appear after your first completed diagnostic.</p>
        </motion.main>
        {tutorialOpen ? <FirstTimeTutorial onDone={finishTutorial} /> : null}
      </div>
    )
  }

  return (
    <div className={`page dash ${introDone ? 'landing-is-ready' : 'landing-is-intro'}`}>
      <AnimatePresence>
        {!introDone ? (
          <motion.div className="landing-intro" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.55 }}>
            <motion.div
              className="landing-intro-logo"
              initial={{ scale: 0.35, opacity: 0, y: 24 }}
              animate={{ scale: [0.35, 1, 1, 0.55], opacity: [0, 1, 1, 0], y: [24, 0, 0, -8], x: [0, 0, 0, 0] }}
              transition={{ duration: 2.85, times: [0, 0.2, 0.7, 1], ease: [0.22, 1, 0.36, 1] }}
            >
              <Logo />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: [0, 1, 1, 0], y: [18, 0, 0, -12] }} transition={{ duration: 2.4, times: [0, 0.25, 0.68, 1], delay: 0.25 }}>
              8 minutes is all it takes.
            </motion.h1>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="aurora" aria-hidden="true">
        <span />
        <span />
      </div>

      <header className="nav">
        <Link to="/" className="logo">
          <Logo />
        </Link>
        <nav>
          <div className="header-streak" onMouseEnter={() => setStreakMenuOpen(true)} onMouseLeave={() => setStreakMenuOpen(false)}>
            <button type="button" className="header-streak-trigger" aria-expanded={streakMenuOpen} onFocus={() => setStreakMenuOpen(true)} onClick={() => setStreakMenuOpen((open) => !open)}>🔥 {stats.streak}</button>
            {streakMenuOpen ? (
              <div className="streak-popover header-streak-popover" onMouseEnter={() => setStreakMenuOpen(true)}>
                <strong>🔥 {stats.streak}</strong>
                <p>{stats.streak ? 'Keep the momentum going.' : 'Start your streak today.'}</p>
                <button type="button" className="btn btn-ghost" onClick={() => { setCalendarOpen(true); setStreakMenuOpen(false) }}>View calendar</button>
              </div>
            ) : null}
          </div>
          <Link to="/shop" className="header-points">
            <FocusCoinIcon size={16} /> {stats.points}
          </Link>
          <Link to="/inventory">Inventory</Link>
          <Link to="/settings" className="profile-link" aria-label="Open settings">
            <ProfileAvatar user={user} />
          </Link>
        </nav>
      </header>

      {/* Sequentially Assembled Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <motion.p className="eyebrow" variants={itemVariants}>
          Dashboard
        </motion.p>
        
        <motion.h1 className="dash-hello" variants={itemVariants}>
          {user.name}, the phone can wait.
        </motion.h1>

        <motion.div className="dash-grid" variants={itemVariants}>
          {[
            { n: `${Math.round(practicedToday / 60000)}m`, l: 'practiced today' },
            { n: predictedTotal, l: 'predicted SAT score' },
          ].map((c) => (
            <div key={c.l} className="dash-stat">
              <strong>{c.n}</strong><span>{c.l}</span>
            </div>
          ))}
        </motion.div>

        <motion.section className="dashboard-links" variants={itemVariants}>
          <Link to="/session?mode=mix" className="btn btn-gold">Start practice <span className="btn-shine" /></Link>
          <Link to="/analytics" className="btn btn-ghost">Open analytics</Link>
          <Link to="/shop" className="btn btn-ghost">Shop <FocusCoinIcon size={14} /></Link>
          <span className="dashboard-links-note">Your next eight minutes are enough.</span>
        </motion.section>

        <div className="dashboard-content">
          <motion.section className="dash-panel dashboard-focus" variants={itemVariants}>
            <div className="panel-heading"><div><p className="eyebrow">Next move</p><h2>{analytics.skills[0] ? `Strengthen ${analytics.skills[0].label}` : 'Build your baseline'}</h2></div><span className="panel-index">01</span></div>
            <p className="muted">{analytics.skills[0] ? `${Math.round(analytics.skills[0].accuracy * 100)}% accuracy across ${analytics.skills[0].total} logged questions. A short targeted drill will move this fastest.` : 'Finish a diagnostic to unlock your personal accuracy, pacing, and skill map.'}</p>
            <Link to={`/session?mode=${analytics.skills[0] && !analytics.skills[0].id.startsWith('reading-') && !analytics.skills[0].id.startsWith('writing-') ? 'math' : 'ela'}`} className="text-link">Practice this area <span>→</span></Link>
          </motion.section>

          <motion.section className="dash-panel" variants={itemVariants}>
            <div className="panel-heading"><div><p className="eyebrow">Scorecard</p><h2>How the work is landing</h2></div><Link to="/analytics" className="text-link">Full report <span>→</span></Link></div>
            <div className="dashboard-metrics"><div><strong>{Math.round(analytics.accuracy * 100)}%</strong><span>all-time accuracy</span></div><div><strong>{Math.round(analytics.recentAccuracy * 100)}%</strong><span>last 10 accuracy</span></div><div><strong>{stats.totalSessions}</strong><span>sessions finished</span></div><div><strong>{stats.lastDistractions}</strong><span>last session leaks</span></div></div>
          </motion.section>

          <motion.section className="dash-panel" variants={itemVariants}>
            <div className="panel-heading"><div><p className="eyebrow">Recent rhythm</p><h2>Session history</h2></div></div>
            {history.length ? <ul className="history">{history.slice(0, 4).map((session) => <li key={session.id}><span>{session.mode === 'mix' ? 'Mixed practice' : session.mode === 'math' ? 'Math practice' : 'ELA practice'}</span><strong>{Math.round(sessionAccuracy(session) * 100)}%</strong><time>{new Date(session.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time></li>)}</ul> : <p className="muted">Your completed sessions will appear here.</p>}
          </motion.section>

          <motion.section className="dash-panel dashboard-modes" variants={itemVariants}>
            <div className="panel-heading"><div><p className="eyebrow">Choose your lane</p><h2>Practice with intent</h2></div></div>
            <div className="mode-grid mode-grid-inline" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <Link to="/session?mode=mix" className="mode-card"><strong>Mixed</strong><span>Keep both sides warm.</span><em>8 questions →</em></Link>
              <Link to="/session?mode=math" className="mode-card"><strong>Math</strong><span>Work through the numbers.</span><em>8 questions →</em></Link>
              <Link to="/session?mode=ela" className="mode-card"><strong>Reading & Writing</strong><span>Sharpen the language side.</span><em>8 questions →</em></Link>
              <Link to="/doomscroll" className="mode-card" style={{ borderColor: 'rgba(228, 188, 106, 0.45)' }}><strong>DoomScroll 📱</strong><span>Infinite vertical SAT reels.</span><em>Mobile only →</em></Link>
            </div>
          </motion.section>

          <div className="dashboard-lower">
            <motion.div className="dash-panel" variants={itemVariants}>
              <div className="panel-heading"><div><p className="eyebrow">Skill pulse</p><h2>Your current map</h2></div><Link to="/analytics" className="text-link">See all <span>→</span></Link></div>
              {analytics.skills.length ? <ul className="skill-list">{analytics.skills.slice(0, 5).map((skill) => <li key={skill.id}><span>{skill.label}</span><i className="skill-bar"><b style={{ width: `${skill.accuracy * 100}%` }} /></i><em>{Math.round(skill.accuracy * 100)}%</em></li>)}</ul> : <p className="muted">Your skill map will grow with every answer.</p>}
            </motion.div>

            <motion.div className="dash-panel dashboard-coach" variants={itemVariants}>
              <div className="panel-heading"><div><p className="eyebrow">This week</p><h2>Keep your focus warm</h2></div><span className="panel-index">02</span></div>
              <div className="weekly-progress"><div><span>{weekSessions} of {weekGoal} sessions</span><strong>{Math.min(100, Math.round(weekSessions / weekGoal * 100))}%</strong></div><i><b style={{ width: `${Math.min(100, weekSessions / weekGoal * 100)}%` }} /></i></div>
              <div className="weekly-stats"><span><strong>{weekItems.length}</strong> questions</span><span><strong>{Math.round(weekItems.reduce((sum, item) => sum + item.elapsedMs, 0) / 60000)}m</strong> practiced</span></div>
              <p className="should">{suggestions[0]?.should ?? 'Start a session and let the data point the way.'}</p>
              <p className="why">{suggestions[0]?.why ?? 'Your first answers create the baseline for focused recommendations.'}</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Calendar Modal */}
      {calendarOpen ? (
        <div className="calendar-modal-backdrop" role="presentation" onClick={() => setCalendarOpen(false)}>
          <section className="streak-calendar" aria-label="Daily streak calendar" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="calendar-close" aria-label="Close calendar" onClick={() => setCalendarOpen(false)}>×</button>
            
            <div className="streak-calendar-heading">
              <div>
                <p className="eyebrow">Streak calendar</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2>{viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
                  <div className="calendar-nav-buttons" style={{ display: 'inline-flex', gap: '4px' }}>
                    <button type="button" className="btn btn-ghost" style={{ padding: '2px 8px' }} onClick={prevMonth}>‹</button>
                    <button type="button" className="btn btn-ghost" style={{ padding: '2px 8px' }} onClick={nextMonth}>›</button>
                  </div>
                </div>
              </div>
              <span><i className="fire-icon" aria-hidden="true">🔥</i> practiced <b className="empty-day" aria-hidden="true" /> missed</span>
            </div>

            <div className="calendar-grid">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <span className="calendar-weekday" key={`${day}-${index}`}>{day}</span>
              ))}
              {Array.from({ length: calendarDays[0].getDay() }, (_, index) => (
                <span className="calendar-blank" key={`blank-${index}`} />
              ))}
              {calendarDays.map((day) => {
                const isPracticed = completedDays.has(localDayKey(day))
                return (
                  <span
                    className={`calendar-day ${isPracticed ? 'is-complete' : ''} ${localDayKey(day) === localDayKey(new Date()) ? 'is-today' : ''}`}
                    key={day.toISOString()}
                    title={`${day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${isPracticed ? 'streak day' : 'missed'}`}
                  >
                    <b aria-hidden="true">{isPracticed ? '🔥' : ''}</b>
                    <small>{day.getDate()}</small>
                  </span>
                )
              })}
            </div>
            
            <div className="streak-summary">
              <div><strong>{studiedDays}</strong><span>Days studied</span></div>
              <div><strong>{stats.bestStreak}</strong><span>Longest streak</span></div>
            </div>
          </section>
        </div>
      ) : null}

      {tutorialOpen ? <FirstTimeTutorial onDone={finishTutorial} /> : null}
    </div>
  )
}