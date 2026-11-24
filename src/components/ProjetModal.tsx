'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useTextScramble } from '@/hooks/useTextScramble'
import type { GalerieImage, Projet } from '@/lib/projets'

// Fiche d'un projet (/projets et accueil). À placer dans un cadre .projets-frame (ses dimensions sur ordinateur).

// Galerie à loupe : miniatures pleine page à gauche (30%), loupe "bande pleine largeur" à droite (65% + débord de 1/3 hors de la modale).
// La loupe est pilotée par le scroll de la modale (pas par le curseur) : une fois la section atteinte,
// la progression du scroll parcourt les miniatures de haut en bas, l'une après l'autre.
// Sert pour l'Avant / Après comme pour une sélection de pages du site.
function Galerie({ images, defaut = 0, titre, open }: { images: GalerieImage[]; defaut?: number; titre: string; open: boolean }) {
  // placeholderRef : bloc invisible dans la modale, qui garde la place et le comportement sticky de la loupe.
  // panelRef : loupe visible, rendue dans <body> (portal) pour pouvoir déborder à droite de la modale
  //            (la modale scrolle → elle couperait tout ce qui dépasse, y compris horizontalement).
  const placeholderRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(defaut)
  const [offsets, setOffsets] = useState<number[]>(() => images.map(() => 0))
  // Position/hauteur du repère sur la miniature active (en % de la miniature)
  const [lens, setLens] = useState<{ top: number; height: number } | null>(null)
  // Position de la loupe visible, recalée sur le placeholder
  const [box, setBox] = useState<{ left: number; top: number; width: number; height: number; clipTop: number; clipBottom: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const thumbRefs = useRef<(HTMLImageElement | null)[]>([])

  // Recale la loupe visible sur le placeholder : même bord gauche, même hauteur, largeur × 4/3 (déborde à droite).
  // Haut et bas restent coupés aux bords de la modale ; seul le débordement à droite est autorisé.
  const sync = useCallback(() => {
    const ph = placeholderRef.current
    if (!ph) return
    const r = ph.getBoundingClientRect()
    if (r.width === 0) { setBox(null); return } // placeholder masqué (mobile)
    const dialog = ph.closest('[role="dialog"]')
    const d = dialog?.getBoundingClientRect()
    // En fin de scroll, la section se termine et le placeholder se décolle (il remonte avec elle) :
    // la loupe ne remonte jamais au-dessus de sa position sticky → elle ne passe pas sous le bouton fermer.
    // Le sticky se cale sous le padding de la modale : position collée = haut + padding + top.
    const stickyTop = d && dialog
      ? d.top + (parseFloat(getComputedStyle(dialog).paddingTop) || 0) + (parseFloat(getComputedStyle(ph).top) || 0)
      : r.top
    const top = Math.max(r.top, stickyTop)
    setBox({
      left: r.left,
      top,
      width: (r.width * 4) / 3,
      height: r.height,
      clipTop: d ? Math.max(0, d.top - top) : 0,
      clipBottom: d ? Math.max(0, top + r.height - d.bottom) : 0,
    })
  }, [])

  const update = useCallback((index: number, thumb: DOMRect, clientY: number) => {
    const panel = panelRef.current
    if (!panel) return
    const panelW = panel.clientWidth
    const panelH = panel.clientHeight
    const zoom = panelW / thumb.width
    const zoomedH = thumb.height * zoom
    const ratio = Math.min(Math.max((clientY - thumb.top) / thumb.height, 0), 1)
    const maxOffset = Math.max(zoomedH - panelH, 0)
    const offset = Math.min(Math.max(ratio * zoomedH - panelH / 2, 0), maxOffset)

    setActive(index)
    setOffsets((o) => o.map((v, i) => (i === index ? offset : v)))
    setLens({ top: (offset / zoomedH) * 100, height: Math.min(panelH / zoomedH, 1) * 100 })
  }, [])

  // Loupe pilotée par le scroll, quelle que soit la position du curseur.
  // Arrivée dans la section = la loupe (sticky) se bloque et les miniatures commencent à passer au-dessus d'elle.
  // De là jusqu'au bas de la modale, la progression p (0 → 1) déplace un point de lecture
  // du haut de la 1re miniature au bas de la dernière ; la miniature sous ce point devient active.
  const follow = useCallback(() => {
    const ph = placeholderRef.current
    const scroller = ph?.closest('[role="dialog"]')
    const imgs = thumbRefs.current.slice(0, images.length)
    if (!ph || !scroller || ph.offsetWidth === 0 || imgs.length === 0 || imgs.some((img) => !img)) return
    const rects = imgs.map((img) => img!.getBoundingClientRect())

    const parcouru = ph.getBoundingClientRect().top - rects[0].top
    if (parcouru <= 1) {
      // Avant la section : loupe au repos sur l'image par défaut
      setActive(defaut)
      setLens(null)
      setOffsets((o) => (o.every((v) => v === 0) ? o : o.map(() => 0)))
      return
    }
    const reste = Math.max(scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop, 0)
    const p = Math.min(parcouru / (parcouru + reste), 1)
    const y = rects[0].top + p * (rects[rects.length - 1].bottom - rects[0].top)
    let index = 0
    rects.forEach((r, i) => { if (r.top <= y) index = i }) // dans l'espace entre deux miniatures → la suivante, en haut
    update(index, rects[index], y)
  }, [images.length, defaut, update])

  // Scroll de la modale : recale la loupe sur le placeholder + avance dans les maquettes
  useEffect(() => {
    const scroller = placeholderRef.current?.closest('[role="dialog"]')
    if (!scroller) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        sync()
        follow()
      })
    }
    scroller.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [sync, follow])

  // Pendant l'animation d'ouverture / fermeture (la modale glisse), on suit le placeholder frame par frame
  useEffect(() => {
    let frame = 0
    const start = performance.now()
    const loop = () => {
      sync()
      if (performance.now() - start < 450) frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [open, sync])

  return (
    <section className="flex flex-col lg:flex-row items-start gap-10 lg:gap-[5%]">
      {/* Miniatures */}
      <div className="flex flex-col gap-8 w-full lg:w-[30%] shrink-0">
        {images.map(({ label, src, flou }, index) => (
          <figure key={src} className="flex flex-col gap-3">
            <figcaption className="h-6 leading-6 text-xs lg:text-sm min-[1700px]:text-base tracking-widest uppercase">{label}</figcaption>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- même fichier que la loupe : un seul téléchargement */}
              <img
                ref={(el) => { thumbRefs.current[index] = el }}
                src={src}
                alt={flou ? `${titre} — ${label}, aperçu disponible à la mise en ligne` : `${titre} — ${label}, page complète`}
                loading="lazy"
                className="block w-full h-auto"
              />
              {flou ? (
                // sticky : la mention reste visible pendant que la longue miniature défile
                <span aria-hidden="true" className="absolute inset-0 pointer-events-none">
                  <span className="sticky top-1/3 block py-16 text-center text-xs tracking-widest uppercase whitespace-nowrap">
                    [ aperçu à venir ]
                  </span>
                </span>
              ) : null}
              {lens && active === index ? (
                <span
                  aria-hidden="true"
                  className="hidden lg:block absolute left-0 w-full border border-current/70 pointer-events-none transition-[top] duration-[400ms] ease-out"
                  style={{ top: `${lens.top}%`, height: `${lens.height}%` }}
                />
              ) : null}
            </div>
          </figure>
        ))}
      </div>

      {/* Placeholder de la loupe (desktop) : invisible, garde la place et le sticky.
          mt-9 = hauteur du libellé (h-6) + gap du figure (gap-3) → alignée sur le haut de la 1re image.
          top-16 → la loupe reste sous le bouton fermer. */}
      <div
        ref={placeholderRef}
        aria-hidden="true"
        className="hidden lg:block w-[65%] h-[calc(var(--grid-h)_-_6rem)] mt-9 sticky top-16"
      />

      {/* Loupe visible : rendue dans <body>, 4/3 de la largeur du placeholder → déborde à droite de la modale */}
      {mounted && box
        ? createPortal(
            <div
              ref={panelRef}
              aria-hidden="true"
              className={
                'hidden lg:block fixed z-40 overflow-hidden pointer-events-none transition-opacity duration-300 ease-out motion-reduce:transition-none ' +
                (open ? 'opacity-100' : 'opacity-0')
              }
              style={{
                left: box.left,
                top: box.top,
                width: box.width,
                height: box.height,
                clipPath: `inset(${box.clipTop}px 0 ${box.clipBottom}px 0)`,
              }}
            >
              {images.map(({ src }, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt=""
                  className={
                    'absolute top-0 left-0 w-full h-auto max-w-none transition-[transform,opacity] duration-[400ms] ease-out motion-reduce:transition-none ' +
                    (active === index ? 'opacity-100' : 'opacity-0')
                  }
                  style={{ transform: `translateY(-${offsets[index]}px)` }}
                />
              ))}
              <span className="absolute top-3 left-3 px-2 py-1 bg-[#141414]/80 text-xs tracking-widest uppercase">
                {images[active]?.label}
              </span>
              {images[active]?.flou ? (
                <span className="absolute inset-0 flex items-center justify-center text-sm lg:text-base tracking-widest uppercase">
                  [ aperçu à la mise en ligne ]
                </span>
              ) : null}
            </div>,
            document.body
          )
        : null}
    </section>
  )
}

