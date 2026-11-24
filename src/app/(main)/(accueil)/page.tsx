import type { Metadata } from 'next'
import Image from 'next/image'
import { AVIS, FICHE_GOOGLE, NOTE } from '@/lib/avis'
import { projets } from '@/lib/projets'
import { sansAccents } from '@/lib/text'
import CarteProjet from './CarteProjet'
import Diaporama from './Diaporama'
import Lien from './Lien'
import PourQui from './PourQui'
import SliderAvis from './SliderAvis'
import SliderProjets from './SliderProjets'
import Texte from './Texte'
import './accueil.css'

// Accueil en diapositives. Textes : vault, 01 PROJECTS/Portfolio/contenus/accueil-diapo/ (un fichier par diapo)
export const metadata: Metadata = {
  title: 'Joachim Daval | Développeur freelance, sites sur mesure',
  description: 'Des sites sur mesure pour les artistes et les entreprises, de la startup à la grande structure. À distance, partout en France.',
}

// Les 3 projets de l'accueil, dans cet ordre (texte : première phrase de leur description)
const selection = ['Chalet Nature', 'Bleu Minuit', 'Boplicity'].flatMap((titre) => projets.filter((p) => p.titre === titre))

const avecAvis = AVIS.length > 0

const slide = 'slide lg:absolute lg:inset-0 outline-none'
const h2 = 'font-title uppercase tracking-widest leading-none'

export default function AccueilPage() {
  return (
    <Diaporama total={avecAvis ? 6 : 5}>

      <section id="hero" data-slide="" tabIndex={-1} aria-label="Accueil" className={`${slide} flex flex-col justify-center items-center text-center gap-8`}>
        <h1 className="font-title uppercase tracking-widest text-6xl md:text-7xl lg:text-8xl leading-none flex flex-col items-center">
          <Texte>Joachim</Texte>{' '}
          <Texte delay={4}>DAVAL</Texte>
        </h1>
        <p className="font-title uppercase text-5xl md:text-6xl lg:text-7xl">
          <Texte delay={8} lu="Développeur freelance">{sansAccents('Développeur freelance')}</Texte>
        </p>
        <p className="max-w-xl leading-relaxed">
          <Texte step={3} delay={10}>Des sites sur mesure pour les artistes et les entreprises, de la startup à la grande structure.</Texte>
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          <Lien href="/contact" delay={16}>on en parle&nbsp;?</Lien>
        </div>
      </section>

      <section id="bonjour" data-slide="" data-masquee="" tabIndex={-1} aria-label="Présentation" className={`${slide} grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 lg:gap-16 items-center`}>
        <div className="bonjour-photo fade relative lg:aspect-[4/5] w-full lg:h-[80%] lg:w-auto lg:justify-self-end overflow-hidden">
          <Image src="/images/joachim.webp" alt="Joachim Daval" fill sizes="(min-width: 64rem) 30vw, 90vw" className="object-cover grayscale contrast-110" />
        </div>
        {/* Titres proportionnels à la colonne (cqw) : une seule ligne sur petit écran d'ordinateur */}
        <div className="bonjour-texte flex flex-col gap-6 max-w-xl lg:[container-type:inline-size]">
          <h2 className={`${h2} text-4xl lg:text-[length:min(3rem,8.5cqw)]`}><Texte>Bonjour, je suis Joachim.</Texte></h2>
          <p className={`${h2} -mt-3 text-3xl lg:text-[length:min(2.25rem,6.4cqw)]`}><Texte delay={3}>Ravi de vous rencontrer.</Texte></p>
          <p className="leading-relaxed"><Texte step={3} delay={6}>{"Je dessine, je code et je vous accompagne dans la création d'une présence en ligne à votre image, que vous soyez artiste ou entreprise."}</Texte></p>
          <p className="leading-relaxed"><Texte step={3} delay={12}>{"Je soigne autant la lisibilité que l'esthétique, un équilibre que je recherche dans chacun de mes sites."}</Texte></p>
          <p className="leading-relaxed"><Texte step={3} delay={16}>Une fois en ligne, tout est à votre nom&nbsp;: le domaine, l&apos;hébergement, les accès. Vous restez libre, avec ou sans moi.</Texte></p>
          <p className="leading-relaxed opacity-60"><Texte delay={20}>À distance, partout en France.</Texte></p>
          <Lien href="/about" delay={22} className="self-start mt-4">plus sur moi</Lien>
        </div>
      </section>

      <section id="pour-qui" data-slide="" data-masquee="" tabIndex={-1} aria-label="Pour qui" className={`${slide} flex flex-col justify-center gap-6 md:gap-8 lg:gap-6 min-[1500px]:gap-10`}>
        <h2 className={`${h2} text-center text-5xl max-lg:[@media(max-height:700px)]:text-4xl lg:text-6xl`}><Texte>Pour qui</Texte></h2>
        <PourQui />
        {/* Détaché du tableau et plus grand que les autres liens : c'est la suite logique après les prix */}
        <div className="cta-offres flex justify-center">
          <Lien href="/methode" delay={28} className="text-base lg:text-lg">détail des offres</Lien>
        </div>
      </section>

      <section data-slide="" data-masquee="" tabIndex={-1} aria-label="Projets" className={`${slide} flex flex-col justify-center gap-10`}>
        <h2 className={`${h2} text-center text-5xl lg:text-6xl`}><Texte>Projets</Texte></h2>
        <SliderProjets total={selection.length}>
          {selection.map((p, i) => (
            <li key={p.titre} className="w-full shrink-0 snap-center"><CarteProjet projet={p} rang={i} /></li>
          ))}
        </SliderProjets>
        <Lien href="/projets" delay={16} className="self-center">tous les projets</Lien>
      </section>

      {avecAvis ? (
        <section id="avis" data-slide="" data-masquee="" tabIndex={-1} aria-label="Avis" className={`${slide} flex flex-col justify-center gap-8 min-[1500px]:gap-12`}>
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className={`${h2} text-5xl lg:text-6xl`}><Texte>Ils en parlent</Texte></h2>
            <a href={FICHE_GOOGLE} className="text-xs tracking-widest uppercase opacity-60 hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-150">
              <Texte delay={6}>{`${NOTE} · ${AVIS.length} avis Google`}</Texte>
            </a>
          </div>
          <SliderAvis avis={AVIS} />
          <Lien href={FICHE_GOOGLE} delay={24} className="self-center">tous les avis</Lien>
        </section>
      ) : null}

      <section data-slide="" data-masquee="" tabIndex={-1} aria-label="On en parle" className={`${slide} flex flex-col justify-center items-center text-center gap-8`}>
        <h2 className={`${h2} text-7xl md:text-8xl lg:text-9xl`}><Texte>On en parle</Texte></h2>
        <p className="max-w-xl text-base lg:text-lg leading-relaxed">
          <Texte step={3} delay={6}>Vous avez un projet, même encore flou&nbsp;? Écrivez-moi, on prend le temps d&apos;en discuter, par message ou en visio.</Texte>
        </p>
        <Lien href="/contact" delay={12} className="text-base lg:text-lg">écrire un message</Lien>
      </section>

    </Diaporama>
  )
}
