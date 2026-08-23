import { Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import { resetProgress } from '../lib/storage'
import { Logo } from '../components/Logo'

export function Settings() {
  const { user, signOut, updateName } = useAuth()
  const [theme, setTheme] = useState(() => localStorage.getItem('focusat-theme') ?? 'gold')
  const [name, setName] = useState(user?.name ?? '')
  const [message, setMessage] = useState('')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  if (!user) return <Navigate to="/signin" replace />

  const saveName = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      await updateName(name)
      setMessage('Name updated.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update your name.')
    }
  }

  const chooseTheme = (next: 'light' | 'dark' | 'gold') => {
    setTheme(next)
    localStorage.setItem('focusat-theme', next)
  }

  return (
    <div className="page settings-page">
      <header className="nav">
        <Link to="/" className="logo"><Logo /></Link>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <button type="button" className="ghost-link" onClick={signOut}>Log out</button>
        </nav>
      </header>
      <motion.main className="settings-content" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <p className="eyebrow">Account</p>
        <h1 className="settings-title">Settings</h1>
        <p className="muted settings-email">Signed in as {user.email}</p>
        <section className="dash-panel settings-section">
          <h2>Profile</h2>
          <form className="settings-form" onSubmit={(event) => void saveName(event)}>
            <label>Your name<input value={name} onChange={(event) => setName(event.target.value)} /></label>
            <button type="submit" className="btn btn-gold">Save name</button>
          </form>
          {message ? <p className="settings-message">{message}</p> : null}
        </section>
        <section className="dash-panel settings-section">
          <h2>Appearance</h2>
          <div className="theme-options" onMouseLeave={() => document.documentElement.removeAttribute('data-preview')}>
            {(['gold', 'dark', 'light'] as const).map((option) => (
              <button key={option} type="button" className={`theme-option ${theme === option ? 'is-active' : ''}`} onClick={() => chooseTheme(option)} onMouseEnter={() => document.documentElement.dataset.preview = option}>
                <span className={`theme-swatch theme-swatch-${option}`} aria-hidden="true" />
                <strong>{option[0].toUpperCase() + option.slice(1)}</strong>
                <small>Preview</small>
              </button>
            ))}
          </div>
        </section>
        <section className="dash-panel settings-section settings-danger">
          <h2>Progress</h2>
          <p className="muted">Delete your sessions, ratings, and wrong-answer review queue from this account.</p>
          <button type="button" className="btn btn-ghost" onClick={() => {
            if (window.confirm('Delete all sessions, ratings, and wrong answers?')) {
              resetProgress()
              window.location.reload()
            }
          }}>Delete all progress</button>
        </section>
      </motion.main>
    </div>
  )
}