import { NextResponse } from 'next/server'
import { TYPES_DEMANDE } from '@/lib/contact'

// Envoi du formulaire de contact via l'API Resend (https://resend.com), sans dépendance : simple fetch.
// Variables d'environnement (.env.local en dev, réglages du projet sur Vercel en prod) :
//   RESEND_API_KEY  clé API Resend (obligatoire)
//   CONTACT_TO      adresse qui reçoit les messages (obligatoire)
//   CONTACT_FROM    expéditeur, ex. "Portfolio <contact@joachimdaval.dev>" (domaine à vérifier sur Resend).
//                   Par défaut : onboarding@resend.dev, qui ne peut écrire qu'à l'adresse du compte Resend.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DELAI_MIN_MS = 3000 // un humain met plus de 3 s à remplir le formulaire

// Limite d'envois par IP : 5 messages / 10 min. En mémoire → best effort (remis à zéro à chaque
// démarrage d'instance serverless), suffisant pour freiner un script qui insiste.
const FENETRE_MS = 10 * 60 * 1000
const MAX_ENVOIS = 5
const envois = new Map<string, number[]>()

function limite(ip: string) {
  const now = Date.now()
  const recents = (envois.get(ip) ?? []).filter((t) => now - t < FENETRE_MS)
  if (recents.length >= MAX_ENVOIS) return true
  recents.push(now)
  envois.set(ip, recents)
  return false
}

const texte = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  // Anti-spam silencieux : champ piège rempli ou envoi trop rapide → on répond "OK" sans rien envoyer
  if (texte(body.site) || typeof body.t !== 'number' || body.t < DELAI_MIN_MS) {
    return NextResponse.json({ ok: true })
  }

  const nom = texte(body.nom).replace(/\s+/g, ' ')
  const email = texte(body.email)
  const type = texte(body.type)
  const message = texte(body.message)

  const erreurs: Record<string, string> = {}
  if (!nom || nom.length > 100) erreurs.nom = 'Indiquez votre nom.'
  if (!EMAIL_RE.test(email) || email.length > 200) erreurs.email = 'Adresse e-mail invalide.'
  if (type && !(TYPES_DEMANDE as readonly string[]).includes(type)) erreurs.type = 'Type de demande inconnu.'
  if (message.length < 10) erreurs.message = 'Votre message est un peu court.'
  if (message.length > 5000) erreurs.message = 'Votre message est trop long (5000 caractères max).'
  if (Object.keys(erreurs).length) {
    return NextResponse.json({ error: 'Formulaire incomplet.', erreurs }, { status: 422 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'inconnue'
  if (limite(ip)) {
    return NextResponse.json({ error: "Trop d'envois rapprochés. Réessayez dans quelques minutes." }, { status: 429 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO
  if (!apiKey || !to) {
    console.error('[contact] RESEND_API_KEY ou CONTACT_TO manquant')
    return NextResponse.json({ error: "L'envoi est momentanément indisponible." }, { status: 500 })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || 'Portfolio <onboarding@resend.dev>',
      to: [to],
      reply_to: email, // "Répondre" dans la boîte mail → répond directement à la personne
      subject: `[Portfolio] ${type || 'Contact'} — ${nom}`,
      text: `Nom : ${nom}\nE-mail : ${email}\nType de demande : ${type || '—'}\n\n${message}`,
    }),
  })

  if (!res.ok) {
    console.error('[contact] Resend', res.status, await res.text())
    return NextResponse.json({ error: "L'envoi a échoué. Réessayez ou écrivez-moi directement." }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
