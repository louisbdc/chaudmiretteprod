import { useEffect, useRef } from 'react'
import { isCoarsePointer, lerp } from '../../lib/dom'

/** Curseur réticule / diaphragme avec label contextuel (data-cursor). */
export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isCoarsePointer()) {
      document.body.classList.add('no-cursor')
      return
    }
    const ring = ringRef.current
    const dot = dotRef.current
    const label = labelRef.current
    if (!ring || !dot || !label) return

    let mx = innerWidth / 2
    let my = innerHeight / 2
    let rx = mx
    let ry = my
    let raf = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`
      label.style.transform = `translate(${mx}px,${my + 46}px) translate(-50%,-50%)`
    }
    addEventListener('mousemove', onMove)

    const tick = () => {
      rx = lerp(rx, mx, 0.18)
      ry = lerp(ry, my, 0.18)
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`
      raf = requestAnimationFrame(tick)
    }
    tick()

    const sel = 'a,button,.film,.skill,[data-cursor],input,.tw-sw button,.tw-seg button'
    const body = document.body
    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null
      const el = target?.closest?.(sel)
      if (el) {
        body.classList.add('hovering')
        const eyeWrap = el.closest('.eye-wrap')
        label.textContent = el.getAttribute('data-cursor') || (eyeWrap ? 'lecture' : '')
        body.classList.toggle('view-cursor', !!eyeWrap)
      } else {
        body.classList.remove('hovering', 'view-cursor')
        label.textContent = ''
      }
    }
    document.addEventListener('mouseover', onOver)

    return () => {
      removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div className="cursor" ref={ringRef}>
        <div className="cursor__ring"></div>
      </div>
      <div className="cursor__dot" ref={dotRef}></div>
      <div className="cursor__label" id="curlabel" ref={labelRef}></div>
    </>
  )
}
