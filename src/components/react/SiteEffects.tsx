import { useEffect } from 'react'
import { clamp } from '../../lib/dom'

/**
 * Effets globaux pilotés au scroll, appliqués au DOM rendu par Astro :
 *  - nav qui se masque vers le bas / réapparaît vers le haut
 *  - révélations à l'apparition (IntersectionObserver)
 *  - parallaxe horizontale des témoignages
 *  - parallaxe du hero (titre / sous-titre / œil)
 * Îlot « headless » : ne rend aucun markup.
 */
export default function SiteEffects() {
  useEffect(() => {
    const cleanups: Array<() => void> = []

    /* ---- NAV hide/show ---- */
    const nav = document.getElementById('nav')
    if (nav) {
      let last = 0
      const onScroll = () => {
        const y = scrollY
        if (y > 240 && y > last) nav.classList.add('hide')
        else nav.classList.remove('hide')
        last = y
      }
      addEventListener('scroll', onScroll, { passive: true })
      cleanups.push(() => removeEventListener('scroll', onScroll))
    }

    /* ---- HUD : s'efface au-dessus du footer ---- */
    const footer = document.querySelector('.footer')
    if (footer) {
      const fio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => document.body.classList.toggle('hud-off', e.isIntersecting))
        },
        { rootMargin: '0px 0px -20% 0px' },
      )
      fio.observe(footer)
      cleanups.push(() => {
        fio.disconnect()
        document.body.classList.remove('hud-off')
      })
    }

    /* ---- REVEAL ---- */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    )
    document.querySelectorAll('.reveal, .reveal-clip, .mask-line').forEach((el) => {
      if (!el.closest('.hero')) io.observe(el)
    })
    cleanups.push(() => io.disconnect())

    /* ---- QUOTES parallaxe horizontale ---- */
    const sec = document.querySelector<HTMLElement>('.quotes')
    const track = document.getElementById('qtrack')
    if (sec && track) {
      const upd = () => {
        const r = sec.getBoundingClientRect()
        const prog = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1)
        const max = Math.max(0, track.scrollWidth - innerWidth + 80)
        track.style.transform = `translateX(${(-prog * max).toFixed(1)}px)`
      }
      addEventListener('scroll', upd, { passive: true })
      addEventListener('resize', upd)
      upd()
      cleanups.push(() => {
        removeEventListener('scroll', upd)
        removeEventListener('resize', upd)
      })
    }

    /* ---- HERO parallaxe ---- */
    const wrap = document.querySelector<HTMLElement>('.eye-wrap')
    const title = document.querySelector<HTMLElement>('.hero__title')
    const sub = document.querySelector<HTMLElement>('.hero__sub')
    if (wrap) {
      const onScroll = () => {
        const y = scrollY
        if (y > innerHeight) return
        wrap.style.transform = `translate(-50%,-50%) translateY(${y * 0.18}px)`
        if (title) title.style.transform = `translateY(${y * -0.06}px)`
        if (sub) sub.style.opacity = String(clamp(1 - y / 400, 0, 1))
      }
      addEventListener('scroll', onScroll, { passive: true })
      cleanups.push(() => removeEventListener('scroll', onScroll))
    }

    return () => cleanups.forEach((fn) => fn())
  }, [])

  return null
}
