'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useIntroReady } from '@/components/Preloader'
import ProjetModal from '@/components/ProjetModal'
import type { Projet } from '@/lib/projets'
import FondRevele from './FondRevele'
import { FicheContext } from './fiche'
import { cacher, masquer, montrer, petitEcran } from './moteur'

// La page ne défile pas : les diapositives ([data-slide], rendues par le serveur) se remplacent dans le cadre.
// Molette, clavier, swipe vertical ou bouton Scroll.

// Molette : un nouveau geste (plus de GAP_MS de calme avant lui) change de diapo tout de suite.
// Si on continue dans le même geste, on avance encore d'une diapo toutes les REPEAT_MS au moins, une fois REPEAT_DIST
// parcourue : un long geste fait défiler les diapos, mais l'inertie d'un trackpad n'en saute pas plusieurs.
const GAP_MS = 120
const REPEAT_MS = 350
const REPEAT_DIST = 200
const SWIPE_DIST = 50 // px
const CHEVAUCHEMENT_MS = 120 // la diapo suivante se forme pendant que l'autre se défait

export default function Diaporama({ total, children }: { total: number; children: ReactNode }) {
  const ready = useIntroReady()
  const cadreRef = useRef<HTMLDivElement>(null)
  const boutonRef = useRef<HTMLButtonElement>(null)
  const allerRef = useRef<(n: number) => void>(() => {})
  const [diapo, setDiapo] = useState(0)
  const [annonce, setAnnonce] = useState('')
  const derniere = diapo === total - 1

  // Fiche d'un projet par-dessus les diapos, qui s'effacent (même fonctionnement que /projets).
  // ficheRef : lue par les écouteurs, pour ne pas changer de diapo derrière la fiche.
  const [fiche, setFiche] = useState<Projet | null>(null)
  const [ficheOuverte, setFicheOuverte] = useState(false)
  const ficheRef = useRef(false)
  const declencheurRef = useRef<HTMLElement | null>(null)

  const ouvrirFiche = useCallback((projet: Projet) => {
    if (ficheRef.current) return
    ficheRef.current = true
    declencheurRef.current = document.activeElement as HTMLElement
    setFiche(projet)
    // double rAF : laisse le DOM monter la fiche avant de lancer la transition d'entrée
    requestAnimationFrame(() => requestAnimationFrame(() => setFicheOuverte(true)))
  }, [])

  const fermerFiche = useCallback(() => {
    setFicheOuverte(false)
    setTimeout(() => {
      ficheRef.current = false
      setFiche(null)
      declencheurRef.current?.focus({ preventScroll: true })
    }, 300)
  }, [])

  useEffect(() => {
    const cadre = cadreRef.current
    if (!ready || !cadre) return
    const slides = Array.from(cadre.querySelectorAll<HTMLElement>('[data-slide]'))
    let cur = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    slides.forEach((s, i) => { if (i) masquer(s) })
    setDiapo(0)
    montrer(slides[0])

    // Pas de verrou : on peut enchaîner les diapos (chaque texte repart de son état du moment)
    const aller = (n: number) => {
      if (n === cur || n < 0 || n >= slides.length) return
      const from = slides[cur]
      const to = slides[n]
      cur = n
      setDiapo(n)
      setAnnonce(`Diapositive ${n + 1} sur ${slides.length} : ${to.getAttribute('aria-label')}`)
      // Le bouton Scroll s'efface sur la dernière diapo : le focus ne doit pas se perdre avec lui
      const focusPerdu = n === slides.length - 1 && document.activeElement === boutonRef.current
      to.scrollTop = 0
      cacher(from)
      clearTimeout(timer)
      timer = setTimeout(() => {
        montrer(to)
        if (focusPerdu) to.focus({ preventScroll: true })
      }, CHEVAUCHEMENT_MS)
    }
    allerRef.current = aller

    // Sous 1024 px, une diapo plus haute que l'écran défile à l'intérieur
    const peutDefiler = (sens: number) => {
      const s = slides[cur]
      if (!petitEcran()) return false
      return sens > 0 ? s.scrollTop + s.clientHeight < s.scrollHeight - 1 : s.scrollTop > 1
    }

    // ---------- Molette / trackpad ----------
    let lastWheel = 0
    let lastChange = 0
    let acc = 0
    let lecture = false // le geste en cours a fait défiler l'intérieur d'une diapo : il n'en change pas
    const onWheel = (e: WheelEvent) => {
      if (ficheRef.current || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return // zoom du navigateur, slider des projets
      const delta = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY
      if (Math.abs(delta) < 2) { e.preventDefault(); return }
      const now = performance.now()
      const nouveau = now - lastWheel > GAP_MS
      lastWheel = now
      if (nouveau) lecture = false
      if (peutDefiler(delta)) {
        lecture = true
        if (!slides[cur].contains(e.target as Node)) slides[cur].scrollTop += delta
        return
      }
      e.preventDefault()
      if (lecture) return
      if (nouveau || (acc !== 0 && Math.sign(acc) !== Math.sign(delta))) acc = 0
      acc += delta
      if (nouveau || (now - lastChange > REPEAT_MS && Math.abs(acc) > REPEAT_DIST)) {
        aller(cur + (delta > 0 ? 1 : -1))
        lastChange = now
        acc = 0
      }
    }

    // ---------- Clavier ----------
    const onKey = (e: KeyboardEvent) => {
      if (ficheRef.current || e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey) return
      const cible = e.target instanceof Element ? e.target : null
      if (cible?.closest('input, textarea, select')) return
      if (e.key === ' ' && cible?.closest('button')) return // Espace active le bouton
      const avance = e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)
      const recule = e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)
      if (avance || recule) {
        e.preventDefault()
        const sens = avance ? 1 : -1
        if (!peutDefiler(sens)) aller(cur + sens)
        else slides[cur].scrollBy({ top: sens * (e.key.startsWith('Arrow') ? 60 : slides[cur].clientHeight * 0.8) })
      } else if (e.key === 'Home') {
        e.preventDefault()
        aller(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        aller(slides.length - 1)
      }
    }

    // ---------- Swipe ----------
    // Diapo plus haute que l'écran : on ne change que si le geste commence déjà au bord (pas de saut pendant la lecture).
    // Sens verrouillé au premier mouvement net : un geste horizontal (projets, avis) ne change jamais de diapo.
    let tY: number | null = null
    let tX = 0
    let axe: 'x' | 'y' | null = null
    let enHaut = true
    let enBas = true
    const onTouchStart = (e: TouchEvent) => {
      if (ficheRef.current || e.touches.length !== 1) { tY = null; return }
      tY = e.touches[0].clientY
      tX = e.touches[0].clientX
      axe = null
      enHaut = !peutDefiler(-1)
      enBas = !peutDefiler(1)
    }
    const onTouchMove = (e: TouchEvent) => {
      if (tY === null) return
      const dy = tY - e.touches[0].clientY // > 0 : le doigt monte (on avance)
      const dx = tX - e.touches[0].clientX
      if (!axe && Math.max(Math.abs(dx), Math.abs(dy)) > 8) axe = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      if (axe !== 'y') return
      // Au bord : pas de défilement natif (rebond, tirer pour actualiser)
      if (e.cancelable && ((dy > 0 && enBas) || (dy < 0 && enHaut))) e.preventDefault()
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (tY === null) return
      const dy = tY - e.changedTouches[0].clientY
      tY = null
      if (axe !== 'y' || Math.abs(dy) < SWIPE_DIST) return
      if (dy > 0 && enBas) aller(cur + 1)
      else if (dy < 0 && enHaut) aller(cur - 1)
    }
    const onTouchCancel = () => { tY = null }

    // « Accueil » dans la navbar : retour à la première diapo
    const onClick = (e: MouseEvent) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || !(e.target instanceof Element)) return
      if (!e.target.closest('a[href="/"]')) return
      if (ficheRef.current) fermerFiche()
      aller(0)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchCancel)
    document.addEventListener('click', onClick)
    return () => {
      clearTimeout(timer)
      allerRef.current = () => {}
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchCancel)
      document.removeEventListener('click', onClick)
    }
  }, [ready, fermerFiche])

  return (
    <main className="accueil relative flex flex-col lg:flex-row items-center justify-center lg:h-dvh lg:overflow-hidden">
      <FondRevele diapo={diapo} total={total} />

      {/* Cadre : même largeur que la grid de /projets, hauteur un peu plus généreuse */}
      <div ref={cadreRef} inert={ficheOuverte} className={`cadre ${ficheOuverte ? 'opacity-0' : ''} transition-opacity duration-300 motion-reduce:transition-none z-10 relative w-[90vw] lg:w-[var(--frame-w)] lg:h-[var(--frame-h)] text-sm min-[1700px]:text-base`}>
        <FicheContext.Provider value={ouvrirFiche}>{children}</FicheContext.Provider>

        {/* Progression : verticale entre le cadre et le bouton Scroll ; horizontale au-dessus du bouton sur écran tactile et sous 1024 px */}
        <div aria-hidden="true" className="progres" style={{ '--avance': (diapo + 1) / total } as CSSProperties}>
          <div><div /></div>
        </div>
        <p className="sr-only" aria-live="polite">{annonce}</p>
      </div>

      <button
        ref={boutonRef}
        type="button"
        data-sorti={derniere || ficheOuverte ? '' : undefined}
        inert={derniere || ficheOuverte}
        onClick={() => allerRef.current(diapo + 1)}
        className="bouton-scroll fade group flex absolute z-10 bottom-5 text-xs lg:bottom-6 lg:text-base left-1/2 -translate-x-1/2 items-center gap-3 tracking-[0.3em] uppercase cursor-pointer"
      >
        <span aria-hidden="true" className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150">[</span>
        {/* -mr-[0.3em] compense l'espacement ajouté après la dernière lettre : le mot est centré sur la barre */}
        <span className="inline-block -mr-[0.3em] animate-bounce motion-reduce:animate-none">Scroll</span>
        <span aria-hidden="true" className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150">]</span>
      </button>

      {/* Mêmes dimensions que sur /projets (.projets-frame, globals.css) */}
      {fiche ? (
        <div className="projets-frame lg:absolute lg:inset-0 lg:m-auto lg:w-[var(--grid-w)] lg:h-[var(--grid-h)] lg:z-20">
          <ProjetModal projet={fiche} open={ficheOuverte} onClose={fermerFiche} />
        </div>
      ) : null}
    </main>
  )
}
