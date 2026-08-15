'use client'

import { useState, useEffect } from 'react'
import { useTextScramble } from '@/hooks/useTextScramble'

type Projet = {
  index: string
  titre: string
  type: string
  annee: string
  description: string
  stack: string[]
  lien?: string
}

const projets: Projet[] = [
  {
    index: '[ 1 ]',
    titre: 'Hoovie',
    type: 'Single Frontend Web App',
    annee: '2025',
    description: "Application de recherche de films. Projet pour m'initier au framework React. J'ai utilisé l'API Tmdb pour récupérer les données nécessaires à l'affichage et ait implémenté un système de recherche avec filtre.",
    stack: ['React', 'TypeScript', 'TailwindCSS'],
    lien: 'https://hoovie.vercel.app/',
  },
  {
    index: '[ 2 ]',
    titre: 'Boplicity',
    type: 'Site WordPress',
    annee: '2026',
    description: "Site vitrine pour un festival de jazz que j'ai réalisé dans le cadre de mon activité en tant que freelance. Ce projet m'a appris l'importance de la définition des besoins avec son client et qu'un site doit être, avant toute chose, pratique.",
    stack: ['WordPress'],
    lien: 'https://boplicityjazzfestival.fr/',
  },
  {
    index: '[ 3 ]',
    titre: 'Bleu Minuit',
    type: 'Site vitrine Webflow',
    annee: '2026',
    description: "Ce site a été réalisé dans le cadre de mon alternance dans une startup en hôtellerie. Je ne suis pas parti de rien car il existait un ancien site mais j'ai réadapté la charte graphique et produit l'ensemble des maquettes (desktop, tablette, mobile). Puis, j'ai réalisé l'implémentation sur Webflow.",
    stack: ['Figma', 'Webflow'],
    lien: 'https://bleu-minuit.webflow.io/',
  },
]

function ProjectCard({ projet }: { projet: Projet }) {
  const [flipped, setFlipped] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const rectoRevealed = mounted && !flipped
  const versoRevealed = mounted && flipped

  const indexDisplay = useTextScramble(projet.index,           rectoRevealed)
  const titreDisplay = useTextScramble(projet.titre,           rectoRevealed, 4)
  const typeDisplay  = useTextScramble(projet.type,            rectoRevealed, 10)
  const anneeDisplay = useTextScramble(projet.annee,           rectoRevealed, 14)
  const descDisplay  = useTextScramble(projet.description,     versoRevealed)
  const stackDisplay = useTextScramble(projet.stack.join(' . '), versoRevealed, 20)

  return (
    <div
      className="relative w-full min-h-[240px] lg:h-[50vh] border border-current/30"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      {/* Recto */}
      <div className={'absolute inset-0 flex flex-col justify-between items-center p-6 ' + (flipped ? 'pointer-events-none' : '')}>
        <span>{indexDisplay}</span>
        <h2 className="font-title text-2xl md:text-3xl lg:text-4xl">{titreDisplay}</h2>
        <ul className="flex flex-col gap-1 text-xs lg:text-sm min-[1700px]:text-base self-start">
          <li className="flex gap-2"><span className={`transition-opacity duration-150 ${flipped ? 'opacity-0' : ''}`}>Type —</span><span>{typeDisplay}</span></li>
          <li className="flex gap-2"><span className={`transition-opacity duration-150 ${flipped ? 'opacity-0' : ''}`}>Année —</span><span>{anneeDisplay}</span></li>
        </ul>
      </div>

      {/* Verso */}
      <div className={'absolute inset-0 flex flex-col justify-between items-center p-[5%] ' + (!flipped ? 'pointer-events-none' : '')}>
        <p className="text-xs lg:text-sm min-[1700px]:text-base">{descDisplay}</p>
        <p className="text-[10px] lg:text-xs min-[1700px]:text-sm">{stackDisplay}</p>
        {projet.lien ? (
          <a href={projet.lien} target="_blank" rel="noopener noreferrer" className={`text-lg hover:text-xl transition-all duration-150 cursor-pointer ${!flipped ? 'opacity-0' : ''}`}>voir projet -&gt;</a>
        ) : null}
      </div>
    </div>
  )
}

export default function ProjetsPage() {
  return (
    <main className="relative flex flex-col lg:flex-row items-center justify-center min-h-screen gap-6 lg:gap-0">
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-3/4 md:w-2/3 lg:w-1/2 h-full bg-contain bg-no-repeat bg-center opacity-40"
        style={{ backgroundImage: "url('/images/lain.webp')" }}
      />

      <h1 className="lg:absolute lg:left-4 lg:top-1/2 lg:-translate-y-1/2 lg:-rotate-90 lg:whitespace-nowrap font-title tracking-widest uppercase text-7xl md:text-8xl lg:text-9xl">
        Projets
      </h1>

      <div className="grid grid-cols-1 gap-4 w-[90vw] lg:grid-cols-3 lg:w-[60vw]">
        {projets.map((projet) => (
          <ProjectCard key={projet.index} projet={projet} />
        ))}
      </div>
    </main>
  )
}