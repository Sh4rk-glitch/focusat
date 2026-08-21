import { useRef, type MouseEvent, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export function SpotlightCard({ children, className = '' }: Props) {
  const ref = useRef<HTMLElement>(null)

  const onMove = (e: MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${e.clientX - r.left}px`)
    el.style.setProperty('--spot-y', `${e.clientY - r.top}px`)
  }

  return (
    <article ref={ref} className={`spot-card ${className}`} onMouseMove={onMove}>
      {children}
    </article>
  )
}
