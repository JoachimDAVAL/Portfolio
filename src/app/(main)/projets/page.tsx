'use client'

import { useState, useEffect, useRef, useCallback, type CSSProperties, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useTextScramble } from '@/hooks/useTextScramble'

type Projet = {
  titre: string
  annee: string
  type: string
  interventions: string[]
  description: string[] // un élément = un paragraphe
  image: string
  lien?: string
  // Captures pleine page (desktop, même largeur) affichées avec la loupe : Avant / Après ou pages clés
  galerie?: { label: string; src: string }[]
  galerieDefaut?: number // index affiché dans la loupe au repos (0 par défaut)
}

// Source des textes : vault → 01 PROJECTS/Portfolio/contenus/projets/<projet>.md
const projets: Projet[] = [
  {
    titre: 'Ylyos',
    annee: '2026',
    type: 'Site vitrine',
    interventions: ['Web Design', 'Web Development', 'WordPress'],
    description: [
      "Ylyos est un cabinet de conseil en finance d'entreprise, spécialisé dans les marchés de capitaux. Son site existant tenait sur une seule page, avec des images manquantes et une navigation quasi absente. Le dirigeant avait besoin d'une vraie vitrine professionnelle.",
      "J'ai étudié les souhaits du client pour établir une charte graphique qui lui correspondait, puis construit les maquettes dans une démarche UX/UI et accessibilité avant de les intégrer sur WordPress pour que mon client garde une autonomie sur ses contenus.",
    ],
    image: '/images/projets/ylyos/card.webp',
    lien: 'https://ylyos.vercel.app/',
    galerie: [
      { label: 'Avant', src: '/images/projets/ylyos/avant.webp' },
      { label: 'Après', src: '/images/projets/ylyos/apres.webp' },
    ],
    galerieDefaut: 1,
  },
  {
    titre: 'Bleu Minuit',
    annee: '2025-2026',
    type: 'Site vitrine',
    interventions: ['Web Design', 'Webflow'],
    description: [
      "Ce site a été réalisé dans le cadre de mon alternance dans une startup en hôtellerie. Je ne suis pas parti de rien car il existait un ancien site, mais j'ai réadapté la charte graphique et produit l'ensemble des maquettes (desktop, tablette, mobile). Puis, j'ai réalisé l'implémentation sur Webflow.",
    ],
    image: '/images/projets/bleu-minuit/card.webp',
    lien: 'https://www.bleu-minuit.com/',
    galerie: [
      { label: 'Accueil', src: '/images/projets/bleu-minuit/accueil.webp' },
      { label: 'Domaine La Rive Étoilée', src: '/images/projets/bleu-minuit/lodge-la-rive-etoilee.webp' },
    ],
  },
  {
    titre: 'Boplicity',
    annee: '2026',
    type: 'Site vitrine',
    interventions: ['Web Design', 'Web Development', 'WordPress'],
    description: [
      "Site vitrine pour un festival de jazz que j'ai réalisé dans le cadre de mon activité en tant que freelance (c'était mon premier projet :o). Ce projet m'a appris l'importance de la définition des besoins avec son client et qu'un site doit être, avant toute chose, pratique.",
    ],
    image: '/images/projets/boplicity/card.webp',
    lien: 'https://boplicityjazzfestival.fr/',
    galerie: [
      { label: 'Accueil', src: '/images/projets/boplicity/accueil.webp' },
      { label: 'Programmation', src: '/images/projets/boplicity/programmation.webp' },
      { label: 'Artiste — Anne Paceo', src: '/images/projets/boplicity/artiste-anne-paceo.webp' },
    ],
  },
  {
    titre: 'Chalet Nature',
    annee: '2026',
    type: 'Site vitrine (refonte)',
    interventions: ['Web Design', 'Web Development', 'WordPress', 'Automation'],
    description: [
      'Chalet Nature loue un chalet dans les Hautes-Vosges, au bord du lac de Longemer. Son site était assez vieillissant et mal conçu.',
      "Pour ce projet j'ai repensé intégralement l'identité du site, conçu un parcours de réservation directe, puis développé un thème WordPress sur mesure.",
      "Mais je suis allé plus loin qu'un simple site vitrine : j'ai aussi construit toute la mécanique en coulisses. Une base de données centralise désormais les clients et l'historique des réservations, les devis et contrats sont générés et envoyés automatiquement, et le suivi client passe par un CRM. Le propriétaire gère son activité en autonomie, depuis son téléphone, pour quelques euros par mois.",
    ],
    image: '/images/projets/chalet-nature/card.webp',
    lien: 'https://chalet-nature-site.vercel.app/',
    galerie: [
      { label: 'Avant', src: '/images/projets/chalet-nature/avant.webp' },
      { label: 'Après', src: '/images/projets/chalet-nature/accueil.webp' },
      { label: 'Chalet', src: '/images/projets/chalet-nature/chalet.webp' },
      { label: 'Réservation', src: '/images/projets/chalet-nature/reservation.webp' },
    ],
    galerieDefaut: 1,
  },
  {
    titre: 'Hoovie',
    annee: '2025',
    type: 'Web App',
    interventions: ['Web Development'],
    description: [
      "Application de recherche de films. Projet pour m'initier au framework React. J'ai utilisé l'API TMDB pour récupérer les données nécessaires à l'affichage et implémenté un système de recherche avec filtres.",
    ],
    image: '/images/projets/hoovie/card.webp',
    lien: 'https://hoovie.vercel.app/',
    galerie: [
      { label: 'Accueil', src: '/images/projets/hoovie/accueil.webp' },
      { label: 'Fiche film', src: '/images/projets/hoovie/movie-detail.webp' },
    ],
  },
  {
    titre: 'BlablaBook',
    annee: '2025',
    type: 'Web App',
    interventions: ['Web Development Fullstack'],
    description: [
      "BlablaBook est mon premier projet web que j'ai réalisé en équipe chez O'Clock et avec lequel j'ai obtenu mon titre professionnel Développeur Web et Web Mobile.",
    ],
    image: '/images/projets/blablabook/card.webp',
    galerie: [
      { label: 'Accueil', src: '/images/projets/blablabook/accueil.webp' },
      { label: 'Recherche', src: '/images/projets/blablabook/recherche.webp' },
      { label: 'Tableau de bord', src: '/images/projets/blablabook/dashboard.webp' },
      { label: 'Tableau de bord — Avis', src: '/images/projets/blablabook/dashboard-avis.webp' },
      { label: 'Tableau de bord — Profil', src: '/images/projets/blablabook/dashboard-profil.webp' },
    ],
  },
  {
    titre: 'Abstract',
    annee: '2026',
    type: 'Marketplace 3D',
    interventions: ['Web Development Fullstack'],
    description: [
      "Abstract est une marketplace de modèles 3D, dans l'esprit de Sketchfab : les artistes y publient et vendent leurs créations, les acheteurs les manipulent en 3D avant de les télécharger, et un espace d'administration modère le contenu.",
      "C'est mon projet de fin de formation chez ESTIAM, celui avec lequel j'ai obtenu le titre professionnel Concepteur Développeur d'Applications (Bac+4).",
      "L'enjeu était avant tout la conception : j'ai modélisé la base de données et les parcours utilisateurs (MERISE, UML), développé une API NestJS entièrement testée, puis une application React avec visualiseur 3D, paiement Stripe et fichiers sources protégés. L'interface reste celle d'un projet d'étude : l'effort a porté sur la robustesse de l'ensemble, jusqu'à la mise en production.",
    ],
    image: '/images/projets/abstract/card.webp',
    lien: 'https://cda-marketplace-3d-models.vercel.app/',
    galerie: [
      { label: 'Accueil', src: '/images/projets/abstract/accueil.webp' },
      { label: 'Catalogue', src: '/images/projets/abstract/catalogue.webp' },
      { label: 'Visualiseur 3D', src: '/images/projets/abstract/visualiseur-3d.webp' },
    ],
  },
]

