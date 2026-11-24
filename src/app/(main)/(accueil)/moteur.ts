import { FRAME_MS, randomChar } from '@/hooks/useTextScramble'

// Brouillage des diapositives : chaque texte (composant Texte) se forme à l'arrivée et se défait au départ,
// en repartant toujours de son état du moment : on peut enchaîner les diapos sans attendre la fin.
// Pilote le DOM directement (hors état React) : seuls le calque, vide pour React, et des attributs data- changent.

type Etat = { raf: number; affiche: string }
const etats = new WeakMap<Element, Etat>()
const jetons = new WeakMap<Element, number>()

// Même seuil que « lg: » de Tailwind et que accueil.css
export const GRAND = '(min-width: 64rem)'
export const petitEcran = () => !window.matchMedia(GRAND).matches
const moinsDeMouvement = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Durées comptées en « images » de 60 Hz (FRAME_MS) : même vitesse quelle que soit la fréquence de l'écran
export function brouiller(el: HTMLElement, montre: boolean, delay = 0, step = 1): Promise<void> {
  const place = el.querySelector<HTMLElement>('[data-place]')
  const calque = el.querySelector<HTMLElement>('[data-calque]')
  if (!place || !calque) return Promise.resolve()

  const etat = etats.get(el) ?? { raf: 0, affiche: '' }
  etats.set(el, etat)
  cancelAnimationFrame(etat.raf)

  const depart = etat.affiche
  const cible = montre ? place.textContent ?? '' : ''
  const poser = () => {
    etat.affiche = cible
    calque.textContent = ''
    // Texte posé : c'est la vraie copie qui s'affiche (sélection et copier-coller normaux)
    if (montre) el.dataset.pose = ''
    else delete el.dataset.pose
  }
  if (depart === cible || moinsDeMouvement()) {
    poser()
    return Promise.resolve()
  }

  calque.textContent = depart
  delete el.dataset.pose

  const queue = Array.from({ length: Math.max(depart.length, cible.length) }, (_, i) => {
    const start = delay + Math.floor(i / step)
    return { from: depart[i] ?? '', to: cible[i] ?? '', start, end: start + Math.floor(Math.random() * 8) + 6, char: '' }
  })

  return new Promise((fini) => {
    let t0 = -1
    let frame = -1
    const tick = (now: number) => {
      if (t0 < 0) t0 = now
      const f = Math.floor((now - t0) / FRAME_MS)
      if (f !== frame) {
        frame = f
        let out = ''
        let poses = 0
        for (const q of queue) {
          if (frame >= q.end) {
            poses++
            out += q.to
          } else if (frame >= q.start) {
            if (!q.char || Math.random() < 0.28) q.char = randomChar()
            // Les espaces restent : les mots se coupent au même endroit qu'une fois le texte posé
            out += (q.to || q.from) === ' ' ? ' ' : q.char
          } else out += q.from
        }
        if (poses === queue.length) {
          poser()
          fini()
          return
        }
        etat.affiche = out
        calque.textContent = out
        // Fin du texte en invisible : la ligne garde sa largeur finale (texte centré stable pendant le brouillage)
        if (out.length < cible.length) {
          const reste = document.createElement('span')
          reste.style.visibility = 'hidden'
          reste.textContent = cible.slice(out.length)
          calque.appendChild(reste)
        }
      }
      etat.raf = requestAnimationFrame(tick)
    }
    etat.raf = requestAnimationFrame(tick)
  })
}

// [data-off] = avis non affichés · [data-ferme] = panneaux d'accordéon fermés (sous 1024 px seulement)
function textes(zone: HTMLElement) {
  const petit = petitEcran()
  return Array.from(zone.querySelectorAll<HTMLElement>('[data-texte]'))
    .filter((el) => !el.closest('[data-off]') && !(petit && el.closest('[data-ferme]')))
}

export const former = (zone: HTMLElement) =>
  Promise.all(textes(zone).map((el) => brouiller(el, true, Number(el.dataset.delay), Number(el.dataset.step))))

const fondus = (zone: HTMLElement, sortis: boolean) =>
  zone.querySelectorAll('.fade').forEach((f) => f.toggleAttribute('data-sorti', sortis))

// Nouveau jeton : une sortie en cours ne masquera plus la zone à la fin
function renouveler(zone: HTMLElement) {
  const jeton = (jetons.get(zone) ?? 0) + 1
  jetons.set(zone, jeton)
  return jeton
}

// Entrée : chaque texte se forme avec son délai propre
export function montrer(zone: HTMLElement) {
  preparer(zone)
  fondus(zone, false)
  return former(zone)
}

// Rend la zone visible sans former ses textes
export function preparer(zone: HTMLElement) {
  renouveler(zone)
  zone.removeAttribute('data-masquee')
  zone.inert = false
}

// Sortie : plus rapide que l'entrée (pas de délai, longs textes avalés par paquets)
export function cacher(zone: HTMLElement) {
  const jeton = renouveler(zone)
  zone.inert = true
  fondus(zone, true)
  return Promise.all(textes(zone).map((el) => {
    const longueur = el.querySelector('[data-place]')?.textContent?.length ?? 0
    return brouiller(el, false, 0, Math.max(Number(el.dataset.step) * 2, Math.ceil(longueur / 20)))
  })).then(() => {
    if (jetons.get(zone) === jeton) zone.setAttribute('data-masquee', '')
  })
}

// État de départ d'une zone pas encore vue
export function masquer(zone: HTMLElement) {
  renouveler(zone)
  zone.inert = true
  zone.setAttribute('data-masquee', '')
  fondus(zone, true)
}
