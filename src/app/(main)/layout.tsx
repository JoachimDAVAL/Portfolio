'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useTextScramble } from '@/hooks/useTextScramble'
import Preloader, { IntroContext } from '@/components/Preloader'

const hrefs = ['/', '/projets', '/about', '/contact']
const noms  = ['Accueil', 'Projets', 'About', 'Contact']

// Téléphone, tablette : la navbar se cache quand on descend, revient quand on remonte
const HAUT = 40  // toujours visible sur les premiers pixels de la page
const SEUIL = 10 // px dans un même sens avant de réagir (tremblement du doigt)

export default function MainLayout({ children }: { children: React.ReactNode }) {
  // ready : l'entrée (Preloader) est finie ou n'a pas lieu → la navbar et les pages lancent leurs animations
  const [ready, setReady] = useState(false)

  const accueilDisplay = useTextScramble(noms[0], ready)
  const projetsDisplay = useTextScramble(noms[1], ready, 4)
  const aboutDisplay   = useTextScramble(noms[2], ready, 8)
  const contactDisplay = useTextScramble(noms[3], ready, 12)
  const displays = [accueilDisplay, projetsDisplay, aboutDisplay, contactDisplay]

  const pathname = usePathname()
  const activeIndex = hrefs.findIndex(href => href === pathname)

  const [hovered, setHovered] = useState<number | null>(null)
  const navRef  = useRef<HTMLElement>(null)
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [underline, setUnderline] = useState({ left: 0, top: 0, width: 0 })

  const displayedIndex = hovered ?? activeIndex

  const [cachee, setCachee] = useState(false)
  useEffect(() => {
    setCachee(false)
    // Position bornée : le rebond d'iOS en haut et en bas ne compte pas comme un changement de sens
    const position = (el: Element) => Math.min(Math.max(el.scrollTop, 0), Math.max(el.scrollHeight - el.clientHeight, 0))
    // Ce qui défile : la page, ou une fiche de projet ouverte (elle couvre l'écran). repere : où le sens a changé
    const page = document.documentElement
    const suivi = new WeakMap<Element, { avant: number; repere: number; sens: number }>()
    const depart = position(page)
    suivi.set(page, { avant: depart, repere: depart, sens: 0 })
    const onScroll = (e: Event) => {
      const el = e.target === document ? page : e.target
      if (!(el instanceof Element) || (el !== page && !el.matches('[role="dialog"]'))) return
      const p = suivi.get(el) ?? { avant: 0, repere: 0, sens: 0 }
      suivi.set(el, p)
      const y = position(el)
      const s = Math.sign(y - p.avant)
      if (s && s !== p.sens) { p.sens = s; p.repere = p.avant }
      p.avant = y
      if (y <= HAUT) setCachee(false)
      else if (Math.abs(y - p.repere) >= SEUIL) setCachee(p.sens > 0)
    }
    // Fiche ouverte ou fermée (ProjetModal) : on repart d'une navbar visible
    const montrer = () => setCachee(false)
    document.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('navbar:montrer', montrer)
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true })
      window.removeEventListener('navbar:montrer', montrer)
    }
  }, [pathname])

  // Téléphone, tablette : barre transparente, liens inversés selon le fond (mix-blend-difference, comme les boutons de
  // ProjetModal). Couleur relevée de 20 (le fond #141414) : après la différence, on retrouve exactement le crème du site.
  // La barre laisse passer les touches, seuls les liens les prennent.
  // Ordinateur : /methode défile, fond plein sur toute la largeur (liens au même endroit)
  const barre = pathname === '/methode'
    ? 'lg:bg-[#141414] lg:pt-[var(--nav-top)]'
    : 'lg:top-[var(--nav-top)] lg:inset-x-0 lg:mx-auto lg:w-fit lg:px-0 lg:py-0'

  useEffect(() => {
    const recalculate = () => {
      if (displayedIndex !== -1 && linkRefs.current[displayedIndex] && navRef.current) {
        const navRect = navRef.current.getBoundingClientRect()
        const elRect  = linkRefs.current[displayedIndex]!.getBoundingClientRect()
        // Calé sous le texte (et non en bas de la barre, qui a des marges sur mobile et sur /methode)
        setUnderline({ left: elRect.left - navRect.left, top: elRect.bottom - navRect.top - 1, width: elRect.width })
      }
    }

    recalculate()

    const observer = new ResizeObserver(recalculate)
    linkRefs.current.forEach(link => { if (link) observer.observe(link) })

    return () => observer.disconnect()
  }, [displayedIndex, pathname])

  return (
    <IntroContext.Provider value={ready}>
      <Preloader onDone={() => setReady(true)} />
      <nav ref={navRef} aria-label="Navigation principale" className={`fixed z-50 flex justify-center gap-5 top-0 left-0 w-full px-[var(--marge)] max-lg:mix-blend-difference max-lg:text-[rgb(246,226,222)] max-lg:pointer-events-none py-4 max-[374.98px]:gap-4 max-[374.98px]:text-sm print:hidden max-lg:transition-transform max-lg:duration-200 motion-reduce:transition-none max-lg:has-[:focus-visible]:translate-y-0 ${cachee ? 'max-lg:-translate-y-full' : ''} ${barre}`}>
        {hrefs.map((href, i) => (
          <Link
            key={href}
            href={href}
            ref={(el) => { linkRefs.current[i] = el }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className="relative pointer-events-auto"
          >
            {/* Copie transparente : réserve la place (la navbar centrée ne bouge pas pendant le brouillage) et reste lue */}
            <span className="opacity-0">{noms[i]}</span>
            <span aria-hidden="true" className="absolute inset-0">{displays[i]}</span>
          </Link>
        ))}
        <span
          className="absolute top-0 left-0 h-px bg-current pointer-events-none transition-[transform,width,opacity] duration-200"
          style={{
            top: underline.top,
            transform: `translateX(${underline.left}px)`,
            width: displayedIndex !== -1 ? underline.width : 0,
            opacity: displayedIndex !== -1 ? 1 : 0,
          }}
        />
      </nav>
      {children}
    </IntroContext.Provider>
  )
}