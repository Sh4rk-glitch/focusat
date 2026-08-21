import { useEffect, useRef } from 'react'

type Calc = {
  destroy: () => void
  setExpression: (expr: { id: string; latex: string }) => void
}

type DesmosApi = {
  GraphingCalculator: (el: HTMLElement, opts?: Record<string, unknown>) => Calc
}

declare global {
  interface Window {
    Desmos?: DesmosApi
  }
}

const SRC =
  'https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6'

let loading: Promise<void> | null = null

function loadDesmos(): Promise<void> {
  if (window.Desmos) return Promise.resolve()
  if (loading) return loading
  loading = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SRC
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Desmos failed to load'))
    document.head.appendChild(s)
  })
  return loading
}

type Props = {
  latex?: string
}

export function DesmosPad({ latex }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const calc = useRef<Calc | null>(null)

  useEffect(() => {
    let gone = false
    void loadDesmos().then(() => {
      if (gone || !host.current || !window.Desmos) return
      calc.current?.destroy()
      const next = window.Desmos.GraphingCalculator(host.current, {
        keypad: true,
        expressions: true,
        settingsMenu: true,
        zoomButtons: true,
        border: false,
        invertedColors: true,
        fontSize: 14,
      })
      if (latex) next.setExpression({ id: 'q', latex })
      calc.current = next
    })
    return () => {
      gone = true
      calc.current?.destroy()
      calc.current = null
    }
  }, [latex])

  return (
    <div className="desmos-wrap">
      <p className="desmos-label">Desmos</p>
      <div ref={host} className="desmos-host" />
    </div>
  )
}
