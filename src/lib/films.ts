// Réalisations en avant: vidéos YouTube de la chaîne

export interface Film {
  id: string
  client: string
  title: string
  tag?: string
  featured?: boolean
}

export const FILMS: readonly Film[] = [
  { id: 'KDqfBC96a_8', client: 'Chaud Mirette', title: 'Bande démo · Showreel', tag: 'Le best-of', featured: true },
  { id: 'YWHdbqURlF8', client: 'LOSC', title: 'Garden Party', tag: 'Événementiel' },
  { id: 'aCazU06lKEU', client: 'Ducati', title: 'Lancement DIAVEL V4', tag: 'Film publicitaire' },
  { id: 'okapq1BVGiE', client: 'Hyundai', title: 'Les Foulées de Bondues', tag: 'Captation' },
  { id: 'fm0IZaSCf_U', client: "L'Oréal", title: 'Jean Bouteille · Cosmétique vrac', tag: 'Brand content' },
  { id: 'I3yWPBTvBvo', client: 'Decathlon', title: 'Présentation produits', tag: 'Packshot' },
] as const

export const SHOWREEL: Film = {
  id: 'KDqfBC96a_8',
  client: 'Chaud Mirette',
  title: 'Bande démo · Showreel',
}

declare global {
  interface Window {
    __openFilm?: (f: Film) => void
  }
}
