import { useCallback, useEffect, useRef, useState } from 'react'
import { clamp, isCoarsePointer } from '../../lib/dom'
import { FILMS, type Film } from '../../lib/films'

const HOVER_INTENT_MS = 600
// On démarre en autoplay muet (toujours autorisé), enablejsapi permet de
// rétablir le son via postMessage dès que la lecture commence.
const FEAT_SRC = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&modestbranding=1&rel=0&disablekb=1&enablejsapi=1`
const LB_SRC = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
const thumb = (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
const thumbFallback = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`

/**
 * Réalisations : galerie posée dans un iPad qui se redresse au scroll (3D).
 * Survol prolongé (600 ms) → la vidéo passe en plein écran dans la tablette.
 * Clic → lecture plein écran avec le son (lightbox). L'œil du hero ouvre aussi
 * la lightbox via window.__openFilm.
 */
export default function Realisations() {
  const ipadRef = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const featureRef = useRef<HTMLDivElement>(null)
  const featMediaRef = useRef<HTMLDivElement>(null)
  const featCapRef = useRef<HTMLDivElement>(null)

  const hoverTimer = useRef<number | null>(null)
  const curId = useRef<string | null>(null)

  const [lbFilm, setLbFilm] = useState<Film | null>(null)

  /* ---- iframe « cover » dans l'écran de l'iPad ---- */
  const sizeCover = useCallback((ifr: HTMLIFrameElement) => {
    const screen = screenRef.current
    if (!screen) return
    const w0 = screen.offsetWidth
    const h0 = screen.offsetHeight
    const ar = 16 / 9
    let w = w0
    let h = w / ar
    if (h < h0) {
      h = h0
      w = h * ar
    }
    ifr.style.width = Math.ceil(w) + 'px'
    ifr.style.height = Math.ceil(h) + 'px'
  }, [])

  const showFeature = useCallback(
    (f: Film) => {
      const feature = featureRef.current
      const featMedia = featMediaRef.current
      const featCap = featCapRef.current
      if (!feature || !featMedia || !featCap) return
      feature.classList.add('show')
      if (curId.current === f.id) return
      curId.current = f.id
      featMedia.innerHTML = ''
      // 1) la miniature remplit l'écran instantanément (sans attendre YouTube)
      featMedia.style.backgroundImage = `url('${thumb(f.id)}'), url('${thumbFallback(f.id)}')`
      featMedia.style.backgroundSize = 'cover'
      featMedia.style.backgroundPosition = 'center'
      // 2) la vidéo se lance par-dessus une fois prête
      const ifr = document.createElement('iframe')
      ifr.allow = 'autoplay; encrypted-media'
      ifr.src = FEAT_SRC(f.id)
      // rétablit le son dès que l'iframe est prête (best-effort selon la
      // politique d'autoplay du navigateur — la vidéo se lance dans tous les cas)
      ifr.addEventListener('load', () => {
        const cmd = (func: string, args: unknown[] = []) =>
          ifr.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*')
        cmd('unMute')
        cmd('setVolume', [100])
        cmd('playVideo')
      })
      sizeCover(ifr)
      featMedia.appendChild(ifr)
      featCap.innerHTML = '<span class="rec-dot"></span>' + f.client + ' — ' + f.title
    },
    [sizeCover],
  )

  const hideFeature = useCallback(() => {
    const feature = featureRef.current
    const featMedia = featMediaRef.current
    if (!feature || !featMedia) return
    feature.classList.remove('show')
    curId.current = null
    window.setTimeout(() => {
      if (!feature.classList.contains('show')) {
        featMedia.innerHTML = ''
        featMedia.style.backgroundImage = ''
      }
    }, 480)
  }, [])

  /* ---- Lightbox ---- */
  const openFilm = useCallback((f: Film) => setLbFilm(f), [])
  const closeFilm = useCallback(() => setLbFilm(null), [])

  /* expose pour l'œil du hero */
  useEffect(() => {
    window.__openFilm = openFilm
    return () => {
      if (window.__openFilm === openFilm) window.__openFilm = undefined
    }
  }, [openFilm])

  /* fermeture lightbox au clavier */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFilm()
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [closeFilm])

  /* resize : recale l'iframe feature */
  useEffect(() => {
    const onResize = () => {
      const ifr = featMediaRef.current?.querySelector('iframe')
      if (ifr) sizeCover(ifr)
    }
    addEventListener('resize', onResize)
    return () => removeEventListener('resize', onResize)
  }, [sizeCover])

  /* iPad : redressement 3D au scroll (ContainerScroll vanilla) + remontée
     par-dessus le titre « Leurs films, en lumière » */
  useEffect(() => {
    const ipad = ipadRef.current
    if (!ipad) return
    // on mesure la progression sur le conteneur NON transformé (.work-stage)
    // pour éviter toute boucle de feedback avec le translateY appliqué à l'iPad
    const stage = ipad.parentElement
    let ticking = false
    const isMobile = () => innerWidth <= 768
    const upd = () => {
      ticking = false
      const r = (stage ?? ipad).getBoundingClientRect()
      const vh = innerHeight
      // progression basée sur le CENTRE : p atteint 1 quand l'iPad est centré,
      // donc on voit l'animation se dérouler pendant qu'il monte, et elle se
      // TERMINE sur un iPad parfaitement à plat (rotateX 0°) plein cadre
      const center = r.top + r.height / 2
      const p = clamp((vh - center) / (vh * 0.5), 0, 1)
      const rot = (24 * (1 - p)).toFixed(2)
      const scale = (isMobile() ? 0.82 + 0.16 * p : 1.04 - 0.04 * p).toFixed(3)
      // remontée en cloche : recouvre le titre pendant la phase inclinée, puis
      // se résorbe pour que l'état final à plat soit centré et entièrement cadré
      const lift = ((isMobile() ? 30 : 70) * Math.sin(p * Math.PI)).toFixed(1)
      ipad.style.transform =
        'translateY(-' + lift + 'px) rotateX(' + rot + 'deg) scale(' + scale + ')'
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(upd)
      }
    }
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', upd)
    upd()
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', upd)
    }
  }, [])

  const touch = typeof window !== 'undefined' && isCoarsePointer()

  const onEnter = (f: Film) => {
    if (touch) return
    // une vidéo joue déjà en plein écran → on verrouille : bouger la souris dans
    // l'iPad ne doit pas déclencher le changement de vidéo
    if (curId.current) return
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current)
    hoverTimer.current = window.setTimeout(() => showFeature(f), HOVER_INTENT_MS)
  }
  const onLeave = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current)
  }
  const onReelLeave = () => {
    if (touch) return
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current)
    hideFeature()
  }
  const onClick = (f: Film) => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current)
    openFilm(f)
  }

  return (
    <>
      <div className="work-stage">
        <div className="ipad" id="workIpad" ref={ipadRef}>
          <span className="ipad__cam"></span>
          <div className="ipad__screen" id="workScreen" ref={screenRef}>
            <div className="ipad__glass"></div>
            <div className="scr-feature" id="scrFeature" ref={featureRef}>
              <div className="scr-feature__media" id="featMedia" ref={featMediaRef}></div>
              <div className="scr-feature__cap" id="featCap" ref={featCapRef}></div>
            </div>
            <div className="screenwrap">
              <div className="reel" id="reel" onMouseLeave={onReelLeave}>
                {FILMS.map((f, i) => (
                  <button
                    key={f.id}
                    className={`film${f.featured ? ' film--featured' : ''}`}
                    data-cursor="▶ plein écran"
                    onMouseEnter={() => onEnter(f)}
                    onMouseLeave={onLeave}
                    onClick={() => onClick(f)}
                  >
                    <div className="film__media">
                      <img
                        loading="lazy"
                        alt=""
                        src={thumb(f.id)}
                        onError={(e) => {
                          const img = e.currentTarget
                          img.onerror = null
                          img.src = thumbFallback(f.id)
                        }}
                      />
                    </div>
                    <div className="film__scrim"></div>
                    <div className="film__live">
                      <span className="rec-dot"></span>Aperçu
                    </div>
                    <div className="film__row">
                      <span className="film__idx">0{i + 1}</span>
                      <span className="film__txt">
                        <span className="film__client">{f.client}</span>
                        <span className="film__title">{f.title}</span>
                      </span>
                      <span className="film__tag">{f.tag}</span>
                      <span className="film__play">
                        <b>▶</b> Plein écran
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== LIGHTBOX VIDÉO ===== */}
      <div
        className={`lightbox${lbFilm ? ' open' : ''}`}
        id="lightbox"
        aria-hidden={lbFilm ? 'false' : 'true'}
      >
        <div className="lightbox__bg" id="lbBg" onClick={closeFilm}></div>
        <button className="lightbox__close" id="lbClose" data-cursor="fermer" onClick={closeFilm}>
          <span>Fermer</span> ✕
        </button>
        <div className="lightbox__stage">
          <div className="lightbox__frame" id="lbFrame">
            {lbFilm && (
              <iframe
                title={`${lbFilm.client} — ${lbFilm.title}`}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                src={LB_SRC(lbFilm.id)}
              ></iframe>
            )}
          </div>
          <div className="lightbox__cap" id="lbCap">
            {lbFilm && (
              <>
                <span>
                  <span className="ember">{lbFilm.client}</span> &nbsp;—&nbsp; {lbFilm.title}
                </span>
                <span>Chaud Mirette Productions</span>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
