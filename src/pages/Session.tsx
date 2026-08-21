import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SESSION_QUESTION_COUNT, SESSION_SECONDS } from '../data/questions'
import { SKILL_LABELS, questionMeta } from '../data/catalog'
import {
  applyAnswer,
  focusScore,
  pickNextQuestion,
  updateReview,
  weakestSkill,
} from '../lib/adaptive'
import { attachFocusGuard } from '../lib/focusGuard'
import {
  loadItemLog,
  loadReview,
  loadSkills,
  recordCompletion,
  saveEngine,
} from '../lib/storage'
import { QuestionCard } from '../components/QuestionCard'
import { TimerRing } from '../components/TimerRing'
import { DesmosPad } from '../components/DesmosPad'
import type { Difficulty, Question, SessionMode } from '../types'

type Phase = 'setup' | 'intro' | 'live' | 'locked'

const MODES: { id: SessionMode; t: string; d: string }[] = [
  {
    id: 'mix',
    t: 'Mix',
    d: 'ELA + Math. The picker still hunts whatever you miss.',
  },
  {
    id: 'ela',
    t: 'ELA only',
    d: 'Reading and Writing. No Desmos, no algebra hiding.',
  },
  {
    id: 'math',
    t: 'Math only',
    d: 'Calculator-legal items with Desmos on every stem.',
  },
]

const DIFFICULTIES: { id: Difficulty | 'all'; label: string }[] = [
  { id: 'all', label: 'All levels' },
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
  { id: 'challenge', label: 'Challenge' },
]

