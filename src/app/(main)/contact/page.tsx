'use client'

import { useState, useEffect } from 'react'
import { useTextScramble } from '@/hooks/useTextScramble'

export default function ContactPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const titleDisplay = useTextScramble('Contact', mounted)
  const line1Display = useTextScramble('Travaillons', mounted, 2)
  const line2Display = useTextScramble('Ensemble.', mounted, 8)
  const availDisplay = useTextScramble('Disponible pour des missions freelance et opportunités post-alternance (Octobre 2026)', mounted, 0, 3)
  const emailDisplay   = useTextScramble('e-mail',             mounted, 5)
  const githubDisplay  = useTextScramble('github',             mounted, 10)
  const linkedinDisplay = useTextScramble('linkedin',          mounted, 15)
  const cvDisplay      = useTextScramble('télécharger CV',     mounted, 20)

  return (
    <main className="flex items-center justify-center min-h-screen">

      <video className="fixed inset-0 w-full h-full object-cover -z-10" autoPlay muted loop playsInline>
        <source src="/videos/contact.webm" type="video/webm" />
        <source src="/videos/contact.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-black/50 -z-10" />

      <section className="flex flex-col items-center gap-12 w-[90%] md:w-[40%] max-w-2xl">
        <h1 className="font-title uppercase tracking-widest text-7xl md:text-8xl lg:text-9xl text-center">{titleDisplay}</h1>

        <div className="flex flex-wrap w-full gap-y-10">

          <div className="flex items-start justify-start flex-1 min-w-[280px]">
            <div className="flex flex-col gap-10">
              <p className="font-title uppercase text-5xl lg:text-6xl">
                {line1Display} <br /> {line2Display}
              </p>
              <p className="text-sm min-[1700px]:text-base">{availDisplay}</p>
            </div>
          </div>

          <div className="flex items-start justify-start flex-1 min-w-[280px]">
            <ul className="flex flex-col h-full justify-between gap-6 text-sm min-[1700px]:text-base">
              <li className="group flex justify-between border-b border-current/30 pb-2"><a href="mailto:joachim.daval01@gmail.com" className="flex justify-between w-full"><span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">[</span>{emailDisplay}<span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-auto">]</span></a></li>
              <li className="group flex justify-between border-b border-current/30 pb-2"><a href="https://github.com/JoachimDAVAL" target="_blank" rel="noopener noreferrer" className="flex justify-between w-full"><span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">[</span>{githubDisplay}<span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-auto">]</span></a></li>
              <li className="group flex justify-between border-b border-current/30 pb-2"><a href="https://www.linkedin.com/in/joachim-daval/" target="_blank" rel="noopener noreferrer" className="flex justify-between w-full"><span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">[</span>{linkedinDisplay}<span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-auto">]</span></a></li>
              <li className="group flex justify-between border-b border-current/30 pb-2"><a href="/DAVALjoachim_CV.pdf" download className="flex justify-between w-full"><span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">[</span>{cvDisplay}<span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-auto">]</span></a></li>
            </ul>
          </div>

        </div>
      </section>

    </main>
  )
}