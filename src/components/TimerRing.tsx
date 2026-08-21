import { useId } from 'react'

type Props = {
  remaining: number
  total: number
}

export function TimerRing({ remaining, total }: Props) {
  const id = useId()
  const r = 54
  const c = 2 * Math.PI * r
  const t = Math.max(0, Math.min(1, remaining / total))
  const dash = c * t
  const urgent = remaining <= 30

  const m = Math.floor(remaining / 60)
  const s = remaining % 60
  const label = `${m}:${String(s).padStart(2, '0')}`

  return (
    <div className={`ring ${urgent ? 'ring-urgent' : ''}`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8c07a" />
            <stop offset="100%" stopColor="#f4efe6" />
          </linearGradient>
        </defs>
        <circle className="ring-track" cx="60" cy="60" r={r} />
        <circle
          className="ring-value"
          cx="60"
          cy="60"
          r={r}
          stroke={`url(#${id})`}
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <span className="ring-time">{label}</span>
    </div>
  )
}
