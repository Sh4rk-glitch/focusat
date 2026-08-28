import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react'
import { Link } from 'react-router-dom'
import { SESSION_QUESTION_COUNT, SESSION_SECONDS } from '../data/questions'
import { loadStats } from '../lib/storage'
import { useAuth } from '../context/AuthContext'
import { Magnet } from '../components/Magnet'
import { ScrollProgress } from '../components/ScrollProgress'
import { SiteNav } from '../components/SiteNav'
import { SpotlightCard } from '../components/SpotlightCard'
import { Logo } from '../components/Logo'

const words = ['Eight', 'minutes.', 'Then', 'you’re', 'done.']

const modules = [
  { k: '01', t: 'Algebra', d: 'Linear equations', visual: 'y = mx + b' },
  { k: '02', t: 'Advanced math', d: 'Quadratics + functions', visual: 'f(x) = ax² + bx + c' },
  { k: '03', t: 'Problem solving', d: 'Rates + data', visual: 'rate = distance / time' },
  { k: '04', t: 'Geometry', d: 'Shapes + trigonometry', visual: 'a² + b² = c²' },
  { k: '05', t: 'Reading', d: 'Claims + evidence', visual: 'claim → evidence' },
  { k: '06', t: 'Writing', d: 'Grammar + rhetoric', visual: 'subject + verb = clarity' },
]

