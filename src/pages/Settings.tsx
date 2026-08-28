import { Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import { resetProgress, loadItemLog, loadStats } from '../lib/storage'
import { Logo } from '../components/Logo'
import { FocusCoinIcon } from '../components/FocusCoinIcon'

interface RippleState {
  theme: 'gold' | 'dark' | 'light'
  x: number
  y: number
  scrollY: number
}

interface ThemeVariables {
  bg: string
  text: string
  textMuted: string
  panelBg: string
  panelBorder: string
  accent: string
  accentText: string
  inputBg: string
  inputBorder: string
}

const THEME_STYLES: Record<'gold' | 'dark' | 'light', ThemeVariables> = {
  gold: {
    bg: 'radial-gradient(circle at center, #1b160e 0%, #0d0a06 100%)',
    text: '#fbf5eb',
    textMuted: '#9e917d',
    panelBg: 'rgba(28, 23, 17, 0.72)',
    panelBorder: 'rgba(229, 169, 60, 0.22)',
    accent: '#e5a93c',
    accentText: '#1b160e',
    inputBg: 'rgba(255, 255, 255, 0.04)',
    inputBorder: 'rgba(229, 169, 60, 0.3)',
  },
  dark: {
    bg: '#09090b',
    text: '#f4f4f5',
    textMuted: '#71717a',
    panelBg: 'rgba(18, 18, 21, 0.85)',
    panelBorder: 'rgba(255, 255, 255, 0.1)',
    accent: '#ffffff',
    accentText: '#09090b',
    inputBg: 'rgba(255, 255, 255, 0.05)',
    inputBorder: 'rgba(255, 255, 255, 0.15)',
  },
  light: {
    bg: '#f8f9fa',
    text: '#18181b',
    textMuted: '#64748b',
    panelBg: '#ffffff',
    panelBorder: 'rgba(0, 0, 0, 0.08)',
    accent: '#0284c7',
    accentText: '#ffffff',
    inputBg: '#f1f5f9',
    inputBorder: '#cbd5e1',
  },
}

function CalendarIcon({ color = 'currentColor', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle', display: 'inline-block' }}
    >
      <path
        d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="15" r="1" fill={color} />
      <circle cx="12" cy="15" r="1" fill={color} />
      <circle cx="16" cy="15" r="1" fill={color} />
      <circle cx="8" cy="18" r="1" fill={color} />
      <circle cx="12" cy="18" r="1" fill={color} />
    </svg>
  )
}

function getMonthDays(date: Date): Date[] {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const count = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  return Array.from({ length: count }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1))
}

