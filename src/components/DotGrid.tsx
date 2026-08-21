import { useCallback, useEffect, useMemo, useRef, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import { InertiaPlugin } from 'gsap/InertiaPlugin'

gsap.registerPlugin(InertiaPlugin)

type Dot = {
  cx: number
  cy: number
  xOffset: number
  yOffset: number
  _inertiaApplied: boolean
}

export type DotGridProps = {
  dotSize?: number
  gap?: number
  baseColor?: string
  activeColor?: string
  proximity?: number
  speedTrigger?: number
  shockRadius?: number
  shockStrength?: number
  maxSpeed?: number
  resistance?: number
  returnDuration?: number
  className?: string
  style?: CSSProperties
}

type Rgb = { r: number; g: number; b: number }

function hexToRgb(hex: string): Rgb {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!match) return { r: 0, g: 0, b: 0 }
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  }
}

const throttle = (fn: (event: MouseEvent) => void, limit: number) => {
  let lastCall = 0
  return (event: MouseEvent) => {
    const now = performance.now()
    if (now - lastCall >= limit) {
      lastCall = now
      fn(event)
    }
  }
}

export default function DotGrid({
  dotSize = 5,
  gap = 24,
  baseColor = '#725d3a',
  activeColor = '#f0c978',
  proximity = 130,
  speedTrigger = 100,
  shockRadius = 210,
  shockStrength = 3,
  maxSpeed = 5000,
  resistance = 750,
  returnDuration = 1.5,
  className = '',
  style,
}: DotGridProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotsRef = useRef<Dot[]>([])
  const pointerRef = useRef({ x: 0, y: 0, lastTime: 0, lastX: 0, lastY: 0 })
  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor])
  const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor])
  const circlePath = useMemo(() => {
    if (typeof window === 'undefined' || !window.Path2D) return null
    const path = new Path2D()
    path.arc(0, 0, dotSize / 2, 0, Math.PI * 2)
    return path
  }, [dotSize])

  const buildGrid = useCallback(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!wrapper || !canvas) return
    const { width, height } = wrapper.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const cell = dotSize + gap
    const cols = Math.floor((width + gap) / cell)
    const rows = Math.floor((height + gap) / cell)
    const startX = (width - (cell * cols - gap)) / 2 + dotSize / 2
    const startY = (height - (cell * rows - gap)) / 2 + dotSize / 2
    dotsRef.current = Array.from({ length: rows * cols }, (_, index) => {
      const x = index % cols
      const y = Math.floor(index / cols)
      return { cx: startX + x * cell, cy: startY + y * cell, xOffset: 0, yOffset: 0, _inertiaApplied: false }
    })
  }, [dotSize, gap])

  useEffect(() => {
    if (!circlePath) return
    let animationFrame = 0
    const draw = () => {
      const canvas = canvasRef.current
      const context = canvas?.getContext('2d')
      if (!canvas || !context) return
      const dpr = window.devicePixelRatio || 1
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.save()
      context.scale(dpr, dpr)
      const { x: pointerX, y: pointerY } = pointerRef.current
      for (const dot of dotsRef.current) {
        const distance = Math.hypot(dot.cx - pointerX, dot.cy - pointerY)
        const intensity = distance <= proximity ? 1 - distance / proximity : 0
        const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * intensity)
        const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * intensity)
        const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * intensity)
        context.save()
        context.translate(dot.cx + dot.xOffset, dot.cy + dot.yOffset)
        context.fillStyle = `rgb(${r}, ${g}, ${b})`
        context.globalAlpha = 0.45 + intensity * 0.55
        context.fill(circlePath)
        context.restore()
      }
      context.restore()
      animationFrame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animationFrame)
  }, [activeRgb, baseRgb, circlePath, proximity])

  useEffect(() => {
    buildGrid()
    const observer = new ResizeObserver(buildGrid)
    if (wrapperRef.current) observer.observe(wrapperRef.current)
    return () => observer.disconnect()
  }, [buildGrid])

  useEffect(() => {
    const applyInertia = (dot: Dot, pushX: number, pushY: number) => {
      if (dot._inertiaApplied) return
      dot._inertiaApplied = true
      gsap.killTweensOf(dot)
      gsap.to(dot, {
        inertia: { xOffset: pushX, yOffset: pushY, resistance },
        onComplete: () => {
          gsap.to(dot, { xOffset: 0, yOffset: 0, duration: returnDuration, ease: 'elastic.out(1,0.75)', onComplete: () => { dot._inertiaApplied = false } })
        },
      })
    }
    const onMove = (event: MouseEvent) => {
      const now = performance.now()
      const pointer = pointerRef.current
      const dt = pointer.lastTime ? now - pointer.lastTime : 16
      const vx = ((event.clientX - pointer.lastX) / dt) * 1000
      const vy = ((event.clientY - pointer.lastY) / dt) * 1000
      const speed = Math.min(maxSpeed, Math.hypot(vx, vy))
      pointer.lastTime = now
      pointer.lastX = event.clientX
      pointer.lastY = event.clientY
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      if (speed <= speedTrigger) return
      for (const dot of dotsRef.current) {
        if (Math.hypot(dot.cx - pointer.x, dot.cy - pointer.y) < proximity) {
          applyInertia(dot, dot.cx - pointer.x + vx * 0.005, dot.cy - pointer.y + vy * 0.005)
        }
      }
    }
    const onClick = (event: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      for (const dot of dotsRef.current) {
        const distance = Math.hypot(dot.cx - x, dot.cy - y)
        if (distance < shockRadius) {
          const falloff = Math.max(0, 1 - distance / shockRadius)
          applyInertia(dot, (dot.cx - x) * shockStrength * falloff, (dot.cy - y) * shockStrength * falloff)
        }
      }
    }
    const throttledMove = throttle(onMove, 40)
    window.addEventListener('mousemove', throttledMove, { passive: true })
    window.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('mousemove', throttledMove)
      window.removeEventListener('click', onClick)
    }
  }, [maxSpeed, proximity, resistance, returnDuration, shockRadius, shockStrength, speedTrigger])

  return <div ref={wrapperRef} className={`dot-grid ${className}`} style={style}><canvas ref={canvasRef} /></div>
}