export function Home() {
  const { user } = useAuth()
  const stats = loadStats()
  const hasHistory = stats.totalSessions > 0
  const minutes = Math.round(SESSION_SECONDS / 60)
  const [introDone, setIntroDone] = useState(false)
  const story = useRef<HTMLDivElement>(null)
  const gallery = useRef<HTMLDivElement>(null)
  const { scrollYProgress: storyProgress } = useScroll({
    target: story,
    offset: ['start start', 'end end'],
  })
  const [storyPhase, setStoryPhase] = useState<'social' | 'focus'>('social')
  useMotionValueEvent(storyProgress, 'change', (value) => {
    const next = value < 0.5 ? 'social' : 'focus'
    setStoryPhase((current) => current === next ? current : next)
  })
  const phoneRotate = useTransform(storyProgress, [0, 0.5, 1], [-5, 0, 4])
  const phoneScale = useTransform(storyProgress, [0, 0.5, 1], [0.92, 1, 1.04])
  const { scrollYProgress: galleryProgress } = useScroll({ target: gallery, offset: ['start start', 'end end'] })
  const galleryX = useTransform(galleryProgress, [0, 1], ['0%', '-72%'])
  const smoothGalleryX = useSpring(galleryX, { stiffness: 80, damping: 24, mass: 0.4 })

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroDone(true), 3100)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className={`page home ${introDone ? 'landing-is-ready' : 'landing-is-intro'}`}>
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
      <ScrollProgress />
      <div className="aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <SiteNav />

      <section className="landing-hero">
        <div className="hero-copy">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          SAT-style practice for distracted phones
        </motion.p>
        <motion.h1 className="display">
          {words.map((w, i) => (
            <motion.span
              key={w}
              initial={{ opacity: 0, y: 48, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.07 * i, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            >
              {w}
              {i === 1 ? <br /> : ' '}
            </motion.span>
          ))}
        </motion.h1>
        <motion.p
          className="lede"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.8 }}
        >
           A locked {minutes}-minute session that turns distraction into a
           measurable SAT habit. Answer, learn your weak spots, and come back
           to a plan that gets sharper with every question.
        </motion.p>
        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Magnet>
            <Link to="/session" className="btn btn-gold">Start practice <span className="btn-shine" /></Link>
          </Magnet>
          <Link to={user ? '/dashboard' : '/signin'} className="btn btn-ghost">
            {user ? 'Open dashboard' : 'Sign in to save'}
          </Link>
        </motion.div>

        {hasHistory ? (
          <motion.div
            className="stat-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div>
              <strong>{stats.streak}</strong>
              <span>day streak</span>
            </div>
            <div>
              <strong>
                {stats.lastScore ?? 0}/{SESSION_QUESTION_COUNT}
              </strong>
              <span>last score</span>
            </div>
            <div>
              <strong>{stats.totalSessions}</strong>
              <span>sessions</span>
            </div>
          </motion.div>
        ) : null}
        </div>
        <motion.div className="hero-preview" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35, duration: 0.8 }}>
          <div className="preview-orbit orbit-one" />
          <div className="preview-orbit orbit-two" />
          <div className="hero-phone phone-device">
            <div className="phone-notch" />
            <div className="phone-screen focus-screen">
              <span className="screen-status">FOCUSAT</span>
              <div className="focus-mark">08:00</div>
              <strong>Question 01</strong>
              <span>What do you know right now?</span>
              <div className="focus-line" />
            </div>
          </div>
        </motion.div>
      </section>

      {!user ? (
        <section ref={story} className="phone-story">
          <div className="phone-story-sticky">
            <div className="story-copy">
              <AnimatePresence mode="wait" initial={false}>
                {storyPhase === 'social' ? (
                  <motion.div key="social-copy" className="story-panel" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.28 }}>
                    <p className="eyebrow">The scroll knows your name</p>
                    <h2>One more video becomes an hour.</h2>
                    <p>You opened your phone for a break. The feed opened a loop.</p>
                  </motion.div>
                ) : (
                  <motion.div key="focus-copy" className="story-panel" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28 }}>
                    <p className="eyebrow">Take the screen back</p>
                    <h2>Turn the same impulse into momentum.</h2>
                    <p>Focusat learns what you know, what you miss, and how long you hesitate.</p>
                    <Link to="/signup" className="btn btn-gold">Build my starting line <span className="btn-shine" /></Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.div className="phone-device story-phone" style={{ scale: phoneScale, rotate: phoneRotate }}>
              <div className="phone-notch" />
              <AnimatePresence mode="wait" initial={false}>
                {storyPhase === 'social' ? (
                  <motion.div key="social-screen" className="phone-screen social-screen" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }}>
                    <span className="screen-status">9:41</span>
                    <div className="feed-video"><strong>For You</strong><span>Swipe up for one more</span></div>
                    <div className="feed-actions"><b>♡</b><b>◌</b><b>↗</b></div>
                  </motion.div>
                ) : (
                  <motion.div key="focus-screen" className="phone-screen focus-screen" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.3 }}>
                    <span className="screen-status">FOCUSAT</span>
                    <div className="focus-mark">08:00</div>
                    <strong>Question 01</strong>
                    <span>What do you know right now?</span>
                    <div className="focus-line" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>
      ) : null}

      <div className="ticker">
        <motion.div
          className="ticker-track"
          initial={{ x: '8%', opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {Array.from({ length: 2 }).map((_, k) => (
            <p key={k}>
              8 MINUTES · ADAPTIVE SAT · MATH · READING · WRITING · FOCUS · BITE-SIZED PRACTICE · BLUEBOOK ACCURACY · TARGET WEAKNESSES · MATH & RW · ADAPTIVE ENGINE · INSTANT FEEDBACK · DESMOS READY · PRECISION MATH · EVIDENCE-BASED READING · DAILY DRILLS · SMART ANALYTICS · 1600 BENCHMARK ·{' '}
            </p>
          ))}
        </motion.div>
      </div>

      <div ref={gallery} className="pin-wrap">
        <div className="pin-sticky">
          <p className="eyebrow">Scroll the suite</p>
          <h2 className="pin-title">Built like the test. Timed like a dare.</h2>
          <motion.div className="pin-row" style={{ x: smoothGalleryX }}>
            {modules.map((m, i) => (
              <motion.div
                key={m.k}
                className="pin-card"
                initial={{ opacity: 0, y: 36, rotate: i % 2 ? 2 : -2 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -10, rotate: i % 2 ? -1 : 1 }}
              >
                <span>{m.k}</span>
                <h3>{m.t}</h3>
                <p>{m.d}</p>
                <div className="card-visual">{m.visual}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <motion.section id="how" className="how" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-15%' }}>
        <motion.h2
          variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65 } } }}
        >
          A session, not a study plan.
        </motion.h2>
        <div className="how-grid">
          {[
            {
              n: '01',
              t: 'Pick Mix, Math, or ELA',
              d: 'Fullscreen. No leaks. The clock keeps moving.',
            },
            {
              n: '02',
              t: 'Adaptive, not chatty',
              d: 'Every answer updates the next question.',
            },
            {
              n: '03',
              t: 'You vs should',
              d: 'Your dashboard shows where to go next.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.n}
              variants={{ hidden: { opacity: 0, y: 36, scale: 0.94 }, visible: { opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <SpotlightCard>
                <span>{item.n}</span>
                <h3>{item.t}</h3>
                <p>{item.d}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <section className="honest">
        <motion.blockquote
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Focusat does not raise your SAT score by itself. It raises the odds
          you actually practice today.
        </motion.blockquote>
        <motion.p
          className="legal-note"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          We write original SAT-style practice. College Board owns the official
          SAT and its Question Bank — we cannot copy those items. For released
          official questions, use the{' '}
          <a
            className="text-link"
            href="https://satsuitequestionbank.collegeboard.org/"
            target="_blank"
            rel="noreferrer"
          >
            SAT Suite Question Bank
          </a>
          .
        </motion.p>
      </section>

      {!user ? (
        <motion.section
          className="home-cta"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-12%' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <p className="eyebrow">Keep the evidence</p>
            <h2>Your practice should follow you.</h2>
            <p>Save your streak, carry your weak spots between devices, and see how steadily you can answer without leaking focus.</p>
          </div>
          <Link to="/signup" className="btn btn-gold">Create your account <span className="btn-shine" /></Link>
        </motion.section>
      ) : null}

      <footer className="foot">
        <span>focusat</span>
        <span>Free. Original practice — not College Board material.</span>
        <Link to="/privacy-policy" className="text-link">Privacy Policy</Link>
        <Link to="/terms-of-service" className="text-link">Terms of Service</Link>
      </footer>
    </div>
  )
}
