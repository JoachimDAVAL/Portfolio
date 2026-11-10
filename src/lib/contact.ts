// Partagé entre le formulaire (client) et la route /api/contact (serveur)
export const TYPES_DEMANDE = ['Mission freelance', "Offre d'emploi", 'Collaboration', 'Autre'] as const
export type TypeDemande = (typeof TYPES_DEMANDE)[number]

export type ChampErreur = 'nom' | 'email' | 'type' | 'message'
