import { TYPES_DEMANDE } from './contact'

// Traitement du formulaire de contact, partagé entre la route Next (dev, Vercel) et le Worker Cloudflare (worker/index.ts).
// Envoi du formulaire de contact via l'API transactionnelle Brevo (https://www.brevo.com, données hébergées dans l'UE),
// sans dépendance : simple fetch.
// Variables d'environnement (.env.local en dev, réglages de l'hébergeur en prod) — toutes obligatoires :
//   BREVO_API_KEY  clé API Brevo (SMTP & API → Clés API)
//   CONTACT_TO     adresse qui reçoit les messages
//   CONTACT_FROM   adresse expéditrice, déclarée comme expéditeur dans Brevo, ex. contact@joachimdaval.dev
//                  (domaine authentifié dans Brevo via DNS → meilleure délivrabilité)
export type VariablesContact = {
  BREVO_API_KEY?: string
  CONTACT_TO?: string
  CONTACT_FROM?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DELAI_MIN_MS = 3000 // un humain met plus de 3 s à remplir le formulaire

// Limite d'envois par IP : 5 messages / 10 min. En mémoire → best effort (remis à zéro à chaque
// démarrage d'instance), suffisant pour freiner un script qui insiste.
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

export async function traiterContact(req: Request, variables: VariablesContact, ip: string): Promise<Response> {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  // Anti-spam silencieux : champ piège rempli ou envoi trop rapide → on répond "OK" sans rien envoyer
  if (texte(body.site) || typeof body.t !== 'number' || body.t < DELAI_MIN_MS) {
    return Response.json({ ok: true })
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
    return Response.json({ error: 'Formulaire incomplet.', erreurs }, { status: 422 })
  }

  if (limite(ip)) {
    return Response.json({ error: "Trop d'envois rapprochés. Réessayez dans quelques minutes." }, { status: 429 })
  }

  const { BREVO_API_KEY: apiKey, CONTACT_TO: to, CONTACT_FROM: from } = variables
  if (!apiKey || !to || !from) {
    // Noms seulement, jamais les valeurs
    const absentes = Object.entries({ BREVO_API_KEY: apiKey, CONTACT_TO: to, CONTACT_FROM: from })
      .filter(([, valeur]) => !valeur)
      .map(([nomVariable]) => nomVariable)
    console.error('[contact] Variables manquantes :', absentes.join(', '))
    return Response.json({ error: "L'envoi est momentanément indisponible." }, { status: 500 })
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Portfolio', email: from },
      to: [{ email: to }],
      replyTo: { email, name: nom }, // "Répondre" dans la boîte mail → répond directement à la personne
      subject: `[Portfolio] ${type || 'Contact'} — ${nom}`,
      textContent: `Nom : ${nom}\nE-mail : ${email}\nType de demande : ${type || '—'}\n\n${message}`,
    }),
  })

  if (!res.ok) {
    console.error('[contact] Brevo', res.status, await res.text())
    return Response.json({ error: "L'envoi a échoué. Réessayez ou écrivez-moi directement." }, { status: 502 })
  }

  return Response.json({ ok: true })
}
