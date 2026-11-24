'use client'

import { useState, useEffect, useRef, useCallback, type CSSProperties, type RefObject } from 'react'
import { useTextScramble } from '@/hooks/useTextScramble'
import { useIntroReady } from '@/components/Preloader'
import ProjetModal from '@/components/ProjetModal'
import { projets, type Projet } from '@/lib/projets'

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

// Tri des cards : projets en cours d'abord, puis plus récent en haut. Pour une période ("2025-2026"), on prend l'année de fin.
// À égalité, l'ordre du tableau ci-dessus est conservé (sort stable).
const anneeFin = (annee: string) => Math.max(...(annee.match(/\d{4}/g) ?? ['0']).map(Number))
const projetsTries = [...projets].sort(
  (a, b) => Number(!!b.enCours) - Number(!!a.enCours) || anneeFin(b.annee) - anneeFin(a.annee)
)

function ProjectCard({ projet, onOpen }: { projet: Projet; onOpen: (p: Projet) => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  // Pas d'arrivée des cards (scramble, effet cathodique) tant que l'entrée du site est à l'écran
  const introReady = useIntroReady()

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
    if (!el || !introReady) return
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
  }, [introReady])

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
        {/* Projet en cours : mention au repos, laisse la place à "voir le projet" au hover */}
        {projet.enCours ? (
          <span className="absolute inset-0 flex items-center justify-center text-sm lg:text-base tracking-widest uppercase transition-opacity duration-500 group-hover:opacity-0 group-focus-visible:opacity-0">
            [ en cours ]
          </span>
        ) : null}
        <span className="absolute inset-0 flex items-center justify-center bg-[#141414]/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 text-sm lg:text-base tracking-widest uppercase">
          voir le projet
        </span>
      </span>

      {/* Nom + année : hauteur fixe 2.5rem (--row-h en tient compte) */}
      <span className="h-10 shrink-0 flex items-center justify-between text-xs lg:text-sm min-[1700px]:text-base">
        <span className={`font-title tracking-widest uppercase text-lg md:text-xl lg:text-2xl ${titreDisplay === projet.titre ? '' : 'calque-anime'}`}>{titreDisplay}</span>
        <span className="flex items-center gap-2">
          {anneeDisplay}
          {projet.enCours ? (
            <>
              <span aria-hidden="true" className="size-1.5 rounded-full bg-current animate-pulse motion-reduce:animate-none" />
              <span className="sr-only">projet en cours</span>
            </>
          ) : null}
        </span>
      </span>
    </button>
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