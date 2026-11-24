'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useTextScramble } from '@/hooks/useTextScramble'
import Preloader, { IntroContext } from '@/components/Preloader'

const hrefs = ['/', '/projets', '/about', '/contact']
const noms  = ['Accueil', 'Projets', 'About', 'Contact']

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

  // /methode défile : fond plein sur toute la largeur aussi sur ordinateur (liens au même endroit)
  const barre = pathname === '/methode'
    ? 'lg:pt-[var(--nav-top)]'
    : 'lg:top-[var(--nav-top)] lg:inset-x-0 lg:mx-auto lg:bg-transparent lg:w-fit lg:px-0 lg:py-0'

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
      <nav ref={navRef} aria-label="Navigation principale" className={`fixed z-50 flex justify-center gap-5 top-0 left-0 w-full bg-[#141414] px-[var(--marge)] py-4 max-[374.98px]:gap-4 max-[374.98px]:text-sm print:hidden ${barre}`}>
        {hrefs.map((href, i) => (
          <Link
            key={href}
            href={href}
            ref={(el) => { linkRefs.current[i] = el }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className="relative"
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