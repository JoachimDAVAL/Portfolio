// Versions réduites des images affichées avec next/image (cards des projets, photo de l'accueil).
// Lancé avant chaque dev et chaque build ; les fichiers créés ne sont pas dans git.
// Mêmes largeurs que src/lib/imageLoader.ts et next.config.ts
import { existsSync, readdirSync, rmSync } from 'node:fs'
import sharp from 'sharp'

const LARGEURS = [384, 640, 1080]
const suffixes = LARGEURS.map((l) => `-${l}.webp`)
const estVariante = (f) => suffixes.some((s) => f.endsWith(s))

const PROJETS = 'public/images/projets'
const dansDossier = (dossier, prefixe) =>
  existsSync(dossier)
    ? readdirSync(dossier).filter((f) => f.startsWith(prefixe) && f.endsWith('.webp')).map((f) => `${dossier}/${f}`)
    : []

const fichiers = [
  ...dansDossier('public/images', 'joachim'),
  ...readdirSync(PROJETS).flatMap((projet) => dansDossier(`${PROJETS}/${projet}`, 'card')),
]
fichiers.filter(estVariante).forEach((f) => rmSync(f))

const sources = fichiers.filter((f) => !estVariante(f))
await Promise.all(sources.flatMap((f) => LARGEURS.map((l) =>
  sharp(f).resize({ width: l, withoutEnlargement: true }).webp({ quality: 80 }).toFile(f.replace('.webp', `-${l}.webp`)),
)))
console.log(`[variantes] ${sources.length} images, ${sources.length * LARGEURS.length} variantes`)
