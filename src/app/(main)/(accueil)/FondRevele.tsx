'use client'

import { useEffect, useRef } from 'react'
import { FRAME_MS, randomChar } from '@/hooks/useTextScramble'

// Fond décoratif : l'œil du favicon en ASCII, révélé par points dispersés au hasard.
// Rien sur la première diapo, puis une part égale des caractères à chaque diapo, jusqu'à l'œil complet.
// Tirage refait à chaque visite. Le dessin (~17 Ko) est chargé après la page.
type Cell = { r: number; c: number; ch: string; g: number; t: number; shown: boolean; busy: boolean; to: string; start: number; end: number }

const NL = String.fromCharCode(10)

export default function FondRevele({ diapo, total }: { diapo: number; total: number }) {
  const preRef = useRef<HTMLPreElement>(null)
  const diapoRef = useRef(diapo)
  const revelerRef = useRef<(n: number) => void>(() => {})

  useEffect(() => {
    diapoRef.current = diapo
    revelerRef.current(diapo)
  }, [diapo])

  useEffect(() => {
    const pre = preRef.current
    if (!pre) return
    let annule = false
    let raf = 0
    let fit = () => {}
    const redimensionner = () => fit()

    Promise.all([import('@/lib/logoAscii'), document.fonts.ready]).then(([{ LOGO_ASCII }]) => {
      if (annule) return
      const R = LOGO_ASCII.length
      const grid = LOGO_ASCII.map((ligne) => Array<string>(ligne.length).fill(' '))
      const cells: Cell[] = []
      LOGO_ASCII.forEach((ligne, r) => {
        for (let c = 0; c < ligne.length; c++) {
          if (ligne[c] !== ' ') cells.push({ r, c, ch: ligne[c], g: 0, t: Math.random(), shown: false, busy: false, to: ' ', start: 0, end: 0 })
        }
      })
      // Mélange de Fisher-Yates, puis découpage en total - 1 groupes égaux
      for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[cells[i], cells[j]] = [cells[j], cells[i]]
      }
      cells.forEach((cell, rang) => { cell.g = Math.floor((rang * (total - 1)) / cells.length) })

      const render = () => { pre.textContent = grid.map((r) => r.join('')).join(NL) }
      const t0 = performance.now()
      const clock = () => Math.floor((performance.now() - t0) / FRAME_MS)
      let frame = 0
      let active: Cell[] = []
      const tick = () => {
        const f = clock()
        // Écran plus rapide que 60 Hz : rien à changer tant qu'on est dans la même image
        if (f === frame) { raf = requestAnimationFrame(tick); return }
        frame = f
        active = active.filter((cell) => {
          if (frame >= cell.end) { grid[cell.r][cell.c] = cell.to; cell.busy = false; return false }
          if (frame >= cell.start && (grid[cell.r][cell.c] === ' ' || Math.random() < 0.3)) grid[cell.r][cell.c] = randomChar()
          return true
        })
        render()
        raf = active.length ? requestAnimationFrame(tick) : 0
      }

      revelerRef.current = (n) => {
        const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        frame = clock()
        for (const cell of cells) {
          const voulu = cell.g < n
          if (voulu === cell.shown) continue
          cell.shown = voulu
          cell.to = voulu ? cell.ch : ' '
          if (reduit) { grid[cell.r][cell.c] = cell.to; continue }
          // Départs étalés dans le temps : les caractères ne s'allument pas tous en même temps
          cell.start = frame + Math.floor(cell.t * 16 + Math.random() * 6)
          cell.end = cell.start + 6 + Math.floor(Math.random() * 10)
          if (!cell.busy) { cell.busy = true; active.push(cell) }
        }
        if (reduit) render()
        else if (!raf) raf = requestAnimationFrame(tick)
      }

      // La grille occupe toute la hauteur du cadre, puis on l'étire en largeur pour retrouver ses proportions
      fit = () => {
        const box = pre.parentElement!.getBoundingClientRect()
        pre.style.fontSize = box.height / R + 'px'
        pre.style.transform = 'none'
        render()
        pre.style.transform = 'translateX(-50%) scaleX(' + box.width / pre.getBoundingClientRect().width + ')'
      }
      fit()
      revelerRef.current(diapoRef.current)
    }, () => {}) // décoratif : sans le dessin, la page reste complète

    window.addEventListener('resize', redimensionner)
    return () => {
      annule = true
      cancelAnimationFrame(raf)
      revelerRef.current = () => {}
      window.removeEventListener('resize', redimensionner)
    }
  }, [total])

  return (
    <div aria-hidden="true" className="flex print:hidden fixed inset-0 z-0 items-center justify-center pointer-events-none overflow-hidden">
      {/* Cadre 2:1, plus large que l'écran sur mobile : sinon l'œil serait minuscule en portrait */}
      <div className="relative shrink-0 w-[130vw] h-[65vw] lg:w-screen lg:h-[50vw] opacity-[0.05]">
        <pre ref={preRef} className="absolute left-1/2 top-0 m-0 origin-top leading-none whitespace-pre" />
      </div>
    </div>
  )
}
