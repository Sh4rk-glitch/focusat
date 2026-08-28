import { motion, type Variants } from 'motion/react'

type Props = {
  className?: string
  wordmark?: boolean
}

const clockDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { type: 'spring', duration: 1.4, bounce: 0 },
      opacity: { duration: 0.15 },
    },
  },
}

export function Logo({ className = '', wordmark = true }: Props) {
  return (
    <span className={`brand ${className}`}>
      <svg
        className="brand-mark"
        viewBox="0 0 64 64"
        aria-hidden="true"
        role="img"
      >
        <defs>
          <linearGradient id="fa-gold" x1="12" y1="8" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f0d08a" />
            <stop offset="1" stopColor="#c9a05a" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="18" fill="#141210" />
        <motion.circle initial="hidden" animate="visible" variants={clockDraw} cx="32" cy="32" r="20" fill="none" stroke="url(#fa-gold)" strokeWidth="2.5" />
        <motion.path
          initial="hidden"
          animate="visible"
          variants={clockDraw}
          d="M32 16v16l9 9"
          fill="none"
          stroke="url(#fa-gold)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1, type: 'spring' }} cx="32" cy="32" r="3.2" fill="url(#fa-gold)" />
      </svg>
      {wordmark ? (
        <svg className="brand-word" viewBox="0 0 100 28" aria-label="focusat">
          <text
            x="0"
            y="21"
            textAnchor="start"
            fill="currentColor"
            fontFamily="Outfit, sans-serif"
            fontSize="22"
            letterSpacing="1.2"
          >
            focusat
          </text>
        </svg>
      ) : null}
    </span>
  )
}