// Défilement amorti de la grid (desktop) : la molette déplace une cible, la position la rejoint en glissant (lerp).
// Indépendant de la fréquence d'écran (60 / 120 / 144 Hz). Désactivé si "réduire les animations".
const SMOOTH_EASE = 0.045 // part de la distance restante parcourue par frame à 60 fps — plus petit = plus lent
function useSmoothScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const desktop = window.matchMedia('(min-width: 1024px)')

    let target = el.scrollTop
    let current = el.scrollTop
    let frame = 0
    let last = 0

    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 50) : 16.67
      last = now
      const k = 1 - Math.pow(1 - SMOOTH_EASE, dt / 16.67)
      current += (target - current) * k
      if (Math.abs(target - current) < 0.5) current = target
      el.scrollTop = current
      if (current !== target) {
        frame = requestAnimationFrame(tick)
      } else {
        frame = 0
        last = 0
      }
    }

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || !desktop.matches) return // zoom navigateur / mobile : comportement natif
      e.preventDefault()
      // Au repos, on repart de la position réelle (clavier, glisser…)
      if (!frame) target = current = el.scrollTop
      const delta = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * el.clientHeight : e.deltaY
      target = Math.max(0, Math.min(target + delta, el.scrollHeight - el.clientHeight))
      if (!frame) frame = requestAnimationFrame(tick)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      cancelAnimationFrame(frame)
    }
  }, [ref])
}

