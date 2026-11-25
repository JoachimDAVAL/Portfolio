// Anti-robot Cloudflare Turnstile, côté navigateur (vérification du jeton côté serveur : envoiContact.ts).
// Le script de Cloudflare n'est chargé qu'à la première interaction avec le formulaire, et la case à cocher
// n'apparaît que si Cloudflare a un doute.

// Clé de test de Cloudflare : accepte tout, sur n'importe quel domaine (dev uniquement)
const CLE_TEST = '1x00000000000000000000AA'
// Clé publique du widget (Cloudflare → Turnstile), visible dans le navigateur
const CLE_SITE = '0x4AAAAAAGS0tsKO91ssxfRz'

const cle = process.env.NODE_ENV === 'development' ? CLE_TEST : CLE_SITE
// Adresse exacte demandée par Cloudflare : ne pas héberger une copie du script
const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const DELAI_MAX_MS = 20000

type Options = {
  sitekey: string
  theme: 'dark'
  language: string
  size: 'flexible' | 'compact'
  appearance: 'interaction-only'
  retry: 'never'
  callback: (jeton: string) => void
  'error-callback': () => boolean
  'timeout-callback': () => void
  'unsupported-callback': () => void
  'before-interactive-callback': () => void
  'after-interactive-callback': () => void
}

declare global {
  interface Window {
    turnstile?: {
      render: (conteneur: HTMLElement, options: Options) => string | undefined
      remove: (id: string) => void
    }
  }
}

let chargement: Promise<void> | null = null

export function chargerTurnstile(): Promise<void> {
  chargement ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      script.remove()
      chargement = null // nouvel essai possible au prochain envoi
      reject(new Error('script'))
    }
    document.head.append(script)
  })
  return chargement
}

// Un widget par envoi : le jeton est toujours frais (valable 5 minutes, une seule fois).
// onInteraction(true) : la case est affichée, le visiteur doit agir.
export async function obtenirJeton(conteneur: HTMLElement, onInteraction: (visible: boolean) => void): Promise<string> {
  let minuteur: ReturnType<typeof setTimeout> | undefined
  let id: string | undefined
  let fini = false
  try {
    return await new Promise<string>((resolve, reject) => {
      const lancerMinuteur = () => {
        clearTimeout(minuteur)
        minuteur = setTimeout(() => reject(new Error('délai')), DELAI_MAX_MS)
      }
      lancerMinuteur()
      chargerTurnstile().then(() => {
        if (fini || !conteneur.isConnected) return reject(new Error('abandon'))
        id = window.turnstile?.render(conteneur, {
          sitekey: cle,
          theme: 'dark',
          language: 'fr',
          size: conteneur.offsetWidth < 300 ? 'compact' : 'flexible', // « flexible » demande 300 px
          appearance: 'interaction-only',
          retry: 'never',
          callback: resolve,
          'error-callback': () => { reject(new Error('refus')); return true },
          'timeout-callback': () => reject(new Error('case non cochée')),
          'unsupported-callback': () => reject(new Error('navigateur')),
          'before-interactive-callback': () => { clearTimeout(minuteur); onInteraction(true) },
          'after-interactive-callback': () => { if (!fini) lancerMinuteur() },
        })
        if (!id) reject(new Error('widget'))
      }).catch(reject)
    })
  } finally {
    fini = true
    clearTimeout(minuteur)
    if (id) window.turnstile?.remove(id)
    onInteraction(false)
  }
}