// Texte scramblé sans décalage de layout : une copie invisible réserve la place,
// le texte animé est superposé, et une copie sr-only reste lisible par les lecteurs d'écran.
function ScrambleText({ text, revealed, delay = 0, step = 1, block = false }: {
  text: string
  revealed: boolean
  delay?: number
  step?: number
  block?: boolean
}) {
  const display = useTextScramble(text, revealed, delay, step)
  return (
    <span className={`relative ${block ? 'block' : 'inline-block'}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="invisible">{text}</span>
      <span aria-hidden="true" className="absolute inset-0">{display}</span>
    </span>
  )
}

export default function ProjetModal({ projet, open, onClose }: { projet: Projet; open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    dialogRef.current?.focus()
    window.dispatchEvent(new Event('navbar:montrer')) // layout.tsx : navbar visible à l'ouverture et à la fermeture
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      window.dispatchEvent(new Event('navbar:montrer'))
    }
  }, [open, onClose])

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="projet-modal-titre"
      tabIndex={-1}
      className={
        // Mobile : plein écran sous la navbar — Desktop : exactement la zone de la grid
        'fixed inset-0 z-40 pt-24 px-4 pb-8 lg:absolute lg:z-10 lg:p-8 ' +
        // Desktop : fond transparent, la modale flotte au-dessus de la page — Mobile : voile flouté pour la lisibilité
        'bg-[#141414]/80 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none overflow-y-auto overscroll-contain outline-none ' +
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden ' +
        'transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ' +
        (open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none')
      }
    >
      {/* Conteneur interne : donne au bouton sticky un bloc aussi haut que tout le contenu
          (enfant direct de la modale, il serait limité à la hauteur fixe de la modale). */}
      <div className="relative">
      {/* Bouton fermer sticky : reste en haut à droite pendant TOUT le scroll (galerie comprise).
          Wrapper h-0 → ne prend pas de place ; top = padding haut de la modale → pas de saut au démarrage.
          La loupe démarre plus bas (lg:top-16) pour ne jamais passer sous ce bouton. */}
      {/* mix-blend-difference sur le wrapper (et non le bouton) : le z-20 crée un contexte d'empilement qui isolerait
          le mélange → le bouton s'inverse selon le fond qu'il survole (crème sur sombre, foncé sur image claire). */}
      <div className="sticky top-24 lg:top-8 z-20 h-0 flex justify-end pointer-events-none mix-blend-difference">
        <button
          type="button"
          onClick={onClose}
          className="group pointer-events-auto flex gap-2 text-xs lg:text-sm tracking-widest uppercase cursor-pointer"
        >
          <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-100">[</span>
          fermer
          <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-100">]</span>
        </button>
      </div>

      {/* Présentation : occupe presque toute la hauteur visible de la modale (desktop),
          on ne voit qu'un petit bout de l'avant / après pour donner envie de scroller */}
      <div className={`flex flex-col ${projet.galerie?.length ? 'lg:min-h-[calc(var(--grid-h)_-_8rem)]' : ''}`}>
      {/* Informations générales */}
      <header className="flex flex-col gap-6">
        {/* 3 colonnes : infos | titre centré | vide (zone du bouton fermer) */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-6 lg:gap-10">
          <div className="flex flex-col gap-1 pt-1 lg:pt-2 text-xs lg:text-sm min-[1700px]:text-base shrink-0">
            <ScrambleText text={projet.annee} revealed={open} delay={4} />
            <ScrambleText text={projet.type} revealed={open} delay={8} />
          </div>
          <h2 id="projet-modal-titre" className="font-title tracking-widest uppercase text-5xl md:text-6xl lg:text-7xl leading-none text-center">
            <ScrambleText text={projet.titre} revealed={open} />
          </h2>
        </div>

        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-title text-lg lg:text-2xl min-[1700px]:text-3xl tracking-widest uppercase">
          {projet.interventions.map((i, idx) => (
            <li key={i}><ScrambleText text={i} revealed={open} delay={12 + idx * 4} /></li>
          ))}
        </ul>
      </header>

      {/* Description + image */}
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col gap-4 text-xs min-[1700px]:text-sm leading-relaxed">
          {projet.description.map((para, idx) => (
            <p key={idx}><ScrambleText text={para} revealed={open} delay={16 + idx * 6} step={5} block /></p>
          ))}
        </div>
        <div className="relative">
          <Image
            src={projet.image}
            alt={projet.enCours ? `Projet ${projet.titre} en cours, aperçu disponible à la mise en ligne` : `Page d'accueil du projet ${projet.titre}`}
            width={2880}
            height={1620}
            sizes="(min-width: 1024px) 30vw, 90vw"
            className="w-full h-auto"
          />
          {projet.enCours ? (
            <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-sm lg:text-base tracking-widest uppercase">
              [ en cours ]
            </span>
          ) : null}
        </div>
      </section>

      {/* CTA centré dans l'espace restant entre présentation et avant / après */}
      {/* Mobile : remplacé par le lien sticky en bas de la modale (voir plus bas) */}
      <div className="flex-1 flex items-center justify-center py-6 lg:py-12">
        {projet.lien ? (
          <a href={projet.lien} target="_blank" rel="noopener noreferrer" className="group hidden lg:flex gap-2 text-base lg:text-lg min-[1700px]:text-xl font-bold tracking-widest uppercase">
            <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-100">[</span>
            <ScrambleText text="voir le site" revealed={open} delay={24} />
            <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-100">]</span>
          </a>
        ) : projet.enCours ? (
          // Pas de lien : le site n'est pas encore livré (visible aussi sur mobile, pas de version sticky)
          <p className="flex gap-2 text-sm lg:text-lg min-[1700px]:text-xl font-bold tracking-widest uppercase text-center">
            <span>[</span>
            <ScrambleText
              text={projet.enCours.miseEnLigne ? `mise en ligne prévue · ${projet.enCours.miseEnLigne}` : 'mise en ligne à venir'}
              revealed={open}
              delay={24}
            />
            <span>]</span>
          </p>
        ) : null}
      </div>
      </div>

      {projet.galerie?.length ? (
        <Galerie key={projet.titre} images={projet.galerie} defaut={projet.galerieDefaut} titre={projet.titre} open={open} />
      ) : null}

      {/* TODO : maquettes */}

      {/* Mobile : "voir le site" sticky en bas, visible pendant tout le scroll (galerie comprise).
          Placé en fin du conteneur interne → collé en bas jusqu'à ce qu'on atteigne sa place naturelle, à la fin. */}
      {projet.lien ? (
        // mix-blend-difference sur le wrapper, comme le bouton fermer → s'inverse selon le fond survolé
        <div className="lg:hidden sticky bottom-0 z-20 mt-10 flex justify-center pointer-events-none mix-blend-difference">
          <a
            href={projet.lien}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex gap-2 px-5 py-3 text-sm font-bold tracking-widest uppercase"
          >
            <span>[</span>
            <ScrambleText text="voir le site" revealed={open} delay={24} />
            <span>]</span>
          </a>
        </div>
      ) : null}
      </div>
    </div>
  )
}
