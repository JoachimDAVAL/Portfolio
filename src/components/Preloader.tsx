'use client'

import { createContext, useContext, useEffect, useRef } from 'react'
import { randomChar } from '@/hooks/useTextScramble'
import { INTRO_KEY } from '@/lib/intro'
// Le dessin de l'œil (src/lib/eyeAscii.ts, ~18 Ko) n'est chargé que si l'entrée est jouée (1 fois par session)

// Entrée sur le site : l'œil fermé se remplit en ASCII (caractères tirés au hasard, 1/9 à la fois, en brouillage),
// puis s'ouvre (fermé, presque fermé, mi-ouvert, ouvert : mêmes dessins que le clignement du favicon),
// chaque changement d'état passant par un brouillage. « Bienvenue » apparaît en fondu dessous,
// puis tout se défait et la page se forme.
// Remplace l'ancienne page ENTER : rien à cliquer, environ 2,5 s.
// - une seule fois par session (sessionStorage), décidé avant le premier affichage par INTRO_SCRIPT
// - rien du tout si l'utilisateur a demandé moins de mouvement
// - un clic, une touche ou la molette font repartir l'entrée tout de suite
// - purement visuel (aria-hidden) : la page est déjà là derrière

const STEPS = 9          // l'œil fermé se remplit en 9 temps
const FILL_MS = 70       // écart entre deux temps du remplissage
const CLOSED_MS = 150    // pause sur l'œil fermé avant l'ouverture
// Ouverture en ralenti progressif (le geste démarre vite et se pose) : chaque étape dure plus que la précédente.
// OPEN_GAPS_MS = temps passé sur « presque fermé » puis sur « mi-ouvert » avant l'état suivant
const OPEN_GAPS_MS = [60, 110]
// Durée du brouillage de chaque étape (presque, mi, ouvert), en images (~16 ms) : [minimum, écart aléatoire]
const OPEN_SCRAMBLE: [number, number][] = [[2, 2], [3, 3], [5, 5]]
const HOLD_MS = 700      // pause une fois l'œil ouvert
const WORD_MS = 500      // fondu de « Bienvenue » (garder égal à duration-500 plus bas)
const FONTS_MAX_MS = 800
const NL = String.fromCharCode(10)

// true quand l'entrée est finie (ou n'a pas lieu) : les pages attendent ce signal pour lancer leurs animations
export const IntroContext = createContext(true)
export const useIntroReady = () => useContext(IntroContext)

type Cell = { r: number; c: number; g: number; t: number; to: string; start: number; end: number; busy: boolean }
type Frames = readonly (readonly string[])[]