export function Session() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preset = params.get('mode')
  const reviewIds = (params.get('review') ?? '').split(',').filter(Boolean)
  const startMode: SessionMode | null =
    preset === 'math' || preset === 'ela' || preset === 'mix' ? preset : null

  const [mode, setMode] = useState<SessionMode | null>(startMode)
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
  const [phase, setPhase] = useState<Phase>(startMode ? 'intro' : 'setup')
  const [question, setQuestion] = useState<Question | null>(null)
  const [usedIds, setUsedIds] = useState<string[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [remaining, setRemaining] = useState(SESSION_SECONDS)
  const [distractions, setDistractions] = useState(0)
  const [away, setAway] = useState(false)
  const [showDesmos, setShowDesmos] = useState(true)
  const awayRef = useRef(false)
  const doneRef = useRef(false)
  const ignoreFullscreen = useRef(false)
  const inFullscreen = useRef(false)
  const skillsRef = useRef(loadSkills())
  const reviewRef = useRef(loadReview())
  const itemLogRef = useRef(loadItemLog())
  const modeRef = useRef<SessionMode>(startMode ?? 'mix')
  const difficultyRef = useRef<Difficulty | 'all'>('all')
  const questionStartedAt = useRef(Date.now())
  const correctRef = useRef(0)
  const answeredRef = useRef(0)
  const distractRef = useRef(0)

  const math = question?.section === 'Math'

  const seedQuestion = (nextMode: SessionMode) => {
    const q = pickNextQuestion({
      mode: nextMode,
      usedIds: [],
      skills: skillsRef.current,
      review: reviewRef.current,
      difficulty: difficultyRef.current,
      allowedIds: reviewIds.length ? reviewIds : undefined,
    })
    setQuestion(q)
    setUsedIds([q.id])
  }

  const flushEngine = () => {
    saveEngine({
      skills: skillsRef.current,
      review: reviewRef.current,
      itemLog: itemLogRef.current.slice(0, 250),
    })
  }

  const chooseMode = (next: SessionMode) => {
    modeRef.current = next
    setMode(next)
    seedQuestion(next)
    setPhase('intro')
  }

  const finish = useCallback(
    (forfeited: boolean) => {
      if (doneRef.current) return
      doneRef.current = true
      ignoreFullscreen.current = true
      inFullscreen.current = false
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => undefined)
      }
      const modeNow = modeRef.current
      const attempted = answeredRef.current
      const weak = weakestSkill(skillsRef.current, modeNow)
      const score = focusScore(
        correctRef.current,
        Math.max(1, attempted),
        distractRef.current,
        forfeited,
      )
      flushEngine()
      recordCompletion({
        correct: correctRef.current,
        total: attempted,
        distractions: distractRef.current,
        elapsedMs: (SESSION_SECONDS - remaining) * 1000,
        forfeited,
        mode: modeNow,
        weakSkill: weak,
        focusScore: score,
      })
      navigate('/results', {
        replace: true,
        state: {
          correct: correctRef.current,
          total: attempted,
          distractions: distractRef.current,
          forfeited,
          remaining,
          mode: modeNow,
          focusScore: score,
          weakSkill: weak,
        },
      })
    },
    [navigate, remaining],
  )

  useEffect(() => {
    correctRef.current = correctCount
    answeredRef.current = answered
    distractRef.current = distractions
  }, [answered, correctCount, distractions])

  useEffect(() => {
    if (startMode && !question) seedQuestion(startMode)
  }, [question, startMode])

  useEffect(() => {
    if (phase === 'setup' || phase === 'intro') return
    const id = window.setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          window.clearInterval(id)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'setup' && phase !== 'intro' && remaining === 0) finish(false)
  }, [finish, phase, remaining])

  useEffect(() => {
    const live = phase === 'live' || phase === 'locked'
    const onFs = () => {
      const fs = Boolean(document.fullscreenElement)
      if (
        !fs &&
        inFullscreen.current &&
        !ignoreFullscreen.current &&
        !doneRef.current &&
        live
      ) {
        if (!awayRef.current) {
          awayRef.current = true
          setDistractions((d) => d + 1)
          setAway(true)
        }
      }
      inFullscreen.current = fs
    }
    document.addEventListener('fullscreenchange', onFs)
    const stop = attachFocusGuard({
      armed: () =>
        (phase === 'live' || phase === 'locked') &&
        !doneRef.current &&
        !awayRef.current,
      ignore: () => ignoreFullscreen.current,
      onLeak: () => {
        if (awayRef.current || doneRef.current) return
        awayRef.current = true
        setDistractions((d) => d + 1)
        setAway(true)
      },
    })
    return () => {
      document.removeEventListener('fullscreenchange', onFs)
      stop()
    }
  }, [phase])

  const enterFocus = async () => {
    if (!mode) return
    if (!question) seedQuestion(mode)
    setPhase('live')
    questionStartedAt.current = Date.now()
    const el = document.documentElement
    if (el.requestFullscreen) {
      try {
        await el.requestFullscreen()
        inFullscreen.current = true
      } catch {
        inFullscreen.current = false
      }
    }
  }

  const lockAndAdvance = () => {
    if (selected === null || !question || !mode) return
    const ok = selected === question.answer
    const elapsedMs = Date.now() - questionStartedAt.current
    skillsRef.current = applyAnswer(skillsRef.current, question, ok, elapsedMs)
    reviewRef.current = updateReview(reviewRef.current, question.id, ok)
    const meta = questionMeta(question)
    itemLogRef.current = [
      {
        id: question.id,
        at: new Date().toISOString(),
        correct: ok,
        skill: meta.skill,
        mode,
        elapsedMs,
      },
      ...itemLogRef.current,
    ].slice(0, 250)
    setCorrectCount((n) => n + (ok ? 1 : 0))
    setAnswered((n) => n + 1)
    setPhase('locked')
    flushEngine()
  }

  const goNext = () => {
    if (!mode) return
    if (index >= SESSION_QUESTION_COUNT - 1) {
      finish(false)
      return
    }
    const next = pickNextQuestion({
      mode,
      usedIds,
      skills: skillsRef.current,
      review: reviewRef.current,
      difficulty: difficultyRef.current,
      allowedIds: reviewIds.length ? reviewIds : undefined,
    })
    setUsedIds((ids) => [...ids, next.id])
    setQuestion(next)
    setIndex((i) => i + 1)
    setSelected(null)
    setPhase('live')
    questionStartedAt.current = Date.now()
    setShowDesmos(true)
  }

  const resume = async () => {
    awayRef.current = false
    setAway(false)
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      try {
        ignoreFullscreen.current = true
        await document.documentElement.requestFullscreen()
        inFullscreen.current = true
      } catch {
        /* windowed */
      } finally {
        window.setTimeout(() => {
          ignoreFullscreen.current = false
        }, 500)
      }
    }
  }

  const weakNow = mode ? weakestSkill(skillsRef.current, mode) : undefined

  return (
    <div className="page session">
      {phase !== 'setup' ? (
        <>
          <div className="session-top">
            <button type="button" className="ghost-link" onClick={() => finish(true)}>
              Forfeit
            </button>
            <TimerRing remaining={remaining} total={SESSION_SECONDS} />
            <div className="leaks">
              <span>{distractions}</span>
              leaks
            </div>
          </div>
          <div className="progress" aria-hidden="true">
            {Array.from({ length: SESSION_QUESTION_COUNT }).map((_, i) => (
              <i
                key={i}
                className={i < index ? 'done' : i === index ? 'now' : ''}
              />
            ))}
          </div>
        </>
      ) : null}

      {phase === 'setup' ? (
        <motion.div
          className="intro setup"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="eyebrow">Choose a lane</p>
          <button type="button" className="ghost-link back-link" onClick={() => navigate('/dashboard')}>
            Back to dashboard
          </button>
          <h1>What should this eight minutes hunt?</h1>
          <p>
            The next item is picked from what you miss — Elo per skill, plus a
            review queue for wrong answers. Not a chatbot.
          </p>
          <div className="mode-grid">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className="mode-card"
                onClick={() => chooseMode(m.id)}
              >
                <strong>{m.t}</strong>
                <span>{m.d}</span>
              </button>
            ))}
          </div>
          <label className="difficulty-picker">
            Difficulty
            <select
              value={difficulty}
              onChange={(e) => {
                const next = e.target.value as Difficulty | 'all'
                difficultyRef.current = next
                setDifficulty(next)
              }}
            >
              {DIFFICULTIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
        </motion.div>
      ) : null}

      {phase === 'intro' && mode ? (
        <motion.div
          className="intro"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="eyebrow">
            {mode === 'mix' ? 'Mix' : mode === 'math' ? 'Math' : 'ELA'} · adaptive
          </p>
          <h1>Stay on this screen.</h1>
          <p>
            Alt+Tab, Escape, another window, or hiding the tab all count as leaks.
            The clock does not pause.
            {weakNow ? ` Current weak spot: ${SKILL_LABELS[weakNow]}.` : ''}
          </p>
          <button type="button" className="btn btn-gold" onClick={() => void enterFocus()}>
            I’m here — start the clock
          </button>
        </motion.div>
      ) : null}

      {(phase === 'live' || phase === 'locked') && question ? (
        <div className={`session-body ${math ? 'has-desmos' : ''}`}>
          <div>
            <QuestionCard
              question={question}
              index={index}
              total={SESSION_QUESTION_COUNT}
              selected={selected}
              locked={phase === 'locked'}
              onSelect={setSelected}
            />
            <div className="session-actions">
              {math ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowDesmos((v) => !v)}
                >
                  {showDesmos ? 'Hide Desmos' : 'Show Desmos'}
                </button>
              ) : null}
              {phase === 'live' ? (
                <button
                  type="button"
                  className="btn btn-gold"
                  disabled={selected === null}
                  onClick={lockAndAdvance}
                >
                  Lock answer
                </button>
              ) : (
                <button type="button" className="btn btn-gold" onClick={goNext}>
                  {index >= SESSION_QUESTION_COUNT - 1 ? 'See results' : 'Next question'}
                </button>
              )}
            </div>
          </div>
          {math && showDesmos ? <DesmosPad latex={question.desmos} /> : null}
        </div>
      ) : null}

      <AnimatePresence>
        {away ? (
          <motion.div
            className="away"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <p className="eyebrow">Focus leak</p>
              <h2>You left. The clock did not.</h2>
              <p>Alt+Tab, Escape, another tab — it all counts.</p>
              <button type="button" className="btn btn-gold" onClick={() => void resume()}>
                I’m back
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
