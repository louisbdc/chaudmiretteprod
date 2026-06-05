import { useEffect, useRef } from 'react'
import { clamp, lerp } from '../../lib/dom'
import { SHOWREEL } from '../../lib/films'

/**
 * L'œil / la mirette : iris à fibres, pupille qui suit le curseur et se dilate
 * au scroll, reflet spéculaire. Clic → ouvre le showreel en lightbox.
 */
export default function Eye() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const eyeRef = useRef<HTMLDivElement>(null)
  const fibersRef = useRef<SVGSVGElement>(null)
  const pupilRef = useRef<HTMLDivElement>(null)
  const catchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const eye = eyeRef.current
    const pupil = pupilRef.current
    const catchEl = catchRef.current
    const fibers = fibersRef.current
    const wrap = wrapRef.current
    if (!eye || !pupil || !catchEl || !fibers || !wrap) return

    // --- Fibres d'iris ---
    const cx = 100
    const cy = 100
    let html = ''
    for (let i = 0; i < 140; i++) {
      const a = (i / 140) * Math.PI * 2 + (Math.random() - 0.5) * 0.05
      const r0 = 42 + Math.random() * 6
      const r1 = 96 - Math.random() * 30
      const x0 = cx + Math.cos(a) * r0
      const y0 = cy + Math.sin(a) * r0
      const x1 = cx + Math.cos(a) * r1
      const y1 = cy + Math.sin(a) * r1
      const o = (0.06 + Math.random() * 0.5).toFixed(2)
      const w = (0.4 + Math.random() * 0.7).toFixed(2)
      html += `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="rgba(245,200,150,${o})" stroke-width="${w}"/>`
    }
    fibers.innerHTML = html

    // --- Suivi + dilatation ---
    let tx = 0
    let ty = 0
    let cxT = 0
    let cyT = 0
    let px = 0
    let py = 0
    let pcx = 0
    let pcy = 0
    let dil = 1
    let td = 1
    let raf = 0

    const onMove = (e: MouseEvent) => {
      const r = eye.getBoundingClientRect()
      const ex = r.left + r.width / 2
      const ey = r.top + r.height / 2
      const dx = (e.clientX - ex) / innerWidth
      const dy = (e.clientY - ey) / innerHeight
      tx = clamp(dx * 40, -14, 14)
      ty = clamp(dy * 40, -14, 14)
      cxT = clamp(dx * 20, -8, 8)
      cyT = clamp(dy * 20, -8, 8)
    }
    const onScroll = () => {
      const s = clamp(scrollY / innerHeight, 0, 1)
      td = 1 + s * 0.16
    }
    addEventListener('mousemove', onMove)
    addEventListener('scroll', onScroll, { passive: true })

    const onClick = () => {
      if (window.__openFilm) window.__openFilm(SHOWREEL)
      else document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
    }
    wrap.addEventListener('click', onClick)

    const tick = (t: number) => {
      px = lerp(px, tx, 0.08)
      py = lerp(py, ty, 0.08)
      pcx = lerp(pcx, cxT, 0.12)
      pcy = lerp(pcy, cyT, 0.12)
      const breathe = 1 + Math.sin(t / 1400) * 0.012
      dil = lerp(dil, td, 0.05)
      pupil.style.transform = `translate(${px}px,${py}px) scale(${(dil * breathe).toFixed(3)})`
      catchEl.style.transform = `translate(${pcx}px,${pcy}px)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      removeEventListener('mousemove', onMove)
      removeEventListener('scroll', onScroll)
      wrap.removeEventListener('click', onClick)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="eye-wrap" data-cursor="lecture" ref={wrapRef}>
      <div className="eye" id="eye" ref={eyeRef}>
        <div className="eye__lens"></div>
        <svg className="eye__fibers" viewBox="0 0 200 200" ref={fibersRef} aria-hidden="true"></svg>
        <div className="eye__iris-glow"></div>
        <div className="eye__ring"></div>
        <div className="eye__pupil" id="pupil" ref={pupilRef}></div>
        <div className="eye__catch" id="catch" ref={catchRef}></div>
      </div>
    </div>
  )
}
