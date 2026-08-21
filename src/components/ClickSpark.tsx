import { useCallback, useRef, type MouseEvent, type ReactNode } from 'react'

type Props = { children: ReactNode }

type Spark = { x: number; y: number; vx: number; vy: number; life: number }

export function ClickSpark({ children }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparks = useRef<Spark[]>([])
  const raf = useRef(0)

  const tick = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    sparks.current = sparks.current.filter((s) => s.life > 0)
    for (const s of sparks.current) {
      s.x += s.vx
      s.y += s.vy
      s.life -= 0.025
      ctx.fillStyle = `rgba(228, 188, 106, ${s.life})`
      ctx.beginPath()
      ctx.arc(s.x, s.y, 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
    if (sparks.current.length) raf.current = requestAnimationFrame(tick)
  }, [])

  const burst = (e: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    canvas.style.width = `${window.innerWidth}px`
    canvas.style.height = `${window.innerHeight}px`
    const ctx = canvas.getContext('2d')
    ctx?.scale(dpr, dpr)
    for (let i = 0; i < 14; i++) {
      const a = (Math.PI * 2 * i) / 14
      sparks.current.push({
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(a) * (1.6 + Math.random()),
        vy: Math.sin(a) * (1.6 + Math.random()),
        life: 1,
      })
    }
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(tick)
  }

  return (
    <div className="spark-root" onClick={burst}>
      <canvas ref={canvasRef} className="spark-canvas" />
      {children}
    </div>
  )
}
