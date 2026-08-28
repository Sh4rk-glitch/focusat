import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link } from 'react-router-dom'

const steps = [
  { label: 'Start with evidence', title: 'Take the diagnostic first.', body: 'Eight questions give Focusat a starting point for your Math, Reading, and Writing practice.' },
  { label: 'Practice with purpose', title: 'Every answer changes the next one.', body: 'Correctness, time spent, and focus leaks shape your skill ratings and recommendations.' },
  { label: 'See the pattern', title: 'Analytics makes the invisible visible.', body: 'Review every answer, timing, and flagged skill so you know exactly where your time goes.' },
  { label: 'Make it yours', title: 'Your profile controls the experience.', body: 'Open your profile photo in the top right to change your name, theme, or progress settings.' },
]

export function FirstTimeTutorial({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const current = steps[step]
  return (
    <div className="tutorial-backdrop" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
      <motion.div className="tutorial-card" initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
        <div className="tutorial-topline"><span>{String(step + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</span><button type="button" className="tutorial-skip" onClick={onDone}>Skip tutorial</button></div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            <p className="eyebrow">{current.label}</p>
            <h2 id="tutorial-title">{current.title}</h2>
            <p className="tutorial-body">{current.body}</p>
          </motion.div>
        </AnimatePresence>
        <div className="tutorial-progress">{steps.map((item, index) => <i key={item.label} className={index <= step ? 'is-done' : ''} />)}</div>
        <div className="tutorial-actions">
          {step > 0 ? <button type="button" className="btn btn-ghost" onClick={() => setStep((value) => value - 1)}>Back</button> : <Link to="/analytics" className="btn btn-ghost" onClick={onDone}>See analytics</Link>}
          {step < steps.length - 1 ? <button type="button" className="btn btn-gold" onClick={() => setStep((value) => value + 1)}>Next</button> : <button type="button" className="btn btn-gold" onClick={onDone}>Let’s begin</button>}
        </div>
      </motion.div>
    </div>
  )
}
