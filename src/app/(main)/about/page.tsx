'use client'

import { useState, useEffect } from 'react'
import { useTextScramble } from '@/hooks/useTextScramble'

const stackData = [
  { title: 'Frontend', items: ['REACT', 'NEXT.JS', 'TYPESCRIPT', 'TAILWINDCSS'] },
  { title: 'Backend',  items: ['NODE.JS', 'NEST.JS', 'PRISMA', 'POSTGRESQL'] },
  { title: 'Outils',  items: ['GIT', 'FIGMA', 'DOCKER', 'WEBFLOW', 'WORDPRESS'] },
]

function StackItem({ label, delay, mounted }: { label: string; delay: number; mounted: boolean }) {
  const display = useTextScramble(label, mounted, delay)
  return <li>{display}</li>
}

function StackGroup({ title, items, mounted }: { title: string; items: string[]; mounted: boolean }) {
  const headerDisplay = useTextScramble(title, mounted)
  return (
    <div>
      <h3 className="py-4">{headerDisplay}</h3>
      <ul className="flex flex-col">
        {items.map((item, i) => (
          <StackItem key={item} label={item} delay={(i + 1) * 2} mounted={mounted} />
        ))}
      </ul>
    </div>
  )
}

export default function AboutPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Hero
  const prenom    = useTextScramble('Joachim',    mounted)
  const nom       = useTextScramble('DAVAL',      mounted, 4)
  const jobTitle1 = useTextScramble('Développeur', mounted, 8)
  const jobTitle2 = useTextScramble('Fullstack &', mounted, 12)
  const jobTitle3 = useTextScramble('Webmaster',  mounted, 16)

  // À propos
  const aboutH = useTextScramble('à propos', mounted)
  const p1 = useTextScramble("Développeur fullstack passionné, j'aime tout ce qui touche à l'informatique depuis ma tendre enfance et cela fait 2 ans que j'ai fait le choix d'en faire mon métier.", mounted, 0, 3)
  const p2 = useTextScramble("Actuellement en formation pour préparer le titre CDA, j'ai eu la chance de travailler sur des projets concrets dans le cadre de mes formations et de mon activité en tant que freelance.", mounted, 0, 3)
  const p3 = useTextScramble("Cette dernière m'a notamment permis d'acquérir une bonne vue d'ensemble des projets et l'importance de leur architecture, domaine qui me semble de plus en plus essentiel, surtout avec les changements apportés par l'IA.", mounted, 0, 3)
  const p4 = useTextScramble("Concernant l'IA j'ai appris à l'utiliser moi-même au quotidien de manière agentique et dans un dossier obsidian organisé autour de la méthode PARA si cela vous parle.", mounted, 0, 3)
  const p5 = useTextScramble("Pour finir, je dirai que ce qui me plaît par dessus tout est d'apprendre de nouvelles choses/manières de les faire, d'adapter au mieux une solution à un problème et d'éviter l'enfermement que j'associe à la sépcialisation.", mounted, 0, 3)

  // Formation
  const formationH = useTextScramble('Formation', mounted)
  const f1y = useTextScramble('2025 – 2026 · ESTIAM', mounted)
  const f1t = useTextScramble('Développement web fullstack (CDA) — alternance', mounted, 0, 2)
  const f2y = useTextScramble("2024 – 2025 · O'CLOCK", mounted)
  const f2t = useTextScramble('Développement web fullstack (DWWM)', mounted, 0, 2)
  const f3y = useTextScramble('2018 – 2024 · Université de Lorraine', mounted)
  const f3t = useTextScramble("En recherche d'un domaine", mounted, 0, 2)

  // Stack
  const stackH = useTextScramble('Stack', mounted)

  return (
    <main className="flex items-center justify-center min-h-screen px-4 md:px-0">
      <div className="grid grid-cols-1 gap-8 w-full max-w-[1280px] text-sm min-[1700px]:text-base md:grid-cols-2 md:w-[85vw] min-[1700px]:grid-rows-[60%_40%] min-[1700px]:h-[80vh] min-[1700px]:w-[60vw]">

        {/* Hero */}
        <section
          className="bg-cover bg-center flex flex-col justify-center py-12 md:py-0"
          style={{ backgroundImage: "url('/images/me.webp')" }}
        >
          <h1 className="font-title uppercase tracking-widest text-7xl md:text-8xl lg:text-9xl flex flex-col">
            <span>{prenom}</span>
            <span>{nom}</span>
          </h1>
          <p className="font-title uppercase text-5xl lg:text-6xl flex flex-col">
            <span>{jobTitle1}</span>
            <span>{jobTitle2}</span>
            <span>{jobTitle3}</span>
          </p>
        </section>

        {/* À propos */}
        <section className="flex flex-col justify-center py-8 md:py-0">
          <h2 className="font-title uppercase text-4xl md:text-5xl lg:text-6xl md:text-right">{aboutH}</h2>
          <div>
            <p className="py-2">{p1}</p>
            <p className="py-2">{p2}</p>
            <p className="py-2">{p3}</p>
            <p className="py-2">{p4}</p>
            <p className="py-2">{p5}</p>
          </div>
        </section>

        {/* Formation */}
        <section className="flex flex-col justify-center py-8 md:py-0">
          <h2 className="font-title uppercase text-4xl md:text-5xl lg:text-6xl md:text-right">{formationH}</h2>
          <ul className="flex flex-col gap-3 mt-2">
            <li>
              <span className="opacity-60 text-sm">{f1y}</span>
              <p>{f1t}</p>
            </li>
            <li>
              <span className="opacity-60 text-sm">{f2y}</span>
              <p>{f2t}</p>
            </li>
            <li>
              <span className="opacity-60 text-sm">{f3y}</span>
              <p>{f3t}</p>
            </li>
          </ul>
        </section>

        {/* Stack */}
        <section className="flex flex-col justify-center py-8 md:py-0 lg:pl-12">
          <h2 className="font-title uppercase text-4xl md:text-5xl lg:text-6xl">{stackH}</h2>
          <div className="flex flex-wrap gap-8 md:gap-20">
            {stackData.map(group => (
              <StackGroup key={group.title} title={group.title} items={group.items} mounted={mounted} />
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
