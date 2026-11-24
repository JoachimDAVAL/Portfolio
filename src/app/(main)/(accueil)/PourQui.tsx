'use client'

import { useEffect, useRef, useState } from 'react'
import { NBSP, sansAccents } from '@/lib/text'
import Texte from './Texte'
import { GRAND, brouiller, former } from './moteur'

// 3 colonnes dès 1024 px ; accordéon en dessous : intitulé et prix toujours visibles, une seule ligne ouverte à la fois.
// À chaque changement de prix : voir aussi methode/page.tsx
const offres = [
  {
    nom: 'Artistes et créateurs',
    texte: 'Un portfolio à votre image, que vous mettez à jour vous-même.',
    prix: '800',
    precision: 'Pour une page',
  },
  {
    nom: 'Indépendants et entreprises',
    texte: 'Un site sur mesure qui présente votre activité et inspire confiance. Vous modifiez vos textes vous-même.',
    prix: '1 200',
    precision: 'Pour une page',
  },
  {
    nom: 'Projets sur mesure',
    texte: `Réservation en ligne, application web, outil métier${NBSP}: je conçois l'interface et tout ce qui tourne derrière.`,
    prix: '4 500',
    precision: 'Devis après un échange',
  },
]

const colonnes = [
  'lg:pr-8',
  'border-t border-current/30 lg:border-t-0 lg:border-l lg:px-8',
  'border-t border-current/30 lg:border-t-0 lg:border-l lg:pl-8',
]

export default function PourQui() {
  const grilleRef = useRef<HTMLDivElement>(null)
  const [ouverte, setOuverte] = useState(0) // -1 : toutes fermées

  useEffect(() => {
    const grille = grilleRef.current
    if (!grille) return
    const grand = window.matchMedia(GRAND)
    // Même hauteur pour les 3 textes : le reste de la diapo ne bouge pas quand on passe d'une ligne à l'autre
    const egaliser = () => {
      const ps = Array.from(grille.querySelectorAll<HTMLElement>('.acc-text > p'))
      ps.forEach((p) => { p.style.minHeight = '' })
      if (grand.matches) return
      const h = Math.max(...ps.map((p) => p.offsetHeight))
      ps.forEach((p) => { p.style.minHeight = h + 'px' })
    }
    // Passage en 3 colonnes : les panneaux fermés s'affichent, leur texte doit être formé
    const onChange = () => {
      const diapo = grille.closest<HTMLElement>('[data-slide]')
      if (grand.matches && diapo && !diapo.inert && !diapo.hasAttribute('data-masquee')) former(grille)
      egaliser()
    }
    egaliser()
    document.fonts.ready.then(egaliser)
    grand.addEventListener('change', onChange)
    window.addEventListener('resize', egaliser)
    return () => {
      grand.removeEventListener('change', onChange)
      window.removeEventListener('resize', egaliser)
    }
  }, [])

  const basculer = (n: number) => {
    if (window.matchMedia(GRAND).matches) return
    const textesDe = (i: number) =>
      Array.from(grilleRef.current?.querySelectorAll<HTMLElement>(`[data-offre="${i}"] .acc-panel [data-texte]`) ?? [])
    const suivante = n === ouverte ? -1 : n
    if (ouverte >= 0) {
      textesDe(ouverte).forEach((el) => {
        const longueur = el.querySelector('[data-place]')?.textContent?.length ?? 0
        brouiller(el, false, 0, Math.max(6, Math.ceil(longueur / 12)))
      })
    }
    if (suivante >= 0) textesDe(suivante).forEach((el) => { brouiller(el, true, 0, Number(el.dataset.step)) })
    setOuverte(suivante)
  }

  return (
    <div ref={grilleRef} className="grid grid-cols-1 border-y border-current/30 lg:grid-cols-3 lg:grid-rows-[repeat(3,auto)]">
      {offres.map(({ nom, texte, prix, precision }, i) => {
        const affiche = sansAccents(nom)
        const ferme = i === ouverte ? undefined : ''
        const d = i * 4 // chaque colonne démarre un peu après la précédente
        return (
          <article key={nom} data-offre={i} className={`flex flex-col gap-0 py-0 lg:grid lg:grid-rows-subgrid lg:row-span-3 ${colonnes[i]}`}>
            <div className="acc-tete relative max-lg:order-1 flex items-center lg:justify-center lg:text-center lg:py-3 min-[1500px]:py-5 lg:border-b lg:border-current/30">
              <h3 aria-label={affiche === nom ? undefined : nom} className="max-lg:pr-7 font-title max-md:text-xl text-2xl min-[1500px]:text-3xl leading-none tracking-widest uppercase">
                <Texte delay={4 + i * 2}>{affiche}</Texte>
              </h3>
              <button
                type="button"
                aria-label={`Détail : ${nom}`}
                aria-expanded={i === ouverte}
                aria-controls={`offre-${i}-precision offre-${i}-texte`}
                onClick={() => basculer(i)}
                className="acc-btn lg:hidden"
              >
                <span aria-hidden="true" className="acc-sign fade" />
              </button>
            </div>
            <div id={`offre-${i}-texte`} data-ferme={ferme} className="acc-panel max-lg:order-4 lg:flex lg:flex-col lg:justify-center lg:py-4 min-[1500px]:py-6">
              <div className="acc-inner acc-text">
                <p className="leading-relaxed lg:text-center opacity-80 max-lg:pb-4"><Texte step={3} delay={8 + d}>{texte}</Texte></p>
              </div>
            </div>
            <div className="max-lg:contents lg:flex lg:justify-center lg:flex-col lg:items-stretch lg:gap-1 lg:py-3 min-[1500px]:gap-2 min-[1500px]:py-5 lg:border-t lg:border-current/30">
              {/* La ligne du prix ouvre aussi le panneau, au doigt ou à la souris (au clavier, le bouton suffit) */}
              <p onClick={() => basculer(i)} className="acc-prix max-lg:order-2 flex items-baseline lg:justify-center gap-3 max-lg:pb-3 whitespace-nowrap">
                <span className="text-xs tracking-widest uppercase opacity-60"><Texte delay={12 + d}>dès</Texte></span>{' '}
                <span className="font-title max-md:text-2xl text-3xl min-[1500px]:text-4xl"><Texte delay={12 + d}>{prix}</Texte></span>{' '}
                <span className="text-lg min-[1500px]:text-xl"><Texte delay={12 + d}>€</Texte></span>
              </p>
              <div id={`offre-${i}-precision`} data-ferme={ferme} className="acc-panel acc-precision max-lg:order-3">
                <div className="acc-inner">
                  <p className="text-xs lg:text-center opacity-60 max-lg:pb-3"><Texte delay={16 + d}>{precision}</Texte></p>
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
