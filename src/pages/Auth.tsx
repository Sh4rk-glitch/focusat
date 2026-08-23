import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/Logo'

export function AuthPage({ mode }: { mode: 'in' | 'up' }) {
  const { user, signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const next =
    (location.state as { from?: string } | null)?.from ?? '/dashboard'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={next} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'up') await signUp(name, email, password)
      else await signIn(email, password)
      navigate(next, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not continue.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page auth-page">
      <div className="aurora" aria-hidden="true">
        <span />
        <span />
      </div>
      <Link to="/" className="logo auth-logo">
        <Logo />
      </Link>
      <div className="auth-layout">
        <motion.div className="auth-pitch" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="eyebrow">Eight minutes, intelligently spent</p>
          <h1>Build a score model that knows your weak spots.</h1>
          <div className="pitch-list">
            {['A SAT estimate that updates with every answer', 'Targeted practice for grammar, math, reading, and more', 'Wrong answers saved for focused retakes'].map((item, index) => <motion.p key={item} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 * index + 0.2 }}>0{index + 1} <span>{item}</span></motion.p>)}
          </div>
        </motion.div>
        <motion.form
          className="auth-card"
          onSubmit={(e) => void submit(e)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
        <p className="eyebrow">{mode === 'up' ? 'Create account' : 'Welcome back'}</p>
        <h1>{mode === 'up' ? 'Save the streak.' : 'Pick up where you left.'}</h1>
        {mode === 'up' ? (
          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </label>
        ) : null}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'up' ? 'new-password' : 'current-password'}
            required
            minLength={6}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="btn btn-gold" disabled={busy}>
          {busy ? 'Working…' : mode === 'up' ? 'Create account' : 'Sign in'}
        </button>
        <button
          type="button"
          className="btn btn-ghost google-button"
          disabled={busy}
          onClick={() => {
            setError('')
            setBusy(true)
            void signInWithGoogle().catch((err) => {
              setError(err instanceof Error ? err.message : 'Could not continue with Google.')
              setBusy(false)
            })
          }}
        >
          <span className="google-mark" aria-hidden="true">G</span>
          Continue with Google
        </button>
        <p className="auth-switch">
          {mode === 'up' ? (
            <>
              Already here? <Link to="/signin">Sign in</Link>
            </>
          ) : (
            <>
              New? <Link to="/signup">Create an account</Link>
            </>
          )}
        </p>
        <p className="legal-note">
          Your progress syncs across devices when you use the same account.
        </p>
        </motion.form>
      </div>
    </div>
  )
}
