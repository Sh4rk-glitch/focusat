import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link } from 'react-router-dom'
import { FocusCoinIcon } from '../components/FocusCoinIcon'
import { DesmosPad } from '../components/DesmosPad'
import {
  loadStats,
  loadSkills,
  loadReview,
  loadItemLog,
  saveEngine,
  recordCompletion,
} from '../lib/storage'
import { applyAnswer, updateReview } from '../lib/adaptive'
import { questionMeta } from '../data/catalog'
import type { ItemLog, Question } from '../types'

function shuffleArray<T>(arr: T[]): T[] {
  const next = [...arr]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function DoomScrollSession({ questions = [] }: { questions: Question[] }) {
  // Randomized question queue
  const [deck, setDeck] = useState<Question[]>(() => shuffleArray(questions))
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [currentTotalPoints, setCurrentTotalPoints] = useState(() => loadStats().points)
  const [showCombo, setShowCombo] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [showDesmos, setShowDesmos] = useState(false)

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  // Track response timing for analytics calculations
  const questionStartTime = useRef<number>(Date.now())

  // Floating Resizable Window (Desktop)
  const [calcSize, setCalcSize] = useState({ width: 440, height: 320 })
  const isResizingRef = useRef(false)

  // Safeguard question retrieval
  const safeIndex = deck.length ? index % deck.length : 0
  const currentQ = deck[safeIndex]

  const choices: string[] = currentQ
    ? ((currentQ as any).choices ?? (currentQ as any).options ?? [])
    : []
  const answerIdx: number = currentQ
    ? ((currentQ as any).answer ?? (currentQ as any).ans ?? 0)
    : 0
  const promptText: string = currentQ
    ? ((currentQ as any).prompt ?? (currentQ as any).q ?? '')
    : ''
  const explanationText: string = currentQ
    ? ((currentQ as any).explain ?? (currentQ as any).explanation ?? '')
    : ''
  const section: string = currentQ ? ((currentQ as any).section ?? '') : ''
  const latexExpr: string | undefined = currentQ
    ? ((currentQ as any).desmos ?? (currentQ as any).latex)
    : undefined

  const isMathQuestion =
    section.toLowerCase() === 'math' ||
    (currentQ as any)?.skill?.toLowerCase().includes('math') ||
    (currentQ as any)?.skill?.toLowerCase().includes('algebra') ||
    (currentQ as any)?.skill?.toLowerCase().includes('geometry') ||
    Boolean(latexExpr)

  // Reset timer on question switch
  useEffect(() => {
    questionStartTime.current = Date.now()
  }, [index])

  const handleSelect = (optIndex: number) => {
    if (selected !== null || !currentQ) return
    setSelected(optIndex)
    const isCorrect = optIndex === answerIdx
    const elapsedMs = Math.max(800, Date.now() - questionStartTime.current)
    const meta = questionMeta(currentQ)

    setTotalAnswered((t) => t + 1)

    // 1. Log Item for buildAnalytics()
    const logEntry: ItemLog = {
      id: currentQ.id,
      at: new Date().toISOString(),
      skill: meta.skill,
      mode: isMathQuestion ? 'math' : 'ela',
      correct: isCorrect,
      elapsedMs,
    }
    const prevItemLogs = loadItemLog()
    const updatedItemLogs = [logEntry, ...prevItemLogs].slice(0, 300)

    // 2. Update Elo Skill Cells & Review Queue
    const prevSkills = loadSkills()
    const prevReview = loadReview()
    const updatedSkills = applyAnswer(prevSkills, currentQ, isCorrect, elapsedMs)
    const updatedReview = updateReview(prevReview, currentQ.id, isCorrect)

    saveEngine({
      skills: updatedSkills,
      review: updatedReview,
      itemLog: updatedItemLogs,
    })

    // 3. Record Points & Streak Activity
    if (isCorrect) {
      setCorrectCount((c) => c + 1)
      setShowCombo(true)
      setTimeout(() => setShowCombo(false), 1200)

      const updatedStats = recordCompletion({
        correct: 1,
        total: 1,
        distractions: 0,
        forfeited: false,
        mode: 'mix',
        focusScore: 100,
        weakSkill: meta.skill,
        elapsedMs,
      })
      setCurrentTotalPoints(updatedStats.points)
    } else {
      recordCompletion({
        correct: 0,
        total: 1,
        distractions: 0,
        forfeited: false,
        mode: 'mix',
        focusScore: 0,
        weakSkill: meta.skill,
        elapsedMs,
      })
    }
  }

  const handleNext = () => {
    if (!deck.length) return
    setSelected(null)
    setShowDesmos(false)

    // Reshuffle deck once full round finishes
    if (index + 1 >= deck.length) {
      setDeck(shuffleArray(questions))
      setIndex(0)
    } else {
      setIndex((prev) => prev + 1)
    }
  }

  // Handle manual dragging on resize corner (Desktop)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return
      setCalcSize((prev) => ({
        width: Math.min(Math.max(300, prev.width + e.movementX), window.innerWidth - 60),
        height: Math.min(Math.max(220, prev.height + e.movementY), window.innerHeight - 100),
      }))
    }

    const handleMouseUp = () => {
      isResizingRef.current = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // Keyboard Shortcuts (Desktop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4'].includes(e.key) && selected === null) {
        const keyIdx = parseInt(e.key, 10) - 1
        if (keyIdx < choices.length) handleSelect(keyIdx)
      } else if (['ArrowDown', 'ArrowRight', ' ', 'Enter'].includes(e.key)) {
        if (selected !== null) {
          e.preventDefault()
          handleNext()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selected, choices.length])

  if (!currentQ) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', background: '#090807', color: '#fff' }}>
        <p>No questions found. <Link to="/dashboard" style={{ color: 'var(--gold)' }}>Back to dashboard</Link></p>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#090807',
        color: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        touchAction: 'pan-y',
        overscrollBehavior: 'none',
      }}
    >
      {/* Background Gameplay Video */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <iframe
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100vw',
            height: '100vh',
            minWidth: '177.77vh',
            minHeight: '56.25vw',
            transform: 'translate(-50%, -50%) scale(1.3)',
            opacity: 0.35,
            filter: 'brightness(0.9) contrast(1.1)',
            border: 'none',
            pointerEvents: 'none',
          }}
          src="https://www.youtube-nocookie.com/embed/n_Dv4JMiwK8?autoplay=1&mute=1&controls=0&loop=1&playlist=n_Dv4JMiwK8&start=10&playsinline=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1"
          allow="autoplay; encrypted-media"
          title="Background Gameplay"
        />
      </div>

      {/* Top Header Bar */}
      <div
        style={{
          position: 'absolute',
          top: 'env(safe-area-inset-top, 16px)',
          left: '16px',
          right: '16px',
          zIndex: 30,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '520px',
          margin: '0 auto',
        }}
      >
        <Link
          to="/dashboard"
          style={{
            color: '#fff',
            fontSize: '0.85rem',
            textDecoration: 'none',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '6px 12px',
            borderRadius: '999px',
            backdropFilter: 'blur(10px)',
          }}
        >
          ✕ Exit
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isMathQuestion && (
            <button
              type="button"
              onClick={() => setShowDesmos((d) => !d)}
              style={{
                background: showDesmos ? 'var(--gold, #e5a93c)' : 'rgba(0,0,0,0.6)',
                color: showDesmos ? '#181512' : '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '999px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease',
              }}
            >
              📐 {showDesmos ? 'Hide' : 'Desmos'}
            </button>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '6px 12px',
              borderRadius: '999px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>
              <strong style={{ color: '#fff' }}>{correctCount}/{totalAnswered}</strong>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#e5a93c', fontWeight: 600, fontSize: '0.8rem' }}>
              <FocusCoinIcon size={13} /> {currentTotalPoints}
            </span>
          </div>
        </div>
      </div>

      {/* Floating Combo Reward Notification */}
      <AnimatePresence>
        {showCombo && (
          <motion.div
            initial={{ scale: 0.5, y: 20, opacity: 0 }}
            animate={{ scale: 1.15, y: -40, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'absolute',
              top: '25%',
              zIndex: 40,
              color: '#f0bd55',
              fontWeight: 800,
              fontSize: '1.4rem',
              textShadow: '0 4px 20px rgba(0,0,0,0.85)',
              pointerEvents: 'none',
            }}
          >
            🔥 +1 FocusPoint!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Feed Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          maxHeight: '920px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '16px 16px env(safe-area-inset-bottom, 24px)',
          boxSizing: 'border-box',
          zIndex: 20,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id ?? `q-${safeIndex}`}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.y < -50 && selected !== null) {
                handleNext()
              }
            }}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'rgba(18, 15, 12, 0.9)',
              border: '1px solid rgba(229, 169, 60, 0.28)',
              borderRadius: '20px',
              padding: isMobile ? '16px 18px' : '22px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(20px)',
              maxHeight: '74vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="eyebrow" style={{ color: '#e5a93c', margin: 0, fontSize: '0.72rem', fontWeight: 600 }}>
                {isMathQuestion ? '📐 Math Reel' : '📖 Reading & Writing Reel'}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>
                {isMobile ? 'Swipe up for next ⌃' : 'Keys [1 - 4]'}
              </span>
            </div>

            <p style={{ fontSize: isMobile ? '0.95rem' : '1.02rem', fontWeight: 500, lineHeight: 1.4, margin: 0, color: '#fbf5eb' }}>
              {promptText}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {choices.map((option, idx) => {
                const isSelected = selected === idx
                const isCorrect = idx === answerIdx
                let border = '1px solid rgba(255, 255, 255, 0.12)'
                let bg = 'rgba(255, 255, 255, 0.04)'
                let textColor = '#fbf5eb'

                if (selected !== null) {
                  if (isCorrect) {
                    border = '1px solid #22c55e'
                    bg = 'rgba(34, 197, 94, 0.18)'
                    textColor = '#86efac'
                  } else if (isSelected) {
                    border = '1px solid #ef4444'
                    bg = 'rgba(239, 68, 68, 0.18)'
                    textColor = '#fca5a5'
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: isMobile ? '10px 12px' : '11px 14px',
                      borderRadius: '12px',
                      background: bg,
                      border,
                      color: textColor,
                      textAlign: 'left',
                      fontSize: isMobile ? '0.86rem' : '0.9rem',
                      cursor: selected === null ? 'pointer' : 'default',
                      transition: 'all 0.15s ease',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: '1px solid currentColor',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '0.72rem',
                        flexShrink: 0,
                        opacity: 0.8,
                      }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </button>
                )
              })}
            </div>

            {selected !== null && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '4px' }}>
                {explanationText && (
                  <p style={{ fontSize: '0.78rem', color: '#a1a1aa', lineHeight: 1.35, margin: '0 0 10px' }}>
                    {explanationText}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-gold"
                  style={{ width: '100%', padding: '10px', fontSize: '0.9rem', fontWeight: 600 }}
                >
                  Swipe up for Next →
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desmos Panel (Responsive: Bottom sheet on mobile, Floating Window on Desktop) */}
      <AnimatePresence>
        {showDesmos && isMathQuestion && (
          <motion.div
            drag={!isMobile}
            dragMomentum={false}
            initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, x: 20 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, x: 0 }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, x: 20 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            style={
              isMobile
                ? {
                    position: 'fixed',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: '52vh',
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px',
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
                    borderTop: '1px solid rgba(229, 169, 60, 0.4)',
                    background: '#11100e',
                    zIndex: 70,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }
                : {
                    position: 'fixed',
                    top: '75px',
                    right: '25px',
                    width: `${calcSize.width}px`,
                    height: `${calcSize.height}px`,
                    borderRadius: '16px',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
                    border: '1px solid rgba(229, 169, 60, 0.4)',
                    background: '#11100e',
                    zIndex: 60,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }
            }
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 14px',
                background: 'rgba(255,255,255,0.06)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                cursor: isMobile ? 'default' : 'grab',
                userSelect: 'none',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '0.75rem', color: '#e5a93c', fontWeight: 600 }}>
                {isMobile ? '📐 Desmos Calculator' : '⠿ Desmos Calculator (Drag / Resize)'}
              </span>
              <button
                type="button"
                onClick={() => setShowDesmos(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#a1a1aa',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  lineHeight: 1,
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, width: '100%', height: '100%', minHeight: 0, overflow: 'hidden' }}>
              <DesmosPad latex={latexExpr} />
            </div>

            {/* Desktop Resize Grip */}
            {!isMobile && (
              <div
                onMouseDown={(e) => {
                  e.stopPropagation()
                  isResizingRef.current = true
                }}
                style={{
                  position: 'absolute',
                  right: '0px',
                  bottom: '0px',
                  width: '18px',
                  height: '18px',
                  cursor: 'nwse-resize',
                  zIndex: 70,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  padding: '2px',
                }}
              >
                <span style={{ fontSize: '10px', color: '#e5a93c', opacity: 0.7, userSelect: 'none' }}>◢</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}