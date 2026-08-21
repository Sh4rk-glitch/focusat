type Props = {
  className?: string
  wordmark?: boolean
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
        <circle cx="32" cy="32" r="20" fill="none" stroke="url(#fa-gold)" strokeWidth="2.5" />
        <path
          d="M32 16v16l9 9"
          fill="none"
          stroke="url(#fa-gold)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="32" cy="32" r="3.2" fill="url(#fa-gold)" />
      </svg>
      {wordmark ? (
        <svg className="brand-word" viewBox="0 0 168 28" aria-label="focusat">
          <text
            x="0"
            y="22"
            fill="currentColor"
            fontFamily="Outfit, sans-serif"
            fontSize="22"
            letterSpacing="2.4"
          >
            focusat
          </text>
        </svg>
      ) : null}
    </span>
  )
}
