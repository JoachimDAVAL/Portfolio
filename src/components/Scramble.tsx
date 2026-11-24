'use client'

import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { FRAME_MS, randomChar } from '@/hooks/useTextScramble'
import { useIntroReady } from '@/components/Preloader'

// Texte brouillé à l'arrivée, sans décalage de mise en page et présent en entier dans le HTML du serveur
// (useTextScramble part d'un texte vide : rien à lire pour un moteur de recherche, et les lignes bougent).
// Pendant l'animation : copie cachée = réserve la place · calque = texte animé · texte lu = version complète.
// Une fois fini : texte simple.
type Props = {
  text: string
  delay?: number // en images de 60 Hz
  step?: number // caractères par image (2 ou 3 pour un paragraphe)
  onView?: boolean // attend d'être visible à l'écran (pages qui défilent)
}

export default function Scramble({ text, delay = 0, step = 1, onView = false }: Props) {
  const ready = useIntroReady()
  const rootRef = useRef<HTMLSpanElement>(null)
  const calqueRef = useRef<HTMLSpanElement>(null)
  const [fini, setFini] = useState(false)

  // Impression : texte simple, pour un ordre de lecture et un copier-coller corrects
  useEffect(() => {
    const onPrint = () => flushSync(() => setFini(true))
    window.addEventListener('beforeprint', onPrint)
    return () => window.removeEventListener('beforeprint', onPrint)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!ready || fini || !root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFini(true)
      return
    }

    let raf = 0
    const start = () => {
      const queue = Array.from(text, (to, i) => {
        const s = delay + Math.floor(i / step)
        return { to, start: s, end: s + Math.floor(Math.random() * 8) + 6, char: '' }
      })
      let t0 = -1
      let frame = -1
      const tick = (now: number) => {
        if (t0 < 0) t0 = now
        const f = Math.floor((now - t0) / FRAME_MS)
        if (f !== frame) {
          frame = f
          let output = ''
          let complete = 0
          for (const item of queue) {
            if (frame >= item.end) {
              complete++
              output += item.to
            } else if (frame >= item.start) {
              if (!item.char || Math.random() < 0.28) item.char = randomChar()
              // Les espaces restent : les mots se coupent au même endroit qu'une fois le texte posé
              output += item.to === ' ' ? ' ' : item.char
            }
          }
          if (calqueRef.current) calqueRef.current.textContent = output
          if (complete === queue.length) {
            setFini(true)
            return
          }
        }
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }

    if (!onView) {
      start()
      return () => cancelAnimationFrame(raf)
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      observer.disconnect()
      start()
    }, { threshold: 0.4 })
    observer.observe(root)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [ready, fini, text, delay, step, onView])

  if (fini) return <>{text}</>

  return (
    <span ref={rootRef} className="relative block">
      <span aria-hidden="true" className="scramble-place">{text}</span>
      <span ref={calqueRef} data-calque="" aria-hidden="true" className="calque-anime absolute inset-0" />
      <span className="sr-only">{text}</span>
    </span>
  )
}
