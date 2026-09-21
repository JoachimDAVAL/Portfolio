'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useTextScramble } from '@/hooks/useTextScramble'
import { useAudio } from '@/context/AudioContext'

const hrefs = ['/about', '/projets', '/contact']

function SoundOn() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}

function SoundOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  )
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const aboutDisplay   = useTextScramble('About',   mounted)
  const projetsDisplay = useTextScramble('Projets', mounted, 4)
  const contactDisplay = useTextScramble('Contact', mounted, 8)
  const displays = [aboutDisplay, projetsDisplay, contactDisplay]

  const pathname = usePathname()
  const activeIndex = hrefs.findIndex(href => href === pathname)

  const [hovered, setHovered] = useState<number | null>(null)
  const navRef  = useRef<HTMLElement>(null)
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [underline, setUnderline] = useState({ left: 0, width: 0 })

  const displayedIndex = hovered ?? activeIndex

  const { toggleMute, muted } = useAudio()

  useEffect(() => {
    const recalculate = () => {
      if (displayedIndex !== -1 && linkRefs.current[displayedIndex] && navRef.current) {
        const navRect = navRef.current.getBoundingClientRect()
        const elRect  = linkRefs.current[displayedIndex]!.getBoundingClientRect()
        setUnderline({ left: elRect.left - navRect.left, width: elRect.width })
      }
    }

    recalculate()

    const observer = new ResizeObserver(recalculate)
    linkRefs.current.forEach(link => { if (link) observer.observe(link) })

    return () => observer.disconnect()
  }, [displayedIndex])

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
            width: displayedIndex !== -1 ? underline.width : 0,
            opacity: displayedIndex !== -1 ? 1 : 0,
          }}
        />
      </nav>
      <button
        onClick={toggleMute}
        aria-label={muted ? 'Activer le son' : 'Couper le son'}
        className="fixed top-4 right-6 z-50 lg:top-5 lg:right-20 cursor-pointer bg-transparent border-none text-current opacity-60 hover:opacity-100 transition-opacity duration-200"
      >
        {muted ? <SoundOff /> : <SoundOn />}
      </button>
      {children}
    </>
  )
}