export default function Preloader({ onDone }: { onDone: () => void }) {
  const preRef = useRef<HTMLPreElement>(null)
  const wordRef = useRef<HTMLSpanElement>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const root = document.documentElement
    const pre = preRef.current
    const word = wordRef.current
    if (root.dataset.intro !== '1' || !pre || !word) {
      onDoneRef.current()
      return
    }
    try { sessionStorage.setItem(INTRO_KEY, '1') } catch {}

    // ---------- Œil : même système que le fond de l'accueil ----------
    // Rempli par setup() une fois le dessin chargé ; d'ici là, l'œil est vide (eye() ne fait rien)
    let frames: Frames = []
    let R = 0
    let grid: string[][] = []
    const cells: Cell[] = []
    const setup = (loaded: Frames) => {
      frames = loaded
      R = loaded[0].length
      const C = loaded[0][0].length
      grid = loaded[0].map(() => Array<string>(C).fill(' '))
      // Toutes les cases utilisées par au moins un des 4 états
      for (let r = 0; r < R; r++) {
        for (let c = 0; c < C; c++) {
          if (loaded.some((f) => f[r][c] !== ' ')) cells.push({ r, c, g: 0, t: 0, to: ' ', start: 0, end: 0, busy: false })
        }
      }
      // Mélange de Fisher-Yates, puis découpage en 9 groupes égaux (pour le remplissage)
      for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[cells[i], cells[j]] = [cells[j], cells[i]]
      }
      cells.forEach((cell, rank) => {
        cell.g = Math.floor((rank * STEPS) / cells.length)
        cell.t = Math.random()
      })
    }

    let active: Cell[] = []
    let frame = 0
    let raf = 0
    let onIdle: (() => void) | null = null
    let shown = 0 // état de l'œil affiché (0 = fermé, 3 = ouvert)

    const render = () => { pre.textContent = grid.map((r) => r.join('')).join(NL) }
    const tick = () => {
      frame++
      active = active.filter((cell) => {
        if (frame >= cell.end) { grid[cell.r][cell.c] = cell.to; cell.busy = false; return false }
        if (frame >= cell.start && (grid[cell.r][cell.c] === ' ' || Math.random() < 0.3)) grid[cell.r][cell.c] = randomChar()
        return true
      })
      render()
      if (active.length) raf = requestAnimationFrame(tick)
      else {
        raf = 0
        const cb = onIdle
        onIdle = null
        cb?.()
      }
    }
    // f = état de l'œil (0 à 3) ; k = nombre de groupes visibles (0 à 9) ;
    // quick = brouillage court [minimum, écart] en images (ouverture), sinon brouillage lent du remplissage ;
    // done = appelé quand tous les caractères sont posés
    const eye = (f: number, k: number, quick: [number, number] | null, done?: () => void) => {
      shown = f
      onIdle = done ?? null
      const target = frames[f]
      for (const cell of cells) {
        const to = cell.g < k ? target[cell.r][cell.c] : ' '
        if (to === cell.to) continue
        cell.to = to
        cell.start = frame + (quick ? Math.floor(Math.random() * 3) : Math.floor(cell.t * 8 + Math.random() * 4))
        cell.end = cell.start + (quick ? quick[0] + Math.floor(Math.random() * (quick[1] + 1)) : 6 + Math.floor(Math.random() * 10))
        // Marqueur plutôt que active.includes() : sinon jusqu'à ~1 million de comparaisons quand tout l'œil change
        if (!cell.busy) { cell.busy = true; active.push(cell) }
      }
      if (!raf) raf = requestAnimationFrame(tick)
    }
    // Taille : la grille occupe toute la hauteur du cadre, puis on l'étire en largeur pour retrouver ses proportions
    const fit = () => {
      if (!R) return
      const box = pre.parentElement!.getBoundingClientRect()
      pre.style.fontSize = box.height / R + 'px'
      pre.style.transform = 'none'
      render()
      const w = pre.getBoundingClientRect().width
      pre.style.transform = 'translateX(-50%) scaleX(' + box.width / w + ')'
    }
    window.addEventListener('resize', fit)

    // ---------- Déroulé ----------
    let ended = false
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const later = (fn: () => void, ms: number) => { timers.push(setTimeout(fn, ms)) }

    const begin = () => {
      if (ended || cancelled) return
      fit()
      // 1. L'œil fermé se remplit
      const closed = new Promise<void>((res) => {
        for (let k = 1; k <= STEPS; k++) later(() => eye(0, k, null, k === STEPS ? res : undefined), (k - 1) * FILL_MS)
      })
      closed.then(() => {
        if (ended || cancelled) return
        // 2. Pause, puis l'œil s'ouvre en 3 temps, de plus en plus lents ; « Bienvenue » arrive pendant l'ouverture
        const open = new Promise<void>((res) => {
          let at = CLOSED_MS
          for (let f = 1; f < frames.length; f++) {
            later(() => eye(f, STEPS, OPEN_SCRAMBLE[f - 1], f === frames.length - 1 ? res : undefined), at)
            at += OPEN_GAPS_MS[f - 1] ?? 0
          }
        })
        const wordIn = new Promise<void>((res) => {
          later(() => { word.style.opacity = '0.5' /* plus bas que l'œil (80 %) : lettres pleines, elles paraissent plus fortes que les caractères épars */; later(res, WORD_MS) }, CLOSED_MS)
        })
        // 3. Pause sur l'œil ouvert, puis sortie
        Promise.all([open, wordIn]).then(() => { if (!ended && !cancelled) later(end, HOLD_MS) })
      })
    }

    const removeSkip = () => {
      window.removeEventListener('pointerdown', end)
      window.removeEventListener('keydown', end)
      window.removeEventListener('wheel', end)
    }
    const end = () => {
      if (ended || cancelled) return
      ended = true
      timers.forEach(clearTimeout)
      removeSkip()
      // L'œil et le mot se défont (depuis leur état du moment), puis la page se forme
      Promise.all([
        new Promise<void>((res) => eye(shown, 0, null, res)),
        new Promise<void>((res) => { word.style.opacity = ''; later(res, WORD_MS) }),
      ]).then(() => {
        if (cancelled) return
        delete root.dataset.intro
        window.removeEventListener('resize', fit)
        onDoneRef.current()
      })
    }
    window.addEventListener('pointerdown', end)
    window.addEventListener('keydown', end)
    window.addEventListener('wheel', end, { passive: true })

    // On attend le dessin de l'œil et les polices (sinon le mot changerait de police en cours de route),
    // ces dernières FONTS_MAX_MS au plus. Si le dessin ne se charge pas, on passe l'entrée.
    Promise.all([
      import('@/lib/eyeAscii'),
      Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, FONTS_MAX_MS))]),
    ]).then(([m]) => {
      if (cancelled) return
      setup(m.EYE_FRAMES)
      begin()
    }, end)

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      cancelAnimationFrame(raf)
      removeSkip()
      window.removeEventListener('resize', fit)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="intro-overlay fixed inset-0 z-[60] bg-background flex-col items-center justify-center gap-6"
    >
      <div className="relative w-[min(80vw,520px)] aspect-[2/1] overflow-hidden opacity-80">
        <pre ref={preRef} className="absolute left-1/2 top-0 m-0 origin-top leading-none whitespace-pre will-change-transform" />
      </div>
      {/* will-change-transform sur l'œil : lissage en niveaux de gris (sinon franges colorées sur le texte étiré) */}
      {/* -mr compense l'espacement après la dernière lettre : le mot reste centré sous l'œil */}
      <span
        ref={wordRef}
        className="-mr-[0.4em] text-xs lg:text-sm tracking-[0.4em] uppercase opacity-0 transition-opacity duration-500 ease-out"
      >
        Bienvenue
      </span>
    </div>
  )
}
