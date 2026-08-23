import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Logo } from '../components/Logo'
import { loadLeaderboard, type LeaderboardEntry } from '../lib/storage'
import { useAuth } from '../context/AuthContext'

export function Leaderboard() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    void loadLeaderboard().then(setEntries).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Leaderboard is unavailable right now.')
    })
  }, [])

  return (
    <div className="page leaderboard-page">
      <header className="nav">
        <Link to="/" className="logo"><Logo /></Link>
        <nav>
          <Link to={user ? '/dashboard' : '/signin'}>{user ? 'Dashboard' : 'Sign in'}</Link>
          <Link to="/session" className="nav-cta">Start</Link>
        </nav>
      </header>
      <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Community board</motion.p>
      <motion.h1 className="leaderboard-title" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        Answer more. Leak less.
      </motion.h1>
      <p className="leaderboard-intro">Ranked by questions answered, with fewer focus leaks breaking ties.</p>
      {error ? <p className="form-error">{error}. Run the Supabase setup SQL to enable it.</p> : null}
      <section className="leaderboard-table" aria-label="Leaderboard">
        {entries.length === 0 && !error ? <p className="muted">No ranked sessions yet. Be the first.</p> : null}
        {entries.map((entry, index) => (
          <div className={`leader-row${entry.user_id === user?.id ? ' is-you' : ''}`} key={entry.user_id}>
            <strong>{String(index + 1).padStart(2, '0')}</strong>
            <span>{entry.name}{entry.user_id === user?.id ? ' · you' : ''}</span>
            <b>{entry.questions_answered.toLocaleString()} <small>questions</small></b>
            <em>{entry.leaks} <small>leaks</small></em>
          </div>
        ))}
      </section>
    </div>
  )
}