'use client'

import { useState } from 'react'
import Scramble from '@/components/Scramble'

const EMAIL = 'joachim.daval@proton.me'
const crochet = 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150'

// Lien mailto + bouton copier (pour qui n'a pas de messagerie configurée)
export default function Email() {
  const [copie, setCopie] = useState(false)

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopie(true)
      setTimeout(() => setCopie(false), 2000)
    } catch {
      // presse-papiers indisponible (contexte non sécurisé…) : le lien mailto reste utilisable
    }
  }

  return (
    <>
      <a href={`mailto:${EMAIL}`} className="group flex gap-2 -ml-[1.125rem] py-1">
        <span aria-hidden="true" className={crochet}>[</span>
        <span><Scramble text="e-mail" delay={14} /></span>
        <span aria-hidden="true" className={crochet}>]</span>
      </a>
      <button
        type="button"
        onClick={copier}
        aria-label="Copier l'adresse e-mail"
        className="text-sm tracking-widest uppercase opacity-70 hover:opacity-100 transition-opacity cursor-pointer py-1"
      >
        {copie ? 'copié' : 'copier'}
      </button>
      <span role="status" className="sr-only">{copie ? 'Adresse e-mail copiée' : ''}</span>
    </>
  )
}
