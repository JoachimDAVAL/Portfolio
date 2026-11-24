'use client'

import Image from 'next/image'
import { premierePhrase, type Projet } from '@/lib/projets'
import { useOuvrirFiche } from './fiche'
import Texte from './Texte'

// Carte cliquable, même survol que sur /projets (flou + « voir le projet »)
export default function CarteProjet({ projet, rang }: { projet: Projet; rang: number }) {
  const ouvrir = useOuvrirFiche()
  return (
    <button type="button" aria-haspopup="dialog" onClick={() => ouvrir(projet)} className="group flex flex-col gap-3 w-full text-left cursor-pointer outline-none">
      <span className="fade relative block w-full aspect-video shrink-0 overflow-hidden">
        <Image src={projet.image} alt="" fill sizes="(min-width: 64rem) 25vw, 90vw" className="object-cover object-top transition-[filter] duration-500 group-hover:blur-sm group-focus-visible:blur-sm motion-reduce:transition-none" />
        {projet.enCours ? (
          <span className="absolute inset-0 flex items-center justify-center text-xs tracking-widest uppercase transition-opacity duration-500 group-hover:opacity-0 group-focus-visible:opacity-0">[ en cours ]</span>
        ) : null}
        <span className="absolute inset-0 flex items-center justify-center bg-[#141414]/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 text-sm tracking-widest uppercase">voir le projet</span>
      </span>
      <span className="flex items-baseline justify-between gap-2 w-full">
        <span className="font-title uppercase tracking-widest text-2xl"><Texte delay={4 + rang * 2}>{projet.titre}</Texte></span>{' '}
        <span className="text-xs opacity-60"><Texte delay={6 + rang * 2}>{projet.annee}</Texte></span>
      </span>
      <span className="block text-xs leading-relaxed"><Texte step={3} delay={8 + rang * 2}>{premierePhrase(projet)}</Texte></span>
    </button>
  )
}
