'use client'

import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react'
import { extrait, signature, type Avis } from '@/lib/avis'
import { NBSP } from '@/lib/text'
import Texte from './Texte'
import { cacher, masquer, montrer, preparer } from './moteur'

// Un avis à la fois, en boucle, même brouillage que les diapos. Chevrons, flèches gauche / droite, swipe horizontal.
// Pas de défilement automatique (accessibilité).
const chevron = 'size-11 flex items-center justify-center opacity-60 hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-150 cursor-pointer'
const CHEVAUCHEMENT_MS = 120

export default function SliderAvis({ avis }: { avis: Avis[] }) {
  const listeRef = useRef<HTMLDivElement>(null)
  const courantRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const toucheRef = useRef<{ x: number; y: number } | null>(null)
  const [actif, setActif] = useState(0)
  const [annonce, setAnnonce] = useState('')
  const n = avis.length

  const aller = useCallback((cible: number) => {
    const liste = listeRef.current
    const diapo = liste?.closest<HTMLElement>('[data-slide]')
    const i = (cible + n) % n
    if (!liste || !diapo || i === courantRef.current) return
    const from = liste.children[courantRef.current] as HTMLElement
    const to = liste.children[i] as HTMLElement
    courantRef.current = i
    cacher(from)
    from.dataset.off = '' // ignoré quand la diapo entière entre ou sort
    delete to.dataset.off
    preparer(to)
    setActif(i)
    setAnnonce(`Avis ${i + 1} sur ${n} : ${avis[i].texte} ${signature(avis[i])}`)
    clearTimeout(timerRef.current)
    // Diapo quittée entre-temps : l'avis se formera au retour
    timerRef.current = setTimeout(() => { if (!diapo.inert) montrer(to) }, CHEVAUCHEMENT_MS)
  }, [avis, n])

  useEffect(() => {
    const liste = listeRef.current
    if (!liste || n < 2) return
    Array.from(liste.children).forEach((fig, i) => { if (i !== courantRef.current) masquer(fig as HTMLElement) })
    const onKey = (e: KeyboardEvent) => {
      const diapo = liste.closest<HTMLElement>('[data-slide]')
      if (!diapo || diapo.inert || diapo.hasAttribute('data-masquee') || e.altKey || e.ctrlKey || e.metaKey) return
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      e.preventDefault()
      aller(courantRef.current + (e.key === 'ArrowRight' ? 1 : -1))
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(timerRef.current)
      window.removeEventListener('keydown', onKey)
    }
  }, [aller, n])

  const onTouchStart = (e: TouchEvent) => {
    toucheRef.current = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null
  }
  const onTouchEnd = (e: TouchEvent) => {
    const t = toucheRef.current
    toucheRef.current = null
    if (!t || n < 2) return
    const dx = t.x - e.changedTouches[0].clientX
    const dy = t.y - e.changedTouches[0].clientY
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return
    aller(courantRef.current + (dx > 0 ? 1 : -1))
  }

  return (
    <>
      {/* Avis superposés dans la même case : la hauteur est celle du plus long, rien ne bouge au changement */}
      <div ref={listeRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} className="avis-liste touch-pan-y grid grid-cols-1 w-full max-w-3xl min-[1500px]:max-w-4xl mx-auto">
        {avis.map((a, i) => (
          <figure key={i} data-off={i ? '' : undefined} data-masquee={i ? '' : undefined} className="[grid-area:1/1] flex flex-col items-center gap-6 text-center">
            {/* my-auto : un avis court est centré dans la hauteur du plus long, les signatures restent au même niveau */}
            <blockquote className="w-full my-auto text-base md:text-xl min-[1500px]:text-2xl leading-relaxed md:leading-relaxed min-[1500px]:leading-relaxed">
              <Texte step={3} delay={4}>{`«${NBSP}${extrait(a.texte)}${NBSP}»`}</Texte>
            </blockquote>
            <span aria-hidden="true" className="fade h-px w-12 bg-current/50" />
            <figcaption className="w-full text-xs tracking-widest uppercase opacity-60">
              <Texte delay={10}>{signature(a)}</Texte>
            </figcaption>
          </figure>
        ))}
      </div>
      {n > 1 ? (
        <div className="fade flex items-center justify-center gap-4">
          <button type="button" aria-label="Avis précédent" onClick={() => aller(courantRef.current - 1)} className={chevron}>
            <svg aria-hidden="true" viewBox="0 0 12 20" className="h-5 w-3 fill-none stroke-current"><path d="M11 1 2 10l9 9" /></svg>
          </button>
          <span aria-hidden="true" className="flex gap-3">
            {avis.map((a, i) => <span key={i} className={`size-1.5 rounded-full bg-current ${i === actif ? '' : 'opacity-30'}`} />)}
          </span>
          <button type="button" aria-label="Avis suivant" onClick={() => aller(courantRef.current + 1)} className={chevron}>
            <svg aria-hidden="true" viewBox="0 0 12 20" className="h-5 w-3 fill-none stroke-current"><path d="m1 1 9 9-9 9" /></svg>
          </button>
        </div>
      ) : null}
      <p aria-live="polite" className="sr-only">{annonce}</p>
    </>
  )
}
