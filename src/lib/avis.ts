// Avis Google, recopiés à la main depuis la fiche (pas d'API). Jamais d'avis inventé ni réécrit.
// Tant que la liste est vide, la diapo « Ils en parlent » n'existe pas (page d'accueil).
export type Avis = {
  projet: string
  prenom: string | null // null si la personne ne veut pas être nommée : sa fonction est alors affichée
  fonction: string
  texte: string // texte exact et complet
}

export const AVIS: Avis[] = []

export const NOTE = '5,0'
export const FICHE_GOOGLE = '' // adresse de la fiche, à remplir avec le premier avis

export const signature = (a: Avis) => `${a.prenom ?? a.fonction} · ${a.projet}`

// Au-delà de EXTRAIT_MAX : texte exact coupé en fin de phrase si possible (sinon entre deux mots), suivi de […]
const EXTRAIT_MAX = 280
export function extrait(texte: string) {
  if (texte.length <= EXTRAIT_MAX) return texte
  const debut = texte.slice(0, EXTRAIT_MAX)
  const fin = Math.max(debut.lastIndexOf('. '), debut.lastIndexOf('! '), debut.lastIndexOf('? '))
  if (fin >= 60) return texte.slice(0, fin + 1) + ' […]'
  return texte.slice(0, texte.lastIndexOf(' ', EXTRAIT_MAX)).replace(/[ ,;:.]+$/, '') + ' […]'
}
