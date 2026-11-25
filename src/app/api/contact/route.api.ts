import { IP_INCONNUE, traiterContact } from '@/lib/envoiContact'

// Clé secrète de test de Cloudflare : accepte le jeton de la clé publique de test (src/lib/turnstile.ts)
const SECRET_TEST = '1x0000000000000000000000000000000AA'

// Dev et Vercel. Absente de l'export statique (voir next.config.ts), où worker/index.ts prend le relais.
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || IP_INCONNUE
  return traiterContact(req, {
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    CONTACT_TO: process.env.CONTACT_TO,
    CONTACT_FROM: process.env.CONTACT_FROM,
    TURNSTILE_SECRET_KEY: process.env.NODE_ENV === 'development' ? SECRET_TEST : process.env.TURNSTILE_SECRET_KEY,
  }, ip)
}
