import { useEffect, useState } from 'react'

const LINKS = [
  { href: '#top', label: 'Accueil' },
  { href: '#about', label: 'À propos' },
  { href: '#skills', label: 'Compétences' },
  { href: '#work', label: 'Réalisations' },
  { href: '#contact', label: 'Contact' },
]

// Menu mobile: burger + overlay plein écran (<=860px)
export default function MobileMenu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    return () => document.body.classList.remove('menu-open')
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <button
        className={`navburger${open ? ' open' : ''}`}
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span></span>
        <span></span>
      </button>

      <div className={`mobilemenu${open ? ' open' : ''}`} role="dialog" aria-modal="true" aria-hidden={!open}>
        <nav className="mobilemenu__links">
          {LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              style={{ transitionDelay: open ? `${0.06 * i + 0.12}s` : '0s' }}
              onClick={() => setOpen(false)}
            >
              <span className="mobilemenu__n">0{i + 1}</span>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="mobilemenu__foot">
          <a href="mailto:contact@chaudmiretteprod.fr">contact@chaudmiretteprod.fr</a>
          <a href="tel:0632010358">06 32 01 03 58</a>
        </div>
      </div>
    </>
  )
}
