import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import Scramble from '@/components/Scramble'
import FondAscii from '@/components/FondAscii'
import { sansAccents } from '@/lib/text'
import Sommaire from './Sommaire'
import './methode.css'

// Méthode et tarifs : page hors navbar, qui défile, imprimable (règles @media print de methode.css).
// Textes : vault, 01 PROJECTS/Portfolio/contenus/06-methode.md
// À chaque changement de prix : mettre à jour TARIFS_DATE et régénérer public/methode.pdf
const TARIFS_DATE = 'novembre 2026'
const PDF = '/methode.pdf'

export const metadata: Metadata = {
  title: 'Méthode et tarifs | Joachim Daval',
  description: 'Les offres, les prix et les délais de Joachim Daval, développeur et designer freelance, et comment se déroule un projet, du premier échange à la mise en ligne.',
}

const crochet = 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150'

function EntreCrochets({ children }: { children: ReactNode }) {
  return (
    <>
      <span aria-hidden="true" className={crochet}>[</span>
      <span>{children}</span>
      <span aria-hidden="true" className={crochet}>]</span>
    </>
  )
}

// Titre de section : sans accents à l'affichage (police de titre), accentué pour la lecture
function Titre({ id, children }: { id: string; children: string }) {
  const affiche = sansAccents(children)
  return (
    <h2 id={id} aria-label={affiche === children ? undefined : children} className="titre">
      <Scramble text={affiche} onView />
    </h2>
  )
}

// Sous-titre : sans accents à l'écran, accentué à l'impression (autre police)
function SousTitre({ children }: { children: string }) {
  const affiche = sansAccents(children)
  if (affiche === children) return <h3 className="sous-titre">{children}</h3>
  return (
    <h3 aria-label={children} className="sous-titre">
      <span className="print:hidden">{affiche}</span>
      <span className="hidden print:block">{children}</span>
    </h3>
  )
}

type LigneProps = {
  nom: string
  precision?: string // à la suite du nom, ou sous le nom si la place manque
  delai?: string
  prix: string
  fixe?: boolean // pas de « dès »
}

function Ligne({ nom, precision, delai, prix, fixe = false }: LigneProps) {
  return (
    <tr>
      <th scope="row">{nom}{precision && <span className="large">, {precision}</span>}</th>
      <td className="delai">
        {precision && <span className="etroit">{precision}{delai && <>&nbsp;· </>}</span>}
        {delai && <span className={precision ? 'whitespace-nowrap' : undefined}>{delai}</span>}
      </td>
      <td className="prix">{!fixe && 'dès '}<span className="prix-nb">{prix}</span>&nbsp;€</td>
    </tr>
  )
}

