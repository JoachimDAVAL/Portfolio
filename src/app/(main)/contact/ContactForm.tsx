'use client'

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import Scramble from '@/components/Scramble'
import { TYPES_DEMANDE, type ChampErreur } from '@/lib/contact'
import { chargerTurnstile, obtenirJeton } from '@/lib/turnstile'

type Statut = 'idle' | 'envoi' | 'ok' | 'erreur'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const champ =
  'w-full bg-transparent border-b border-current/30 py-2 outline-none transition-colors ' +
  'focus:border-current aria-[invalid=true]:border-red-400 placeholder:text-current/30'
// Téléphone, tablette : bordure légère et fond (lisible sur la vidéo) ; ordinateur : sans cadre
const cadre = 'text-sm min-[1700px]:text-base border border-current/20 bg-background/85 p-6 lg:border-0 lg:bg-transparent lg:p-0'
const crochet = 'opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100'
const libelle = 'text-xs min-[1700px]:text-sm tracking-widest uppercase'

// Libellé brouillé à l'arrivée sur la page (même effet que le reste du site)
function Libelle({ id, htmlFor, text, delay, optionnel = false }: {
  id?: string
  htmlFor?: string
  text: string
  delay: number
  optionnel?: boolean
}) {
  const Tag = htmlFor ? 'label' : 'span'
  return (
    <Tag id={id} htmlFor={htmlFor} className={libelle}>
      <span className="inline-block"><Scramble text={text} delay={delay} /></span>
      {optionnel ? <span className="opacity-60 normal-case tracking-normal"> (facultatif)</span> : null}
    </Tag>
  )
}

