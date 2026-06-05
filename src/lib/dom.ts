/* Helpers partagés pour les îlots d'interaction. */

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

export const clamp = (v: number, a: number, b: number): number =>
  Math.max(a, Math.min(b, v))

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isCoarsePointer = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(pointer:coarse)').matches
