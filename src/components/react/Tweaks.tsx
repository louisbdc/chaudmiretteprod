import { useEffect, useRef, useState } from 'react'

interface Accent {
  name: string
  a: string
  b: string
}

const ACCENTS: readonly Accent[] = [
  { name: 'Braise', a: '#E0512A', b: '#F08A3C' },
  { name: 'Lave', a: '#FF4D1C', b: '#FF8A3C' },
  { name: 'Cinéma', a: '#DC2626', b: '#F2662E' },
  { name: 'Laiton', a: '#C7A35B', b: '#E3C682' },
  { name: 'Acide', a: '#15B86B', b: '#5BE0A0' },
]

const readNum = (key: string, fallback: number): number => {
  if (typeof localStorage === 'undefined') return fallback
  const v = localStorage.getItem(key)
  return v != null ? +v : fallback
}

/**
 * Panneau « Réglages » : cale la teinte exacte du logo, l'intensité du grain,
 * le curseur sur-mesure et l'habillage cinéma. Ouverture/fermeture avec « t ».
 */
export default function Tweaks() {
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [accent, setAccent] = useState(() => readNum('cm_accent', 0))
  const [grain, setGrain] = useState(() => readNum('cm_grain', 0.55))
  const [cursor, setCursor] = useState(() => readNum('cm_cursor', 1))
  const [chrome, setChrome] = useState(() => readNum('cm_chrome', 1))

  /* applications */
  useEffect(() => {
    const c = ACCENTS[accent] || ACCENTS[0]
    document.documentElement.style.setProperty('--ember', c.a)
    document.documentElement.style.setProperty('--ember-2', c.b)
    localStorage.setItem('cm_accent', String(accent))
  }, [accent])

  useEffect(() => {
    document.documentElement.style.setProperty('--grain', String(grain))
    localStorage.setItem('cm_grain', String(grain))
  }, [grain])

  useEffect(() => {
    document.body.classList.toggle('no-cursor', !cursor)
    localStorage.setItem('cm_cursor', String(cursor))
  }, [cursor])

  useEffect(() => {
    document.body.classList.toggle('no-chrome', !chrome)
    localStorage.setItem('cm_chrome', String(chrome))
  }, [chrome])

  /* raccourci clavier */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') setOpen((v) => !v)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])

  return (
    <div id="tw" className={open ? 'show' : ''} ref={panelRef}>
      <h5>Réglages</h5>

      <div className="tw-row">
        <label>Couleur d’accent (logo)</label>
        <div className="tw-sw" id="swAccent">
          {ACCENTS.map((c, i) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              className={i === accent ? 'on' : ''}
              style={{ background: c.a }}
              onClick={() => setAccent(i)}
            />
          ))}
        </div>
      </div>

      <div className="tw-row">
        <label>Grain cinéma</label>
        <input
          type="range"
          id="swGrain"
          min="0"
          max="1"
          step="0.05"
          value={grain}
          onChange={(e) => setGrain(+e.currentTarget.value)}
        />
      </div>

      <div className="tw-row">
        <label>Curseur sur-mesure</label>
        <div className="tw-seg" id="swCursor">
          <button type="button" className={cursor ? 'on' : ''} onClick={() => setCursor(1)}>
            Activé
          </button>
          <button type="button" className={!cursor ? 'on' : ''} onClick={() => setCursor(0)}>
            Désactivé
          </button>
        </div>
      </div>

      <div className="tw-row">
        <label>Habillage cinéma (REC / cadre)</label>
        <div className="tw-seg" id="swChrome">
          <button type="button" className={chrome ? 'on' : ''} onClick={() => setChrome(1)}>
            Activé
          </button>
          <button type="button" className={!chrome ? 'on' : ''} onClick={() => setChrome(0)}>
            Désactivé
          </button>
        </div>
      </div>
    </div>
  )
}
