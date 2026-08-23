import { useRef } from 'react'
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { Link } from 'react-router-dom'
import { SESSION_QUESTION_COUNT, SESSION_SECONDS } from '../data/questions'
import { loadStats } from '../lib/storage'
import { useAuth } from '../context/AuthContext'
import { Magnet } from '../components/Magnet'
import { ScrollProgress } from '../components/ScrollProgress'
import { SiteNav } from '../components/SiteNav'
import { SpotlightCard } from '../components/SpotlightCard'

const words = ['Eight', 'minutes.', 'Then', 'you’re', 'done.']

const modules = [
  { k: '01', t: 'Algebra', d: 'Linear, systems, inequalities — Desmos open beside the stem.' },
  { k: '02', t: 'Advanced math', d: 'Quadratics, exponents, functions you can actually graph.' },
  { k: '03', t: 'Problem solving', d: 'Rates, percents, data — the messy numbers phones are good at avoiding.' },
  { k: '04', t: 'Geometry', d: 'Triangles, circles, trig ratios. Sketch it in Desmos, then lock in.' },
  { k: '05', t: 'Reading', d: 'Short passages. One claim. No infinite scroll dressed as “just one more article.”' },
  { k: '06', t: 'Writing', d: 'Conventions and transitions. The unglamorous points that still count.' },
]

export function Home() {
  const { user } = useAuth()
  const stats = loadStats()
  const hasHistory = stats.totalSessions > 0
  const minutes = Math.round(SESSION_SECONDS / 60)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 480], [0, -56])
  const pin = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: pin,
    offset: ['start start', 'end end'],
  })
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-72%'])
  const smoothX = useSpring(x, { stiffness: 70, damping: 22, mass: 0.4 })

  return (
    <div className="page home">
      <ScrollProgress />
      <div className="aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <SiteNav />

      <section className="hero">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          SAT-style practice for distracted phones
        </motion.p>
        <motion.h1 className="display" style={{ y: heroY }}>
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
          A locked {minutes}-minute session. Mix, Math, or ELA — then an Elo
          picker that hunts what you miss. Alt+Tab counts. Sign in and the
          model follows you on this device.
        </motion.p>
        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Magnet>
            <Link to="/session" className="btn btn-gold">
              Begin session
              <span className="btn-shine" />
            </Link>
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
      </section>

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
              Algebra · Adaptive Elo · Mix / Math / ELA · Desmos · Alt+Tab leaks
              · You vs should · Review queue · Dashboard ·{' '}
            </p>
          ))}
        </motion.div>
      </div>

      <div ref={pin} className="pin-wrap">
        <div className="pin-sticky">
          <p className="eyebrow">Scroll the suite</p>
          <h2 className="pin-title">Built like the test. Timed like a dare.</h2>
          <motion.div className="pin-row" style={{ x: smoothX }}>
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <section id="how" className="how">
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
        >
          A session, not a study plan.
        </motion.h2>
        <div className="how-grid">
          {[
            {
              n: '01',
              t: 'Pick Mix, Math, or ELA',
              d: 'Then go fullscreen. Alt+Tab, Escape, and other windows all count as leaks. The clock never pauses.',
            },
            {
              n: '02',
              t: 'Adaptive, not chatty',
              d: 'Each miss updates an Elo rating per skill. The next item hunts the hole. Wrong answers enter a review queue.',
            },
            {
              n: '03',
              t: 'You vs should',
              d: 'The dashboard compares what you actually did to the lane the ratings say you should run next.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.n}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <SpotlightCard>
                <span>{item.n}</span>
                <h3>{item.t}</h3>
                <p>{item.d}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </section>

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
