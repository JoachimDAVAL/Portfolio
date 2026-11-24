'use client'

import { useEffect, useRef } from 'react'

// Fond décoratif (ordinateur, dès 1024 px) : l'œil du favicon en ASCII, complet et fixe.
// Le dessin (~17 Ko) n'est chargé que s'il est affiché.
export default function FondAscii() {
  const preRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    const large = window.matchMedia('(min-width: 1024px)')
    let lignes: readonly string[] = []
    let annule = false

    // La grille occupe toute la hauteur du cadre, puis on l'étire en largeur pour retrouver ses proportions
    const fit = () => {
      const pre = preRef.current
      if (!pre || !lignes.length || !large.matches) return
      const box = pre.parentElement!.getBoundingClientRect()
      pre.style.fontSize = box.height / lignes.length + 'px'
      pre.style.transform = 'none'
      pre.style.transform = 'translateX(-50%) scaleX(' + box.width / pre.getBoundingClientRect().width + ')'
    }
    const charger = () => {
      if (!large.matches || lignes.length) return fit()
      Promise.all([import('@/lib/logoAscii'), document.fonts.ready]).then(([m]) => {
        if (annule || !preRef.current) return
        lignes = m.LOGO_ASCII
        preRef.current.textContent = lignes.join(String.fromCharCode(10))
        fit()
      }, () => {}) // décoratif : sans le dessin, la page reste complète
    }

    charger()
    large.addEventListener('change', charger)
    window.addEventListener('resize', fit)
    return () => {
      annule = true
      large.removeEventListener('change', charger)
      window.removeEventListener('resize', fit)
    }
  }, [])

  return (
    <div aria-hidden="true" className="hidden lg:flex print:hidden fixed inset-0 z-0 items-center justify-center pointer-events-none overflow-hidden">
      <div className="relative shrink-0 w-screen h-[50vw] opacity-[0.04]">
        <pre ref={preRef} className="absolute left-1/2 top-0 m-0 origin-top leading-none whitespace-pre" />
      </div>
    </div>
  )
}
