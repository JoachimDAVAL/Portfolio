'use client'

import { useEffect, useState } from 'react'

const liens = [
  { id: 'offres', label: 'Les offres' },
  { id: 'inclus', label: 'Toujours inclus' },
  { id: 'methode', label: 'Comment on travaille' },
  { id: 'propriete', label: 'Votre site vous appartient' },
  { id: 'apres', label: 'Après la mise en ligne' },
  { id: 'questions', label: 'Questions fréquentes' },
  { id: 'contact', label: 'On en parle' },
]

// Sommaire (ordinateur) : reste à l'écran pendant la lecture, section en cours entre crochets
export default function Sommaire() {
  const [courant, setCourant] = useState(-1)

  useEffect(() => {
    const sections = liens.map(({ id }) => document.getElementById(id))
    const maj = () => {
      const seuil = window.innerHeight * 0.4
      let c = -1
      sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= seuil) c = i })
      // Bas de page atteint : dernière section, même si elle est trop courte pour passer le seuil
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) c = sections.length - 1
      setCourant(c)
    }
    maj()
    window.addEventListener('scroll', maj, { passive: true })
    window.addEventListener('resize', maj)
    return () => {
      window.removeEventListener('scroll', maj)
      window.removeEventListener('resize', maj)
    }
  }, [])

  return (
    <aside className="hidden lg:block print:hidden">
      <nav aria-label="Sommaire" className="som sticky top-36 text-xs leading-relaxed">
        {liens.map(({ id, label }, i) => (
          <a key={id} href={`#${id}`} aria-current={i === courant ? 'true' : undefined}>{label}</a>
        ))}
      </nav>
    </aside>
  )
}