function Offre({ titre, texte, suite = false, children }: { titre: string; texte: string; suite?: boolean; children: ReactNode }) {
  return (
    <div className={`bloc flex flex-col gap-4${suite ? ' mt-6' : ''}`}>
      <SousTitre>{titre}</SousTitre>
      <p className="max-w-2xl leading-relaxed opacity-80">{texte}</p>
      <table className="tarifs">
        <colgroup><col className="w-[21.5em]" /><col /><col className="w-[9em]" /></colgroup>
        <thead className="sr-only">
          <tr><th scope="col">Offre</th><th scope="col">Délai</th><th scope="col">Prix</th></tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function Etape({ n, titre, part, quand, children }: { n: number; titre: string; part?: string; quand?: string; children: ReactNode }) {
  return (
    <li className="bloc grid items-baseline grid-cols-[2.5rem_1fr] md:grid-cols-[3.5rem_1fr_11rem] gap-x-4 gap-y-3 py-6">
      <span aria-hidden="true" className="prix-nb">{n}</span>
      <div className="flex flex-col gap-3">
        <SousTitre>{titre}</SousTitre>
        <p className="leading-relaxed opacity-80">{children}</p>
      </div>
      {part && (
        <p className="col-start-2 md:col-start-3 md:text-right">
          <span className="prix-nb">{part}</span>&nbsp;%<span className="block opacity-70 text-balance">{quand}</span>
        </p>
      )}
    </li>
  )
}

function Question({ q, children }: { q: string; children: ReactNode }) {
  return <div className="bloc"><dt>{q}</dt><dd className="opacity-70">{children}</dd></div>
}

export default function MethodePage() {
  return (
    <div className="methode text-sm min-[1700px]:text-base">

      {/* PDF : fixe en haut à droite, sur la ligne de la navbar, dès 1024 px (en dessous, la navbar centrée prend la place). Sur mobile la navbar est pleine :
          le lien est sous l'introduction. Un seul des deux est affiché. */}
      <a href={PDF} download className="group hidden lg:flex print:hidden gap-2 fixed z-50 top-0 lg:right-15 xl:right-[calc(var(--marge)-1.25rem)] py-4 lg:pt-[var(--nav-top)] text-base">
        <EntreCrochets>Télécharger en PDF</EntreCrochets>
      </a>

      <FondAscii />

      <div className="page relative z-10 w-[90vw] lg:w-[78vw] max-w-6xl mx-auto pt-28 lg:pt-36 pb-16 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12 xl:gap-16">

        <Sommaire />

        <main>
          {/* 1 · Introduction */}
          <header className="flex flex-col gap-6">
            <p className="entete hidden"><span>Joachim Daval, développeur freelance</span> <span>Tarifs à jour en {TARIFS_DATE}</span></p>
            <h1 aria-label="Méthode et tarifs" className="font-title uppercase tracking-widest text-5xl md:text-6xl lg:text-7xl leading-none">
              <Scramble text="Methode et tarifs" />
            </h1>
            <p className="max-w-2xl leading-relaxed">Ce que je propose, comment on travaille ensemble et combien ça coûte. Les prix sont des points de départ, le montant exact est défini dans le devis, après notre premier échange.</p>
            <a href={PDF} download className="group lg:hidden print:hidden self-start -ml-5 flex gap-2 tracking-widest uppercase py-2">
              <EntreCrochets>télécharger en PDF</EntreCrochets>
            </a>
          </header>

          {/* 2 · Les offres */}
          <section id="offres" aria-labelledby="t-offres" className="section">
            <Titre id="t-offres">Les offres</Titre>
            <Offre titre="Artistes et créateurs" texte="Un portfolio à votre image, que vous mettez à jour vous-même.">
              <Ligne nom="Une page" delai="2 à 5&nbsp;semaines" prix="800" />
              <Ligne nom="Portfolio" precision="jusqu'à 3&nbsp;pages" delai="2 à 5&nbsp;semaines" prix="1&nbsp;000" />
              <Ligne nom="Page en plus" precision="dès la quatrième" prix="200" fixe />
            </Offre>
            <Offre suite titre="Indépendants et entreprises" texte="Un site sur mesure qui présente votre activité et inspire confiance. Vous modifiez vos textes et vos images vous-même.">
              <Ligne nom="Une page" delai="3 à 4&nbsp;semaines" prix="1&nbsp;200" />
              <Ligne nom="Site vitrine" precision="jusqu'à 5&nbsp;pages" delai="6 à 8&nbsp;semaines" prix="2&nbsp;400" />
              <Ligne nom="Page en plus" precision="dès la sixième" prix="200" fixe />
            </Offre>
            <Offre suite titre="Projets sur mesure" texte="Réservation en ligne, application web, outil métier&nbsp;: je conçois l'interface et tout ce qui tourne derrière.">
              <Ligne nom="Devis après un échange" delai="à partir de 3&nbsp;mois, planning dans le devis" prix="4&nbsp;500" />
            </Offre>
            <p className="opacity-70 leading-relaxed">Prix nets. TVA non applicable, art. 293 B du CGI.</p>
          </section>

          {/* 3 · Toujours inclus */}
          <section id="inclus" aria-labelledby="t-inclus" className="section">
            <Titre id="t-inclus">Toujours inclus</Titre>
            <ul role="list" className="inclus bloc leading-relaxed">
              <li>
                Une maquette dessinée pour vous, avec 2&nbsp;allers-retours
                <p className="opacity-70">Un aller-retour, c&apos;est une liste de vos remarques, puis une version corrigée. <span className="whitespace-nowrap">Au-delà</span> des deux, les corrections sont à 60&nbsp;€/h.</p>
              </li>
              <li>Un site adapté au téléphone, à la tablette et à l&apos;ordinateur</li>
              <li>Une attention portée à l&apos;accessibilité</li>
              <li>Les bases du référencement</li>
              <li>Un formulaire de contact</li>
              <li>La mise en ligne, avec les comptes à votre nom</li>
              <li>Un guide de prise en main</li>
            </ul>
          </section>

          {/* 4 · Comment on travaille : vraie suite numérotée, paiement à droite */}
          <section id="methode" aria-labelledby="t-methode" className="section">
            <Titre id="t-methode">Comment on travaille</Titre>
            <ol className="etapes flex flex-col">
              <Etape n={1} titre="On se parle">
                Je réponds à votre message sous 2&nbsp;jours ouvrés, puis on échange 30&nbsp;minutes en visio, c&apos;est offert&nbsp;: votre projet, votre budget, vos délais.
              </Etape>
              <Etape n={2} titre="Devis et accès" part="30" quand="à la signature">
                Le devis arrive sous 2&nbsp;jours ouvrés (une semaine pour un projet sur mesure) et reste valable 1&nbsp;mois. Une fois signé, je vous guide pour créer vos comptes.
              </Etape>
              <Etape n={3} titre="Maquette" part="40" quand="à la validation de la maquette">
                Je dessine votre site, vous le consultez en ligne et vous me dites ce que vous en pensez. Vos textes, vos photos et votre logo arrivent au plus tard à sa validation.
              </Etape>
              <Etape n={4} titre="Développement">
                Le site prend vie sur une adresse de test. Vous suivez l&apos;avancement et vous vérifiez tout.
              </Etape>
              <Etape n={5} titre="Mise en ligne et suivi" part="30" quand="avant la mise en ligne">
                Une fois le site validé et le dernier paiement reçu, je le mets en ligne. Pendant le mois qui suit, je corrige gratuitement les bugs.
              </Etape>
            </ol>
            <p className="max-w-2xl leading-relaxed opacity-80">Les délais comptent à partir de la signature et de l&apos;acompte. Ils dépendent aussi de vos retours, de vos contenus et du règlement de chaque étape. Si l&apos;un d&apos;eux tarde, le projet se met en pause et reprend dès qu&apos;il arrive.</p>
          </section>

          {/* 5 · Votre site vous appartient */}
          <section id="propriete" aria-labelledby="t-propriete" className="section">
            <Titre id="t-propriete">Votre site vous appartient</Titre>
            <div className="bloc flex flex-col gap-4 max-w-2xl leading-relaxed">
              <p>Le nom de domaine, l&apos;hébergement et les accès sont à votre nom. Vous payez directement le domaine (environ 10 à 20&nbsp;€ par an) et l&apos;hébergement (environ 5 à 15&nbsp;€ par mois).</p>
              <p>Aucun abonnement obligatoire chez moi. Si votre projet utilise d&apos;autres services (paiement en ligne, par exemple), leurs frais sont indiqués dans le devis.</p>
            </div>
          </section>

          {/* 6 · Après la mise en ligne. Sous-grille : prix et textes alignés même si un sous-titre passe sur deux lignes */}
          <section id="apres" aria-labelledby="t-apres" className="section">
            <Titre id="t-apres">Après la mise en ligne</Titre>
            <p className="max-w-2xl leading-relaxed">Vous continuez en autonomie, ou vous me confiez la maintenance de votre site.</p>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 md:gap-y-4">
              <article className="bloc flex flex-col gap-4 md:grid md:grid-rows-subgrid md:row-span-3 border-t border-current/30 pt-5">
                <SousTitre>Maintenance</SousTitre>
                <p>dès <span className="prix-nb">40</span>&nbsp;€ par mois<br /><span className="opacity-70">sur devis pour un projet sur mesure</span></p>
                <p className="leading-relaxed opacity-80">Mises à jour, sauvegardes, suivi de l&apos;hébergement et du nom de domaine, jusqu&apos;à 30&nbsp;minutes de petites corrections par mois (non cumulables). Vous arrêtez quand vous voulez, avec un préavis de 1&nbsp;mois.</p>
              </article>
              <article className="bloc flex flex-col gap-4 md:grid md:grid-rows-subgrid md:row-span-3 border-t border-current/30 pt-5">
                <SousTitre>Retouches à la demande</SousTitre>
                <p><span className="prix-nb">60</span>&nbsp;€ par heure<br /><span className="opacity-70">sans engagement</span></p>
                <p className="leading-relaxed opacity-80">Une modification ou un ajout, quand vous en avez besoin.</p>
              </article>
            </div>
          </section>

          {/* 7 · Questions : courtes, donc ouvertes (pas d'accordéon, lisibles aussi à l'impression) */}
          <section id="questions" aria-labelledby="t-questions" className="section">
            <Titre id="t-questions">Questions fréquentes</Titre>
            <dl className="faq grid md:grid-cols-2 gap-x-12 gap-y-10">
              <Question q="Que dois-je fournir&nbsp;?">Vos textes, vos photos et votre logo, au plus tard à la validation de la maquette.</Question>
              <Question q="Pourrai-je modifier mon site&nbsp;?">Oui. Vous modifiez vos textes et vos images vous-même, avec le guide remis à la livraison. Pour un projet sur mesure, ce que vous pouvez modifier est précisé dans le devis.</Question>
              <Question q="Et si j'arrête de travailler avec vous&nbsp;?">Tout est déjà à votre nom. Vous gardez votre site et vous pouvez le confier à quelqu&apos;un d&apos;autre.</Question>
              <Question q="Vous travaillez à distance&nbsp;?">Oui, partout en France. On échange en visio ou par message.</Question>
            </dl>
          </section>

          {/* 8 · Contact */}
          <section id="contact" aria-labelledby="t-contact" className="section">
            <Titre id="t-contact">On en parle</Titre>
            <p className="max-w-2xl leading-relaxed">Vous avez un projet, même encore flou&nbsp;? Écrivez-moi, on prend le temps d&apos;en discuter.</p>
            <Link href="/contact" className="group print:hidden self-start -ml-5 flex gap-2 tracking-widest uppercase text-base py-2">
              <EntreCrochets>écrire un message</EntreCrochets>
            </Link>
            <p className="hidden print:block"><a href="https://joachimdaval.dev/contact">joachimdaval.dev/contact</a></p>
          </section>
        </main>
      </div>

      {/* Provisoire : le lien « Mentions légales » arrivera avec la page /legal */}
      <footer className="print:hidden relative z-10 w-[90vw] lg:w-[78vw] max-w-6xl mx-auto border-t border-current/30 py-6 text-xs">
        Joachim Daval
      </footer>
    </div>
  )
}
