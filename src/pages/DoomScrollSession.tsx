import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link } from 'react-router-dom'
import { FocusCoinIcon } from '../components/FocusCoinIcon'
import type { Question } from '../types'

export function DoomScrollSession({ questions }: { questions: Question[] }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [showCombo, setShowCombo] = useState(false)
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  const currentQ = questions[index]

  // Map choices and answer key dynamically regardless of data schema
  const choices: string[] = (currentQ as any).choices ?? (currentQ as any).options ?? []
  const answerIdx: number = (currentQ as any).ans ?? (currentQ as any).answer ?? 0
  const promptText: string = (currentQ as any).prompt ?? (currentQ as any).q ?? ''

  const handleSelect = (optIndex: number) => {
    if (selected !== null) return
    setSelected(optIndex)
    if (optIndex === answerIdx) {
      setPointsEarned((p) => p + 5)
      setShowCombo(true)
      setTimeout(() => setShowCombo(false), 1200)
    }
  }

  const handleNext = () => {
    setSelected(null)
    setIndex((prev) => (prev + 1 < questions.length ? prev + 1 : 0))
  }

  if (!isMobile) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: '20vh' }}>
        <h2>📱 Mobile Only Feature</h2>
        <p className="muted">DoomScroll mode is built for vertical mobile feeds. Open Focusat on your phone to play.</p>
        <Link to="/dashboard" className="btn btn-gold" style={{ marginTop: '16px' }}>Back to Dashboard</Link>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#000', color: '#fff' }}>
      {/* Background Gameplay Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.35,
          pointerEvents: 'none',
        }}
        src="/assets/gameplay-loop.mp4"
      />

      {/* Floating Header */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/dashboard" style={{ color: '#fff', fontSize: '1.2rem', textDecoration: 'none' }}>✕</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.6)', padding: '6px 14px', borderRadius: '999px', backdropFilter: 'blur(10px)' }}>
          <FocusCoinIcon size={16} />
          <strong>+{pointsEarned}</strong>
        </div>
      </div>

      {/* Combo Floating Badge */}
      <AnimatePresence>
        {showCombo && (
          <motion.div
            initial={{ scale: 0, y: 20, opacity: 0 }}
            animate={{ scale: 1.2, y: -40, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translateX(-50%)', zIndex: 30, color: '#e5a93c', fontWeight: 800, fontSize: '1.5rem', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
          >
            🔥 +5 FocusPoints!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipeable Question Feed Item */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.y < -80 && selected !== null) {
              handleNext()
            }
          }}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -150 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            inset: '80px 16px 30px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: '12px',
            zIndex: 10,
          }}
        >
          {/* Question Overlay Card */}
          <div
            style={{
              background: 'rgba(20, 18, 15, 0.82)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              padding: '20px',
              backdropFilter: 'blur(20px)',
              maxHeight: '75vh',
              overflowY: 'auto',
            }}
          >
            <p style={{ fontSize: '1rem', fontWeight: 500, lineHeight: 1.4, margin: '0 0 16px' }}>{promptText}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {choices.map((option, idx) => {
                const isSelected = selected === idx
                const isCorrect = idx === answerIdx
                let border = '1px solid rgba(255, 255, 255, 0.1)'
                let bg = 'rgba(255, 255, 255, 0.05)'

                if (selected !== null) {
                  if (isCorrect) {
                    border = '1px solid #22c55e'
                    bg = 'rgba(34, 197, 94, 0.15)'
                  } else if (isSelected) {
                    border = '1px solid #ef4444'
                    bg = 'rgba(239, 68, 68, 0.15)'
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: bg,
                      border,
                      color: '#fff',
                      textAlign: 'left',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                    }}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            {selected !== null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: '#a1a1aa', margin: '0 0 8px' }}>Swipe up to next ⌃</p>
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-gold"
                  style={{ width: '100%', padding: '10px' }}
                >
                  Next Question →
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}