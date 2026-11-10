'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTextScramble } from '@/hooks/useTextScramble'
import { TYPES_DEMANDE, type ChampErreur } from '@/lib/contact'

type Statut = 'idle' | 'envoi' | 'ok' | 'erreur'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const champ =
  'w-full bg-transparent border-b border-current/30 py-2 outline-none transition-colors ' +
  'focus:border-current aria-[invalid=true]:border-red-400 placeholder:text-current/30'
const libelle = 'text-xs min-[1700px]:text-sm tracking-widest uppercase'

// Libellé scramblé à l'arrivée sur la page (même effet que le reste du site)
function Libelle({ htmlFor, text, delay, revealed, optionnel = false }: {
  htmlFor?: string
  text: string
  delay: number
  revealed: boolean
  optionnel?: boolean
}) {
  const display = useTextScramble(text, revealed, delay)
  const Tag = htmlFor ? 'label' : 'span'
  return (
    <Tag htmlFor={htmlFor} className={libelle}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
      {optionnel ? <span className="opacity-50 normal-case tracking-normal"> (facultatif)</span> : null}
    </Tag>
  )
}

export default function ContactForm({ revealed }: { revealed: boolean }) {
  const [type, setType] = useState('')
  const [erreurs, setErreurs] = useState<Partial<Record<ChampErreur, string>>>({})
  const [statut, setStatut] = useState<Statut>('idle')
  const [messageErreur, setMessageErreur] = useState('')
  const debut = useRef(0)
  useEffect(() => { debut.current = Date.now() }, [])

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
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valeurs),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (json.erreurs) setErreurs(json.erreurs)
        setMessageErreur(json.error ?? "L'envoi a échoué. Réessayez ou écrivez-moi directement.")
        setStatut('erreur')
        return
      }
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
      <div role="status" className="flex flex-col gap-6 text-sm min-[1700px]:text-base border border-current/20 p-6 lg:border-0 lg:p-0">
        <p className="font-title uppercase tracking-widest text-3xl md:text-4xl">Message envoyé.</p>
        <p>Merci, je reviens vers vous rapidement.</p>
        <button
          type="button"
          onClick={() => { setStatut('idle'); debut.current = Date.now() }}
          className="group self-start flex gap-2 text-xs tracking-widest uppercase cursor-pointer"
        >
          <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-100">[</span>
          écrire un autre message
          <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-100">]</span>
        </button>
      </div>
    )
  }

  const aideErreur = (k: ChampErreur) =>
    erreurs[k] ? <p id={`${k}-erreur`} className="text-xs text-red-400">{erreurs[k]}</p> : null

  return (
    // Mobile : bordure légère pour identifier le bloc comme un formulaire — Desktop : sans cadre
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8 text-sm min-[1700px]:text-base border border-current/20 p-6 lg:border-0 lg:p-0">
      <div className="flex flex-col gap-1">
        <Libelle htmlFor="nom" text="Nom" delay={6} revealed={revealed} />
        <input
          id="nom" name="nom" type="text" autoComplete="name" maxLength={100} required
          aria-invalid={!!erreurs.nom} aria-describedby={erreurs.nom ? 'nom-erreur' : undefined}
          className={champ}
        />
        {aideErreur('nom')}
      </div>

      <div className="flex flex-col gap-1">
        <Libelle htmlFor="email" text="E-mail" delay={10} revealed={revealed} />
        <input
          id="email" name="email" type="email" autoComplete="email" maxLength={200} required
          aria-invalid={!!erreurs.email} aria-describedby={erreurs.email ? 'email-erreur' : undefined}
          className={champ}
        />
        {aideErreur('email')}
      </div>

      {/* Type de demande : choix unique facultatif, re-cliquer désélectionne */}
      <div className="flex flex-col gap-3" role="group" aria-labelledby="type-libelle">
        <span id="type-libelle"><Libelle text="Type de demande" delay={14} revealed={revealed} optionnel /></span>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 justify-items-start">
          {TYPES_DEMANDE.map((t) => {
            const actif = type === t
            return (
              <button
                key={t}
                type="button"
                aria-pressed={actif}
                onClick={() => setType(actif ? '' : t)}
                className={`group flex gap-1 text-left cursor-pointer transition-opacity ${actif ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
              >
                <span className={actif ? 'opacity-100' : 'opacity-0'}>[</span>
                {t}
                <span className={actif ? 'opacity-100' : 'opacity-0'}>]</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Libelle htmlFor="message" text="Message" delay={18} revealed={revealed} />
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
          className="group self-start flex gap-2 text-base lg:text-lg font-bold tracking-widest uppercase cursor-pointer disabled:cursor-wait disabled:opacity-50"
        >
          <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">[</span>
          {statut === 'envoi' ? 'envoi…' : 'envoyer'}
          <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">]</span>
        </button>

        <p role="alert" className="text-xs text-red-400 empty:hidden">{statut === 'erreur' ? messageErreur : ''}</p>

        <p className="text-xs opacity-60">
          Vos données servent uniquement à vous répondre et ne sont transmises à personne.
        </p>
      </div>
    </form>
  )
}
