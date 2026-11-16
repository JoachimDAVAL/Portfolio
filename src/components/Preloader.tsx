'use client'

import { createContext, useContext, useEffect, useRef } from 'react'
import { randomChar } from '@/hooks/useTextScramble'
import { EYE_ASCII } from '@/lib/eyeAscii'
import { INTRO_KEY } from '@/lib/intro'

// Entrée sur le site : l'œil se remplit en ASCII (caractères tirés au hasard, 1/9 à la fois, en brouillage),
// « Bienvenue » apparaît en fondu dessous, puis tout se défait et la page se forme.
// Remplace l'ancienne page ENTER : rien à cliquer, environ 2 s.
// - une seule fois par session (sessionStorage), décidé avant le premier affichage par INTRO_SCRIPT
// - rien du tout si l'utilisateur a demandé moins de mouvement
// - un clic, une touche ou la molette font repartir l'entrée tout de suite
// - purement visuel (aria-hidden) : la page est déjà là derrière

const STEPS = 9      // l'œil se remplit en 9 temps
const STEP_MS = 110  // écart entre deux temps
const HOLD_MS = 700  // pause une fois l'œil complet
const WORD_MS = 500  // fondu de « Bienvenue » (garder égal à duration-500 plus bas)
const FONTS_MAX_MS = 800
const NL = String.fromCharCode(10)

// true quand l'entrée est finie (ou n'a pas lieu) : les pages attendent ce signal pour lancer leurs animations
export const IntroContext = createContext(true)
export const useIntroReady = () => useContext(IntroContext)

type Cell = { r: number; c: number; ch: string; g: number; t: number; shown: boolean; to: string; start: number; end: number }

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
    const R = EYE_ASCII.length
    const C = EYE_ASCII[0].length
    const grid = EYE_ASCII.map(() => Array<string>(C).fill(' '))
    const cells: Cell[] = []
    EYE_ASCII.forEach((row, r) => {
      for (let c = 0; c < C; c++) {
        if (row[c] !== ' ') cells.push({ r, c, ch: row[c], g: 0, t: 0, shown: false, to: ' ', start: 0, end: 0 })
      }
    })
    // Mélange de Fisher-Yates, puis découpage en 9 groupes égaux
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cells[i], cells[j]] = [cells[j], cells[i]]
    }
    cells.forEach((cell, rank) => {
      cell.g = Math.floor((rank * STEPS) / cells.length)
      cell.t = Math.random()
    })

    let active: Cell[] = []
    let frame = 0
    let raf = 0
    let onIdle: (() => void) | null = null

    const render = () => { pre.textContent = grid.map((r) => r.join('')).join(NL) }
    const tick = () => {
      frame++
      active = active.filter((cell) => {
        if (frame >= cell.end) { grid[cell.r][cell.c] = cell.to; return false }
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
    // k = nombre de groupes visibles (0 à 9) ; done = appelé quand tous les caractères sont posés
    const eye = (k: number, done?: () => void) => {
      onIdle = done ?? null
      for (const cell of cells) {
        const want = cell.g < k
        if (want === cell.shown) continue
        cell.shown = want
        cell.to = want ? cell.ch : ' '
        cell.start = frame + Math.floor(cell.t * 8 + Math.random() * 4)
        cell.end = cell.start + 6 + Math.floor(Math.random() * 10)
        if (!active.includes(cell)) active.push(cell)
      }
      if (!raf) raf = requestAnimationFrame(tick)
    }
    // Taille : la grille occupe toute la hauteur du cadre, puis on l'étire en largeur pour retrouver ses proportions
    const fit = () => {
      const box = pre.parentElement!.getBoundingClientRect()
      pre.style.fontSize = box.height / R + 'px'
      pre.style.transform = 'none'
      render()
      const w = pre.getBoundingClientRect().width
      pre.style.transform = 'translateX(-50%) scaleX(' + box.width / w + ')'
    }
    fit()
    window.addEventListener('resize', fit)

    // ---------- Déroulé ----------
    let ended = false
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const later = (fn: () => void, ms: number) => { timers.push(setTimeout(fn, ms)) }

    const begin = () => {
      if (ended || cancelled) return
      fit()
      const eyeFull = new Promise<void>((res) => {
        for (let k = 1; k <= STEPS; k++) later(() => eye(k, k === STEPS ? res : undefined), (k - 1) * STEP_MS)
      })
      const wordIn = new Promise<void>((res) => {
        later(() => { word.style.opacity = '0.5' /* plus bas que l'œil (80 %) : lettres pleines, elles paraissent plus fortes que les caractères épars */; later(res, WORD_MS) }, 3 * STEP_MS)
      })
      Promise.all([eyeFull, wordIn]).then(() => { if (!ended && !cancelled) later(end, HOLD_MS) })
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
        new Promise<void>((res) => eye(0, res)),
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

    // On attend les polices (sinon le mot changerait de police en cours de route), FONTS_MAX_MS au plus
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, FONTS_MAX_MS))]).then(begin)

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
