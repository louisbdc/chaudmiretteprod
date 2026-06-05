import { useEffect, useRef } from 'react'

/** HUD cinéma : point REC clignotant + timecode 25 i/s en temps réel. */
export default function Hud() {
  const tcRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = tcRef.current
    if (!el) return
    let raf = 0
    const t0 = performance.now()
    const p2 = (n: number) => String(n).padStart(2, '0')
    const tick = (now: number) => {
      const f = Math.floor(((now - t0) / 1000) * 25)
      const ff = f % 25
      const s = Math.floor(f / 25) % 60
      const m = Math.floor(f / 1500) % 60
      const h = Math.floor(f / 90000) % 24
      el.textContent = `${p2(h)}:${p2(m)}:${p2(s)}:${p2(ff)}`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="hud hud--rec">
      <span className="rec-dot"></span>
      <span className="label">REC</span>
      <span className="label" id="tc" ref={tcRef}>00:00:00:00</span>
      <span className="label">Lille</span>
    </div>
  )
}
