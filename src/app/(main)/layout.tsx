'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useTextScramble } from '@/hooks/useTextScramble'

const hrefs = ['/about', '/projets', '/contact']

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const aboutDisplay   = useTextScramble('About',   mounted)
  const projetsDisplay = useTextScramble('Projets', mounted, 4)
  const contactDisplay = useTextScramble('Contact', mounted, 8)
  const displays = [aboutDisplay, projetsDisplay, contactDisplay]

  const [hovered, setHovered] = useState<number | null>(null)
  const navRef  = useRef<HTMLElement>(null)
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [underline, setUnderline] = useState({ left: 0, width: 0 })

  useEffect(() => {
    if (hovered !== null && linkRefs.current[hovered] && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect()
      const elRect  = linkRefs.current[hovered]!.getBoundingClientRect()
      setUnderline({ left: elRect.left - navRect.left, width: elRect.width })
    }
  }, [hovered])

  return (
    <>
      <nav ref={navRef} className="fixed z-50 flex gap-5 top-0 left-0 w-full bg-[#141414] px-6 py-4 lg:top-5 lg:left-20 lg:bg-transparent lg:w-auto lg:px-0 lg:py-0">
        {hrefs.map((href, i) => (
          <Link
            key={href}
            href={href}
            ref={(el) => { linkRefs.current[i] = el }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {displays[i]}
          </Link>
        ))}
        <span
          className="absolute bottom-0 left-0 h-px bg-current pointer-events-none transition-all duration-200"
          style={{
            transform: `translateX(${underline.left}px)`,
            width: hovered !== null ? underline.width : 0,
            opacity: hovered !== null ? 1 : 0,
          }}
        />
      </nav>
      {children}
    </>
  )
}
