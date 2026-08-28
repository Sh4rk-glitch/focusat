export function FocusCoinIcon({ className = 'focus-coin-icon', size = 18 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ verticalAlign: 'middle', display: 'inline-block' }}
    >
      {/* Outer Coin Rim */}
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* Inner Rim */}
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5" fill="none" opacity="0.6" />
      {/* Clock Center */}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      {/* Clock Hands (10:10 Focus Position) */}
      <line x1="12" y1="12" x2="12" y2="7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="12" y1="12" x2="15.5" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}