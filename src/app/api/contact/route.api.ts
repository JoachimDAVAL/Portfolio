import { traiterContact } from '@/lib/envoiContact'

// Dev et Vercel. Absente de l'export statique (voir next.config.ts), où worker/index.ts prend le relais.
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'inconnue'
  return traiterContact(req, {
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    CONTACT_TO: process.env.CONTACT_TO,
    CONTACT_FROM: process.env.CONTACT_FROM,
  }, ip)
}
