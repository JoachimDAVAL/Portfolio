import type { Metadata } from 'next'
import Link from 'next/link'
import Scramble from '@/components/Scramble'
import ContactForm from './ContactForm'
import Email from './Email'

// Textes : vault, 01 PROJECTS/Portfolio/contenus/04-contact.md
export const metadata: Metadata = {
  title: 'Contact | Joachim Daval',
  description: 'Un projet de site ? Écrivez à Joachim Daval, développeur et designer freelance à Strasbourg. Réponse sous 2 jours ouvrés.',
}

const crochet = 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150'

const liens = [
  { nom: 'linkedin', href: 'https://www.linkedin.com/in/joachim-daval/', delay: 18 },
  { nom: 'github', href: 'https://github.com/JoachimDAVAL', delay: 22 },
]

export default function ContactPage() {
  return (
    <main className="flex items-center justify-center min-h-screen pt-24 pb-16 text-pretty lg:py-16">

      <video aria-hidden="true" className="fixed inset-0 w-full h-full object-cover -z-10 opacity-30" autoPlay muted loop playsInline>
        <source src="https://res.cloudinary.com/ln8fnpns/video/upload/v1789733407/contact.webm" type="video/webm" />
        <source src="https://res.cloudinary.com/ln8fnpns/video/upload/v1789733407/contact.mp4" type="video/mp4" />
      </video>

      <div className="flex flex-col items-center gap-8 lg:gap-12 w-[90%] lg:w-[70vw] max-w-6xl">
        <h1 className="font-title uppercase tracking-widest text-5xl min-[375px]:text-6xl md:text-8xl lg:text-9xl text-center"><Scramble text="Contact" /></h1>

        {/* Ordre du HTML = ordre du téléphone. Ordinateur : formulaire à droite sur les trois lignes ; à gauche accroche, bouton au milieu de l'espace libre, « Me retrouver » */}
        <div className="grid grid-cols-1 w-full gap-x-16 gap-y-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr_auto]">

          <section aria-label="Présentation" className="flex flex-col gap-6 lg:contents">
            <div className="flex flex-col gap-6 lg:gap-8 lg:col-start-1 lg:row-start-1">
              <p className="font-title uppercase text-3xl min-[375px]:text-4xl md:text-5xl xl:text-6xl">
                <span className="block"><Scramble text="Travaillons" delay={2} /></span>{' '}
                <span className="block"><Scramble text="Ensemble." delay={8} /></span>
              </p>
              <p className="text-sm min-[1700px]:text-base max-w-sm"><Scramble step={3} text="Parlez-moi de votre projet, même en quelques lignes. Je vous réponds sous 2&nbsp;jours ouvrés." /></p>
            </div>
            <Link
              href="/methode"
              className="group self-center justify-self-center lg:col-start-1 lg:row-start-2 flex gap-2 border border-current/60 hover:border-current focus-visible:border-current transition-colors px-3 py-3 tracking-widest uppercase text-sm min-[1700px]:text-base"
            >
              <span aria-hidden="true" className={crochet}>[</span>
              <span><Scramble text="méthode et tarifs" delay={10} /></span>
              <span aria-hidden="true" className={crochet}>]</span>
            </Link>
          </section>

          <div className="lg:col-start-2 lg:row-start-1 lg:row-span-3">
            <ContactForm />
          </div>

          {/* Secondaire. Ordinateur : à droite de la colonne, calé sur le bas du formulaire */}
          <section aria-labelledby="t-retrouver" className="flex flex-col gap-3 justify-self-center lg:col-start-1 lg:row-start-3 lg:self-end lg:justify-self-end lg:mr-[10%]">
            <h2 id="t-retrouver" className="text-sm min-[1700px]:text-base tracking-widest uppercase opacity-70"><Scramble text="Me retrouver" delay={12} /></h2>
            <ul className="self-start flex flex-col gap-1 text-base min-[1700px]:text-lg">
              <li className="flex items-center gap-2"><Email /></li>
              {liens.map(({ nom, href, delay }) => (
                <li key={nom}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="group flex gap-2 -ml-[1.125rem] py-1 w-fit">
                    <span aria-hidden="true" className={crochet}>[</span>
                    <span><Scramble text={nom} delay={delay} /></span>
                    <span aria-hidden="true" className={crochet}>]</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

        </div>
      </div>

    </main>
  )
}
