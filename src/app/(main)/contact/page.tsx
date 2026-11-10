'use client'

import { useState, useEffect } from 'react'
import { useTextScramble } from '@/hooks/useTextScramble'
import ContactForm from './ContactForm'

const EMAIL = 'joachim.daval@proton.me'

// Crochets au survol de la ligne (le group est sur le <li>, comme avant)
const crochet = 'opacity-0 group-hover:opacity-100 transition-opacity duration-150'

export default function ContactPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [copie, setCopie] = useState(false)
  const copierEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopie(true)
      setTimeout(() => setCopie(false), 2000)
    } catch {
      // presse-papiers indisponible (contexte non sécurisé…) : l'adresse reste sélectionnable
    }
  }

  const titleDisplay = useTextScramble('Contact', mounted)
  const line1Display = useTextScramble('Travaillons', mounted, 2)
  const line2Display = useTextScramble('Ensemble.', mounted, 8)
  const availDisplay = useTextScramble('Disponible pour des missions freelance et opportunités post-alternance (Octobre 2026)', mounted, 0, 3)
  const emailDisplay    = useTextScramble('e-mail',         mounted, 5)
  const githubDisplay   = useTextScramble('github',         mounted, 10)
  const linkedinDisplay = useTextScramble('linkedin',       mounted, 15)
  const cvDisplay       = useTextScramble('télécharger CV', mounted, 20)

  return (
    <main className="flex items-center justify-center min-h-screen pt-24 pb-16 lg:py-16">

      <video className="fixed inset-0 w-full h-full object-cover -z-10 opacity-30" autoPlay muted loop playsInline>
        <source src="https://res.cloudinary.com/ln8fnpns/video/upload/v1789733407/contact.webm" type="video/webm" />
        <source src="https://res.cloudinary.com/ln8fnpns/video/upload/v1789733407/contact.mp4" type="video/mp4" />
      </video>

      <section className="flex flex-col items-center gap-12 w-[90%] lg:w-[70vw] max-w-6xl">
        <h1 className="font-title uppercase tracking-widest text-7xl md:text-8xl lg:text-9xl text-center">{titleDisplay}</h1>

        {/* Gauche : accroche + liens directs — Droite : formulaire. Mobile : le formulaire passe dessous. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-16">

          {/* Colonne gauche : textes plafonnés à gauche, liens calés à droite (près du formulaire) */}
          <div className="flex flex-col gap-10 w-full">
            <p className="font-title uppercase text-5xl lg:text-6xl max-w-md">
              {line1Display} <br /> {line2Display}
            </p>
            <p className="text-sm min-[1700px]:text-base max-w-md">{availDisplay}</p>

            {/* Largeur du contenu (bordures courtes) ; desktop : centrée dans la colonne */}
            <ul className="self-start lg:self-center flex flex-col gap-4 text-sm min-[1700px]:text-base">
              {/* E-mail : lien mailto + bouton copier (pour qui n'a pas de messagerie configurée) */}
              <li className="group flex items-center justify-between gap-4 border-b border-current/30 pb-2">
                <a href={`mailto:${EMAIL}`} className="flex justify-between w-full">
                  <span className={crochet}>[</span>{emailDisplay}<span className={`${crochet} ml-auto`}>]</span>
                </a>
                <button
                  type="button"
                  onClick={copierEmail}
                  className="shrink-0 text-xs tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {copie ? 'copié' : 'copier'}
                </button>
                <span role="status" className="sr-only">{copie ? 'Adresse e-mail copiée' : ''}</span>
              </li>
              <li className="group flex justify-between border-b border-current/30 pb-2"><a href="https://github.com/JoachimDAVAL" target="_blank" rel="noopener noreferrer" className="flex justify-between w-full"><span className={crochet}>[</span>{githubDisplay}<span className={`${crochet} ml-auto`}>]</span></a></li>
              <li className="group flex justify-between border-b border-current/30 pb-2"><a href="https://www.linkedin.com/in/joachim-daval/" target="_blank" rel="noopener noreferrer" className="flex justify-between w-full"><span className={crochet}>[</span>{linkedinDisplay}<span className={`${crochet} ml-auto`}>]</span></a></li>
              <li className="group flex justify-between border-b border-current/30 pb-2"><a href="/DAVALjoachim_CV.pdf" download className="flex justify-between w-full"><span className={crochet}>[</span>{cvDisplay}<span className={`${crochet} ml-auto`}>]</span></a></li>
            </ul>
          </div>

          <ContactForm revealed={mounted} />

        </div>
      </section>

    </main>
  )
}
