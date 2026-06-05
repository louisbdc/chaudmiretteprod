import { useEffect, useRef, useState } from 'react'
import { clamp, prefersReducedMotion } from '../../lib/dom'

/**
 * Loader « ouverture de diaphragme » : anneau gradué qui se remplit.
 * Pilotage par transitions CSS + timers (robuste même quand rAF est throttlé).
 */
export default function Loader() {
  const apRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLElement>(null)
  const [done, setDone] = useState(false)
  const [removed, setRemoved] = useState(false)

  useEffect(() => {
    const ap = apRef.current
    const bar = barRef.current
    if (!ap) return

    const reduce = prefersReducedMotion()
    const R = 70
    const C = 80
    let ticks = ''
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2
      const long = i % 5 === 0
      const r0 = long ? 58 : 62
      const r1 = 66
      ticks +=
        `<line x1="${(C + Math.cos(a) * r0).toFixed(1)}" y1="${(C + Math.sin(a) * r0).toFixed(1)}" ` +
        `x2="${(C + Math.cos(a) * r1).toFixed(1)}" y2="${(C + Math.sin(a) * r1).toFixed(1)}" ` +
        `stroke="rgba(241,236,225,${long ? 0.5 : 0.22})" stroke-width="${long ? 1.4 : 0.8}"/>`
    }
    const circ = 2 * Math.PI * R
    ap.innerHTML =
      `<svg viewBox="0 0 160 160" style="position:absolute;inset:0;animation:spin 14s linear infinite">${ticks}` +
      `<circle cx="80" cy="80" r="${R}" fill="none" stroke="rgba(241,236,225,.1)" stroke-width="1.5"/>` +
      `<circle id="apArc" cx="80" cy="80" r="${R}" fill="none" stroke="var(--ember)" stroke-width="1.5" ` +
      `stroke-dasharray="${circ}" stroke-dashoffset="${circ}" stroke-linecap="round" transform="rotate(-90 80 80)"/></svg>` +
      `<div id="apPct" style="position:absolute;inset:0;display:grid;place-items:center;font-family:var(--mono);font-size:13px;letter-spacing:.1em;color:var(--paper)">0</div>`

    const arc = ap.querySelector<SVGCircleElement>('#apArc')
    const pct = ap.querySelector<HTMLDivElement>('#apPct')
    const dur = reduce ? 300 : 1300

    if (arc) arc.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(.22,1,.36,1)`
    if (bar) bar.style.transition = `width ${dur}ms cubic-bezier(.22,1,.36,1)`
    requestAnimationFrame(() => {
      if (arc) arc.style.strokeDashoffset = '0'
      if (bar) bar.style.width = '100%'
    })

    const t0 = Date.now()
    const ci = window.setInterval(() => {
      const e = clamp((Date.now() - t0) / dur, 0, 1)
      if (pct) pct.textContent = String(Math.round((1 - Math.pow(1 - e, 3)) * 100))
      if (e >= 1) window.clearInterval(ci)
    }, 40)

    const t1 = window.setTimeout(() => {
      if (pct) pct.textContent = '100'
      setDone(true)
      kickHeroReveals()
    }, dur + 200)
    const t2 = window.setTimeout(() => setRemoved(true), dur + 900)

    return () => {
      window.clearInterval(ci)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [])

  if (removed) return null

  return (
    <div className={`loader${done ? ' done' : ''}`} id="loader">
      <div className="aperture" id="ap" ref={apRef}></div>
      <div className="loader__meta">
        <div className="label">Chaud Mirette — Ouverture</div>
        <div className="loader__bar">
          <i id="apbar" ref={barRef}></i>
        </div>
      </div>
    </div>
  )
}

/** Déclenche les reveals du hero une fois le loader terminé. */
function kickHeroReveals() {
  document
    .querySelectorAll('.hero .reveal, .hero .mask-line')
    .forEach((el) => el.classList.add('in'))
}