// Tri des cards : plus récent en haut. Pour une période ("2025-2026"), on prend l'année de fin.
// À année égale, l'ordre du tableau ci-dessus est conservé (sort stable).
const anneeFin = (annee: string) => Math.max(...(annee.match(/\d{4}/g) ?? ['0']).map(Number))
const projetsTries = [...projets].sort((a, b) => anneeFin(b.annee) - anneeFin(a.annee))

function ProjectCard({ projet, onOpen }: { projet: Projet; onOpen: (p: Projet) => void }) {
  const ref = useRef<HTMLButtonElement>(null)

  // Effet écran cathodique à l'arrivée sur la page (cards visibles au chargement uniquement).
  // Durée calée sur le scramble : le texte le plus long finit vers (longueur + ~14) frames.
  const [crt, setCrt] = useState(false)
  const arrivedRef = useRef(false)
  const crtMs = Math.round(((Math.max(projet.titre.length, 6 + projet.annee.length) + 14) * 1000) / 60)

  useEffect(() => {
    if (!crt) return
    const t = setTimeout(() => setCrt(false), crtMs + 50)
    return () => clearTimeout(t)
  }, [crt, crtMs])
  // inView : pilote le scramble (part de false → scramble à l'arrivée)
  // offscreen : pilote l'effet "la card vient à toi". Part de false → à l'arrivée sur la page,
  // les cards déjà visibles sont affichées direct (pas de fondu) ; seules celles hors champ
  // passent en état caché et feront l'animation quand on scrollera jusqu'à elles.
  const [inView, setInView] = useState(false)
  const [offscreen, setOffscreen] = useState(false)

  // La card "vient à toi" quand elle entre dans la zone visible de la grid
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!arrivedRef.current) {
          arrivedRef.current = true
          const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          if (entry.isIntersecting && !reduce) setCrt(true)
        }
        // Apparition unique : une fois révélée, la card reste en place (pas de re-fondu au scroll retour)
        if (entry.isIntersecting) {
          setInView(true)
          setOffscreen(false)
          observer.disconnect()
        } else {
          setOffscreen(true)
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const titreDisplay = useTextScramble(projet.titre, inView)
  const anneeDisplay = useTextScramble(projet.annee, inView, 6)

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onOpen(projet)}
      aria-haspopup="dialog"
      style={{ '--crt-dur': `${crtMs}ms` } as CSSProperties}
      className={
        'group flex flex-col w-full lg:h-full text-left cursor-pointer outline-none ' +
        'transition-[opacity,transform] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ' +
        (!offscreen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 motion-reduce:opacity-100 motion-reduce:translate-y-0')
      }
    >
      {/* Image : format 16:9 fixe (= format des captures) → jamais coupée — blur + "voir le projet" au hover */}
      <span className="relative block aspect-video w-full shrink-0 overflow-hidden">
        <span
          aria-hidden="true"
          className={`absolute inset-0 bg-cover bg-top bg-no-repeat transition-[filter] duration-500 group-hover:blur-sm group-focus-visible:blur-sm motion-reduce:transition-none${crt ? ' crt-base' : ''}`}
          style={{ backgroundImage: `url('${projet.image}')` }}
        />
        {crt ? (
          <>
            {/* Bandes déchirées décalées (aberration rouge / cyan) */}
            <span aria-hidden="true" className="crt crt-slices crt-slices--r bg-cover bg-top bg-no-repeat" style={{ backgroundImage: `url('${projet.image}')` }} />
            <span aria-hidden="true" className="crt crt-slices crt-slices--c bg-cover bg-top bg-no-repeat" style={{ backgroundImage: `url('${projet.image}')` }} />
            {/* Lignes de balayage + bruit */}
            <span aria-hidden="true" className="crt crt-scan" />
            {/* Éclairs : bandes lumineuses qui traversent l'écran */}
            <span aria-hidden="true" className="crt crt-bolt" />
            <span aria-hidden="true" className="crt crt-bolt crt-bolt--2" />
          </>
        ) : null}
        <span className="absolute inset-0 flex items-center justify-center bg-[#141414]/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 text-sm lg:text-base tracking-widest uppercase">
          voir le projet
        </span>
      </span>

      {/* Nom + année : hauteur fixe 2.5rem (--row-h en tient compte) */}
      <span className="h-10 shrink-0 flex items-center justify-between text-xs lg:text-sm min-[1700px]:text-base">
        <span className="font-title tracking-widest uppercase text-lg md:text-xl lg:text-2xl">{titreDisplay}</span>
        <span>{anneeDisplay}</span>
      </span>
    </button>
  )
}