export default function ContactForm() {
  const [type, setType] = useState('')
  const [erreurs, setErreurs] = useState<Partial<Record<ChampErreur, string>>>({})
  const [statut, setStatut] = useState<Statut>('idle')
  const [messageErreur, setMessageErreur] = useState('')
  // Anti-robot : emplacement de la case, affichée seulement si Cloudflare a un doute
  const anti = useRef<HTMLDivElement>(null)
  const [aCocher, setACocher] = useState(false)
  useEffect(() => { if (aCocher) anti.current?.scrollIntoView({ block: 'nearest' }) }, [aCocher])
  const debut = useRef(0)
  useEffect(() => { debut.current = Date.now() }, [])

  // Message envoyé : le focus passe sur la confirmation (lue par les lecteurs d'écran) et elle remonte à l'écran
  // si le formulaire était plus haut qu'elle (téléphone, tablette)
  const confirmation = useRef<HTMLDivElement>(null)
  const [hauteur, setHauteur] = useState(0)
  useEffect(() => {
    if (statut !== 'ok') return
    confirmation.current?.focus({ preventScroll: true })
    if (!window.matchMedia('(min-width: 1024px)').matches) confirmation.current?.scrollIntoView()
  }, [statut])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (statut === 'envoi') return
    const form = e.currentTarget
    const data = new FormData(form)
    const valeurs = {
      nom: String(data.get('nom') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
      type,
      site: String(data.get('site') ?? ''), // champ piège
      t: Date.now() - debut.current,
    }

    // Validation côté client (la route revalide côté serveur)
    const e2: Partial<Record<ChampErreur, string>> = {}
    if (!valeurs.nom) e2.nom = 'Indiquez votre nom.'
    if (!EMAIL_RE.test(valeurs.email)) e2.email = 'Adresse e-mail invalide.'
    if (valeurs.message.length < 10) e2.message = 'Votre message est un peu court.'
    setErreurs(e2)
    if (Object.keys(e2).length) {
      const premier = (['nom', 'email', 'message'] as const).find((k) => e2[k])
      if (premier) (form.elements.namedItem(premier) as HTMLElement | null)?.focus()
      return
    }

    setStatut('envoi')
    setMessageErreur('')
    let jeton: string
    try {
      if (!anti.current) throw new Error('emplacement')
      jeton = await obtenirJeton(anti.current, setACocher)
    } catch {
      setMessageErreur("La vérification anti-robot n'a pas abouti. Réessayez ou écrivez-moi directement.")
      setStatut('erreur')
      return
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...valeurs, jeton }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (json.erreurs) setErreurs(json.erreurs)
        setMessageErreur(json.error ?? "L'envoi a échoué. Réessayez ou écrivez-moi directement.")
        setStatut('erreur')
        return
      }
      setHauteur(form.offsetHeight)
      form.reset()
      setType('')
      setStatut('ok')
    } catch {
      setMessageErreur("L'envoi a échoué. Vérifiez votre connexion ou écrivez-moi directement.")
      setStatut('erreur')
    }
  }

  if (statut === 'ok') {
    return (
      // Ordinateur : garde la hauteur du formulaire, la page ne bouge pas
      <div
        ref={confirmation}
        tabIndex={-1}
        style={{ '--h': `${hauteur}px` } as CSSProperties}
        className={`${cadre} flex flex-col gap-6 scroll-mt-20 outline-none lg:min-h-[var(--h)]`}
      >
        {/* Police de titre sans accents */}
        <p className="font-title uppercase tracking-widest text-3xl md:text-4xl">
          <span aria-hidden="true">Message envoye.</span>
          <span className="sr-only">Message envoyé.</span>
        </p>
        <p>Merci, je vous réponds sous 2&nbsp;jours ouvrés.</p>
        <button
          type="button"
          onClick={() => { setStatut('idle'); debut.current = Date.now() }}
          className="group self-start -ml-5 flex gap-2 text-xs tracking-widest uppercase cursor-pointer"
        >
          <span aria-hidden="true" className={crochet}>[</span>
          écrire un autre message
          <span aria-hidden="true" className={crochet}>]</span>
        </button>
      </div>
    )
  }

  const aideErreur = (k: ChampErreur) =>
    erreurs[k] ? <p id={`${k}-erreur`} className="text-xs text-red-400">{erreurs[k]}</p> : null

  return (
    <form onSubmit={onSubmit} onFocus={() => { chargerTurnstile().catch(() => {}) }} noValidate className={`${cadre} flex flex-col gap-8`}>
      <div className="flex flex-col gap-1">
        <Libelle htmlFor="nom" text="Nom" delay={6} />
        <input
          id="nom" name="nom" type="text" autoComplete="name" maxLength={100} required
          aria-invalid={!!erreurs.nom} aria-describedby={erreurs.nom ? 'nom-erreur' : undefined}
          className={champ}
        />
        {aideErreur('nom')}
      </div>

      <div className="flex flex-col gap-1">
        <Libelle htmlFor="email" text="E-mail" delay={10} />
        <input
          id="email" name="email" type="email" autoComplete="email" maxLength={200} required
          aria-invalid={!!erreurs.email} aria-describedby={erreurs.email ? 'email-erreur' : undefined}
          className={champ}
        />
        {aideErreur('email')}
      </div>

      {/* Type de demande : choix unique facultatif, re-cliquer désélectionne */}
      <div className="flex flex-col gap-3" role="group" aria-labelledby="type-libelle">
        <Libelle id="type-libelle" text="Type de demande" delay={14} optionnel />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 justify-items-start">
          {TYPES_DEMANDE.map((t) => {
            const actif = type === t
            return (
              <button
                key={t}
                type="button"
                aria-pressed={actif}
                onClick={() => setType(actif ? '' : t)}
                className={`group flex gap-1 text-left cursor-pointer transition-opacity ${actif ? 'opacity-100' : 'opacity-75 hover:opacity-100'}`}
              >
                <span aria-hidden="true" className={actif ? 'opacity-100' : 'opacity-0'}>[</span>
                {t}
                <span aria-hidden="true" className={actif ? 'opacity-100' : 'opacity-0'}>]</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Libelle htmlFor="message" text="Message" delay={18} />
        <textarea
          id="message" name="message" rows={5} maxLength={5000} required
          aria-invalid={!!erreurs.message} aria-describedby={erreurs.message ? 'message-erreur' : undefined}
          className={`${champ} resize-none`}
        />
        {aideErreur('message')}
      </div>

      {/* Champ piège anti-spam : invisible pour les humains, rempli par les robots */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label htmlFor="site">Ne pas remplir</label>
        <input id="site" name="site" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-4">
        <button
          type="submit"
          disabled={statut === 'envoi'}
          className="group self-start -ml-5 flex gap-2 text-base lg:text-lg font-bold tracking-widest uppercase cursor-pointer disabled:cursor-wait disabled:opacity-50"
        >
          <span aria-hidden="true" className={crochet}>[</span>
          {statut === 'envoi' ? 'envoi…' : 'envoyer'}
          <span aria-hidden="true" className={crochet}>]</span>
        </button>

        {/* Sans case à cocher, l'emplacement ne prend pas de place (-mt-4 annule l'espacement) */}
        <p role="status" className="text-xs empty:hidden">{aCocher ? 'Cochez la case pour envoyer votre message.' : ''}</p>
        <div ref={anti} className={aCocher ? '' : '-mt-4'} />

        <p role="alert" className="text-xs text-red-400 empty:hidden">{statut === 'erreur' ? messageErreur : ''}</p>

        <p className="text-xs opacity-70">
          Vos données servent uniquement à vous répondre. Le message est acheminé par Brevo, un service d&apos;envoi d&apos;e-mails.
        </p>
      </div>
    </form>
  )
}
