import { traiterContact, type VariablesContact } from '../src/lib/envoiContact'

// Worker Cloudflare : ne répond qu'à /api/* (voir run_worker_first dans wrangler.jsonc), le reste est servi depuis out/.
const worker = {
  async fetch(req: Request, env: VariablesContact): Promise<Response> {
    if (new URL(req.url).pathname !== '/api/contact') return new Response('Not Found', { status: 404 })
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } })
    return traiterContact(req, env, req.headers.get('CF-Connecting-IP') || 'inconnue')
  },
}

export default worker
