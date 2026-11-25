// Variantes créées par scripts/variantes.mjs (mêmes largeurs, sauf la plus grande : l'image d'origine)
const LARGEURS = [384, 640, 1080]

export default function imageLoader({ src, width }: { src: string; width: number }) {
  return LARGEURS.includes(width) ? src.replace('.webp', `-${width}.webp`) : src
}
