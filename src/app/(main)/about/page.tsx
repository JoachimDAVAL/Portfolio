import type { Metadata } from 'next'
import Scramble from '@/components/Scramble'

// Textes : vault, 01 PROJECTS/Portfolio/contenus/02-about.md
export const metadata: Metadata = {
  title: 'À propos | Joachim Daval',
  description: 'Joachim Daval, développeur et designer freelance à Strasbourg : son histoire, ce qui compte pour lui, son parcours.',
}

const parcours = [
  { date: '2026 · Titre professionnel', titre: "Concepteur développeur d'applications (CDA)" },
  { date: '2025 à 2026 · Alternance', titre: 'Un an en entreprise' },
  { date: '2025 · Certification', titre: 'Opquast, niveau confirmé' },
  { date: '2025 · Titre professionnel', titre: 'Développeur web et web mobile (DWWM)' },
]

const stack = [
  { title: 'Frontend', items: ['REACT', 'NEXT.JS', 'TYPESCRIPT', 'TAILWINDCSS'] },
  { title: 'Backend', items: ['NODE.JS', 'NEST.JS', 'PRISMA', 'POSTGRESQL'] },
  { title: 'Outils', items: ['GIT', 'FIGMA', 'DOCKER', 'WEBFLOW', 'WORDPRESS'] },
]

const h2 = 'font-title uppercase text-4xl md:text-5xl lg:text-6xl'

export default function AboutPage() {
  return (
    <main className="flex items-center justify-center min-h-screen px-4 text-pretty md:px-0 md:pt-14 md:pb-6">
      {/* Grand écran : lignes selon le contenu (60 % / 40 % fixes : le texte débordait), 16 px seulement si la hauteur suit */}
      <div className="grid grid-cols-1 gap-8 w-full max-w-[1280px] text-sm md:grid-cols-2 md:w-[85vw] min-[1700px]:grid-rows-[auto_1fr] min-[1700px]:min-h-[80vh] [@media_(min-width:1700px)_and_(min-height:1060px)]:text-base">

        {/* Photo ASCII, sans nom ni titre visible (déjà sur l'accueil) */}
        <section
          aria-label="Photo"
          className="bg-cover bg-center aspect-[11/10] mt-14 md:mt-0 md:aspect-auto md:min-h-[30rem] min-[1700px]:min-h-0"
          style={{ backgroundImage: "url('https://res.cloudinary.com/ln8fnpns/image/upload/f_auto,q_auto/v1789733263/me.webp')" }}
        >
          <h1 className="sr-only">À propos de Joachim Daval, développeur et designer freelance</h1>
        </section>

        {/* À propos */}
        <section className="flex flex-col justify-center py-8 md:py-0">
          <h2 aria-label="À propos" className={`${h2} md:text-right`}><Scramble text="A propos" /></h2>
          <div>
            <p className="py-2"><Scramble step={3} text="J'aime l'informatique et tout ce qui l'entoure depuis ma plus tendre enfance. Avant d'en faire mon métier, je suis passé par le droit, la philosophie, la psychologie et les arts plastiques, et c'est finalement sur une autre toile que je peins&nbsp;: le web." /></p>
            <p className="py-2"><Scramble step={3} text="Depuis 2024, j'ai travaillé sur des projets concrets, pendant mes formations, en entreprise et avec mes propres clients. J'y ai appris à voir un projet dans son ensemble, et à soigner aussi ce qui ne se voit pas, à commencer par la sécurité." /></p>
            <p className="py-2"><Scramble step={3} text="Ce qui me plaît par-dessus tout, c'est d'apprendre de nouvelles manières de faire et de trouver la solution qui convient à chaque projet, tout en la rendant accessible à tous." /></p>
            <p className="py-2"><Scramble step={3} text="Sinon, j'habite à Strasbourg et quand je ne code pas, j'aime bien sortir, jouer à des jeux vidéo ou regarder des films. Si vous ne savez pas quoi regarder ce soir, je ne peux que vous recommander La grande bellezza de Paolo Sorrentino." /></p>
          </div>
        </section>

        {/* Parcours */}
        <section className="flex flex-col justify-center py-8 md:py-0">
          <h2 className={`${h2} md:text-right`}><Scramble text="Parcours" /></h2>
          <ul className="flex flex-col gap-3 mt-2">
            {parcours.map(({ date, titre }) => (
              <li key={titre}>
                <span className="block opacity-60 text-sm"><Scramble text={date} /></span>
                <p><Scramble step={2} text={titre} /></p>
              </li>
            ))}
          </ul>
        </section>

        {/* Stack. Tablette : « Outils » passe sous « Frontend », c'est voulu */}
        <section className="flex flex-col justify-center py-8 md:py-0 lg:pl-12">
          <h2 className={h2}><Scramble text="Stack" /></h2>
          <div className="flex flex-wrap gap-8 md:gap-20">
            {stack.map(({ title, items }) => (
              <div key={title}>
                <h3 className="py-4"><Scramble text={title} /></h3>
                <ul className="flex flex-col">
                  {items.map((item, i) => (
                    <li key={item}><Scramble text={item} delay={(i + 1) * 2} /></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