export function Settings() {
  const { user, signOut, updateName } = useAuth()
  const [theme, setTheme] = useState<'gold' | 'dark' | 'light'>(
    () => (localStorage.getItem('focusat-theme') as 'gold' | 'dark' | 'light') ?? 'gold'
  )
  const [name, setName] = useState(user?.name ?? '')
  const [message, setMessage] = useState('')
  const [hoverRipple, setHoverRipple] = useState<RippleState | null>(null)
  const [stats] = useState(() => loadStats())

  // Targets & Custom Calendar
  const [targetScore, setTargetScore] = useState(() => localStorage.getItem('focusat-target-score') ?? '1500')
  const [testDate, setTestDate] = useState(() => localStorage.getItem('focusat-test-date') ?? '')
  const [calendarPickerOpen, setCalendarPickerOpen] = useState(false)
  const [calendarViewDate, setCalendarViewDate] = useState(() => (testDate ? new Date(testDate) : new Date()))

  // Toggles
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('focusat-sound') !== 'false')
  const [antiDistraction, setAntiDistraction] = useState(() => localStorage.getItem('focusat-anti-distract') === 'true')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  if (!user) return <Navigate to="/signin" replace />

  const saveName = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      await updateName(name)
      setMessage('Profile name updated.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update your name.')
    }
  }

  const handleHoverTheme = (event: React.MouseEvent<HTMLButtonElement>, option: 'gold' | 'dark' | 'light') => {
    if (option === theme) return
    const rect = event.currentTarget.getBoundingClientRect()
    setHoverRipple({
      theme: option,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      scrollY: window.scrollY,
    })
  }

  const clearHoverTheme = () => {
    setHoverRipple(null)
  }

  const chooseTheme = (next: 'gold' | 'dark' | 'light') => {
    setTheme(next)
    localStorage.setItem('focusat-theme', next)
    setHoverRipple(null)
  }

  const selectDate = (date: Date) => {
    const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    setTestDate(formatted)
    localStorage.setItem('focusat-test-date', formatted)
    setCalendarPickerOpen(false)
  }

  const exportUserData = () => {
    const data = {
      stats: loadStats(),
      items: loadItemLog(),
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `focusat-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const monthDaysList = getMonthDays(calendarViewDate)

  const renderView = (mode: 'gold' | 'dark' | 'light', isClone = false, offsetScroll = 0) => {
    const t = THEME_STYLES[mode]

    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          background: t.bg,
          color: t.text,
          transition: 'color 0.2s ease',
          pointerEvents: isClone ? 'none' : 'auto',
          boxSizing: 'border-box',
          padding: '24px 20px 80px',
          transform: isClone ? `translateY(-${offsetScroll}px)` : 'none',
        }}
      >
        <header
          style={{
            maxWidth: '1080px',
            margin: '0 auto 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link to="/" style={{ color: t.text, textDecoration: 'none' }}><Logo /></Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link
              to="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                border: `1px solid ${t.panelBorder}`,
                background: t.inputBg,
                color: t.text,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              <FocusCoinIcon size={16} />
              <span>{stats.points} FocusPoints</span>
            </Link>
            <Link to="/dashboard" style={{ color: t.text, textDecoration: 'none' }}>Dashboard</Link>
            <button type="button" className="ghost-link" onClick={signOut} style={{ color: t.textMuted }}>Log out</button>
          </nav>
        </header>

        <div
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: calendarPickerOpen ? 'minmax(0, 1fr) 340px' : 'minmax(0, 1fr)',
            gap: '32px',
            alignItems: 'start',
            transition: 'grid-template-columns 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Main Settings Panel */}
          <main style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <p className="eyebrow" style={{ color: t.accent, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 6px' }}>Account</p>
              <h1 style={{ fontFamily: 'var(--font-serif, serif)', fontSize: '2.4rem', margin: '0 0 8px', color: t.text }}>Settings</h1>
              <p style={{ color: t.textMuted, margin: 0 }}>Signed in as {user.email}</p>
            </div>

            {/* Profile */}
            <section
              style={{
                background: t.panelBg,
                border: `1px solid ${t.panelBorder}`,
                borderRadius: '16px',
                padding: '24px',
                backdropFilter: 'blur(16px)',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', margin: '0 0 16px', color: t.text }}>Profile</h2>
              <form className="settings-form" onSubmit={(event) => void saveName(event)}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: t.textMuted, fontSize: '0.9rem' }}>
                  Your name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    style={{
                      background: t.inputBg,
                      border: `1px solid ${t.inputBorder}`,
                      borderRadius: '10px',
                      padding: '12px 16px',
                      color: t.text,
                      outline: 'none',
                    }}
                  />
                </label>
                <button type="submit" className="btn btn-gold" style={{ marginTop: '16px' }}>Save name</button>
              </form>
              {message ? <p className="settings-message" style={{ marginTop: '12px', color: t.accent }}>{message}</p> : null}
            </section>

            {/* Appearance */}
            <section
              style={{
                background: t.panelBg,
                border: `1px solid ${t.panelBorder}`,
                borderRadius: '16px',
                padding: '24px',
                backdropFilter: 'blur(16px)',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', margin: '0 0 16px', color: t.text }}>Appearance</h2>
              <div className="theme-options" onMouseLeave={clearHoverTheme} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                {(['gold', 'dark', 'light'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`theme-option ${theme === option ? 'is-active' : ''}`}
                    onClick={() => chooseTheme(option)}
                    onMouseEnter={(e) => handleHoverTheme(e, option)}
                    style={{
                      background: t.inputBg,
                      border: `1px solid ${theme === option ? t.accent : t.panelBorder}`,
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      textAlign: 'left',
                      color: t.text,
                    }}
                  >
                    <span className={`theme-swatch theme-swatch-${option}`} aria-hidden="true" style={{ width: '100%', height: '36px', borderRadius: '6px', display: 'block' }} />
                    <strong style={{ fontSize: '0.95rem' }}>{option[0].toUpperCase() + option.slice(1)}</strong>
                    <small style={{ color: t.textMuted }}>{theme === option ? 'Active' : 'Preview'}</small>
                  </button>
                ))}
              </div>
            </section>

            {/* Practice Targets */}
            <section
              style={{
                background: t.panelBg,
                border: `1px solid ${t.panelBorder}`,
                borderRadius: '16px',
                padding: '24px',
                backdropFilter: 'blur(16px)',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', margin: '0 0 16px', color: t.text }}>Practice Targets</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: t.textMuted, fontWeight: 500 }}>Target SAT Score</label>
                  <input
                    type="number"
                    min="400"
                    max="1600"
                    step="10"
                    value={targetScore}
                    onChange={(e) => {
                      setTargetScore(e.target.value)
                      localStorage.setItem('focusat-target-score', e.target.value)
                    }}
                    style={{
                      background: t.inputBg,
                      border: `1px solid ${t.inputBorder}`,
                      borderRadius: '10px',
                      padding: '12px 16px',
                      color: t.text,
                      fontSize: '1rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: t.textMuted, fontWeight: 500 }}>Official Test Date</label>
                  <button
                    type="button"
                    onClick={() => setCalendarPickerOpen((o) => !o)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: t.inputBg,
                      border: `1px solid ${calendarPickerOpen ? t.accent : t.inputBorder}`,
                      borderRadius: '10px',
                      padding: '12px 16px',
                      color: testDate ? t.text : t.textMuted,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span>{testDate ? new Date(testDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select test date'}</span>
                    <motion.div
                      animate={calendarPickerOpen ? { x: 8, scale: 1.15 } : { x: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <CalendarIcon color={calendarPickerOpen ? t.accent : t.textMuted} size={18} />
                    </motion.div>
                  </button>
                </div>
              </div>
            </section>

            {/* Focus Guard & Audio */}
            <section
              style={{
                background: t.panelBg,
                border: `1px solid ${t.panelBorder}`,
                borderRadius: '16px',
                padding: '24px',
                backdropFilter: 'blur(16px)',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', margin: '0 0 16px', color: t.text }}>Focus Guard & Audio</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <strong style={{ fontSize: '0.95rem', color: t.text }}>Sound Effects & Audio Cues</strong>
                    <span style={{ fontSize: '0.85rem', color: t.textMuted }}>Play subtle ticks on answers, countdown alerts, and completed drills.</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={soundEnabled}
                    onClick={() => {
                      setSoundEnabled(!soundEnabled)
                      localStorage.setItem('focusat-sound', String(!soundEnabled))
                    }}
                    style={{
                      width: '48px',
                      height: '26px',
                      borderRadius: '13px',
                      background: soundEnabled ? t.accent : t.inputBg,
                      border: `1px solid ${t.panelBorder}`,
                      position: 'relative',
                      cursor: 'pointer',
                      flexShrink: 0,
                      padding: 0,
                    }}
                  >
                    <motion.span
                      style={{
                        display: 'block',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: soundEnabled ? t.accentText : '#ffffff',
                        position: 'absolute',
                        top: '2px',
                        left: '2px',
                      }}
                      animate={{ x: soundEnabled ? 22 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <strong style={{ fontSize: '0.95rem', color: t.text }}>Anti-Distraction Lock (Tab Tracking)</strong>
                    <span style={{ fontSize: '0.85rem', color: t.textMuted }}>Count tab switches or loss of focus as distraction leaks during timed sessions.</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={antiDistraction}
                    onClick={() => {
                      setAntiDistraction(!antiDistraction)
                      localStorage.setItem('focusat-anti-distract', String(!antiDistraction))
                    }}
                    style={{
                      width: '48px',
                      height: '26px',
                      borderRadius: '13px',
                      background: antiDistraction ? t.accent : t.inputBg,
                      border: `1px solid ${t.panelBorder}`,
                      position: 'relative',
                      cursor: 'pointer',
                      flexShrink: 0,
                      padding: 0,
                    }}
                  >
                    <motion.span
                      style={{
                        display: 'block',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: antiDistraction ? t.accentText : '#ffffff',
                        position: 'absolute',
                        top: '2px',
                        left: '2px',
                      }}
                      animate={{ x: antiDistraction ? 22 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Data & Reset */}
            <section
              style={{
                background: t.panelBg,
                border: `1px solid rgba(239, 68, 68, 0.25)`,
                borderRadius: '16px',
                padding: '24px',
                backdropFilter: 'blur(16px)',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', margin: '0 0 8px', color: t.text }}>Data & Progress</h2>
              <p style={{ color: t.textMuted, margin: '0 0 16px', fontSize: '0.9rem' }}>Export your logged questions or purge your history from this device.</p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-ghost" onClick={exportUserData}>
                  Export session data (.json)
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                  onClick={() => {
                    if (window.confirm('Delete all sessions, ratings, and wrong answers? This cannot be undone.')) {
                      resetProgress()
                      window.location.reload()
                    }
                  }}
                >
                  Delete all progress
                </button>
              </div>
            </section>
          </main>

          {/* Right Side Expanded Themed Calendar */}
          <AnimatePresence>
            {calendarPickerOpen && (
              <motion.aside
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: t.panelBg,
                  border: `1px solid ${t.panelBorder}`,
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(20px)',
                  position: 'sticky',
                  top: '24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <p className="eyebrow" style={{ color: t.accent, margin: 0, fontSize: '0.75rem' }}>Schedule Target</p>
                    <h3 style={{ margin: '4px 0 0', fontSize: '1.15rem', color: t.text }}>
                      {calendarViewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1))}
                      style={{ background: t.inputBg, border: `1px solid ${t.panelBorder}`, color: t.text, borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' }}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1))}
                      style={{ background: t.inputBg, border: `1px solid ${t.panelBorder}`, color: t.text, borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' }}
                    >
                      ›
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i} style={{ fontSize: '0.75rem', color: t.textMuted, padding: '4px 0', fontWeight: 600 }}>{d}</span>
                  ))}
                  {Array.from({ length: monthDaysList[0].getDay() }).map((_, i) => (
                    <span key={`blank-${i}`} />
                  ))}
                  {monthDaysList.map((day) => {
                    const dateString = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
                    const isSelected = testDate === dateString
                    return (
                      <button
                        key={dateString}
                        type="button"
                        onClick={() => selectDate(day)}
                        style={{
                          background: isSelected ? t.accent : t.inputBg,
                          color: isSelected ? t.accentText : t.text,
                          border: `1px solid ${isSelected ? t.accent : 'transparent'}`,
                          borderRadius: '8px',
                          padding: '10px 0',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          fontWeight: isSelected ? 700 : 500,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {day.getDate()}
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCalendarPickerOpen(false)}
                  style={{
                    width: '100%',
                    marginTop: '20px',
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: `1px solid ${t.panelBorder}`,
                    color: t.textMuted,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  Close Calendar
                </button>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      {/* Base Layer */}
      {renderView(theme, false)}

      {/* Synchronized Radial Ripple Layer (Pinned to match exact viewport scroll) */}
      <AnimatePresence>
        {hoverRipple && (
          <motion.div
            key={hoverRipple.theme}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
            initial={{ clipPath: `circle(0px at ${hoverRipple.x}px ${hoverRipple.y}px)` }}
            animate={{ clipPath: `circle(150vmax at ${hoverRipple.x}px ${hoverRipple.y}px)` }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderView(hoverRipple.theme, true, hoverRipple.scrollY)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}