type GalerieImage = { label: string; src: string }

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
        {images.map(({ label, src }, index) => (
          <figure key={src} className="flex flex-col gap-3">
            <figcaption className="h-6 leading-6 text-xs lg:text-sm min-[1700px]:text-base tracking-widest uppercase">{label}</figcaption>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- même fichier que la loupe : un seul téléchargement */}
              <img
                ref={(el) => { thumbRefs.current[index] = el }}
                src={src}
                alt={`${titre} — ${label}, page complète`}
                loading="lazy"
                className="block w-full h-auto"
              />
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

function ProjetModal({ projet, open, onClose }: { projet: Projet; open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    dialogRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
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
        <Image
          src={projet.image}
          alt={`Page d'accueil du projet ${projet.titre}`}
          width={2880}
          height={1620}
          sizes="(min-width: 1024px) 30vw, 90vw"
          className="w-full h-auto"
        />
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

export default function ProjetsPage() {
  const [selected, setSelected] = useState<Projet | null>(null)
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLElement | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  useSmoothScroll(gridRef)

  const openProjet = (p: Projet) => {
    triggerRef.current = document.activeElement as HTMLElement
    setSelected(p)
    // double rAF : laisse le DOM monter la modale avant de lancer la transition d'entrée
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)))
  }

  const closeProjet = useCallback(() => {
    setOpen(false)
    setTimeout(() => {
      setSelected(null)
      triggerRef.current?.focus()
    }, 300)
  }, [])

  return (
    <main className="relative flex flex-col lg:flex-row items-center justify-center min-h-screen lg:h-screen lg:overflow-hidden gap-6 lg:gap-0 pb-8 lg:pb-0">
      <div
        className="fixed right-0 top-1/2 -translate-y-1/2 w-3/4 md:w-2/3 lg:w-1/2 h-full bg-contain bg-no-repeat bg-center opacity-40"
        style={{ backgroundImage: "url('https://res.cloudinary.com/ln8fnpns/image/upload/f_auto,q_auto,w_1200/v1789733264/lain.webp')" }}
      />

      {/* Desktop : texte vertical via writing-mode (et non rotate seul) → la boîte du h1 est réellement étroite
          et collée au bord gauche, au lieu d'une boîte horizontale tournée autour de son centre. rotate-180 = lecture de bas en haut. */}
      <h1 className="mt-16 lg:mt-0 lg:absolute lg:left-4 lg:top-1/2 lg:-translate-y-1/2 lg:[writing-mode:vertical-rl] lg:rotate-180 lg:whitespace-nowrap font-title tracking-widest uppercase text-7xl md:text-8xl lg:text-9xl">
        Projets
      </h1>

      {/* Zone de la grid : sert aussi de cadre à la modale (même dimension) */}
      <div className="projets-frame relative w-[90vw] lg:w-[var(--grid-w)] lg:h-[var(--grid-h)]">
        {/* Desktop : la page ne scrolle pas, c'est la grid qui scrolle (2 lignes visibles, défilement amorti) */}
        <div
          ref={gridRef}
          className={
            'grid grid-cols-1 gap-4 w-full ' +
            'lg:grid-cols-2 lg:h-full lg:auto-rows-[var(--row-h)] ' +
            'lg:overflow-y-auto lg:overscroll-contain ' +
            '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden ' +
            // La grid s'efface quand la modale est ouverte
            'transition-opacity duration-300 motion-reduce:transition-none ' +
            (open ? 'opacity-0' : 'opacity-100')
          }
          inert={open || undefined}
        >
          {projetsTries.map((projet) => (
            <ProjectCard key={projet.titre} projet={projet} onOpen={openProjet} />
          ))}
        </div>

        {selected ? <ProjetModal projet={selected} open={open} onClose={closeProjet} /> : null}
      </div>
    </main>
  )
}