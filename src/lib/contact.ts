// Partagé entre le formulaire (client) et la route /api/contact (serveur)
export const TYPES_DEMANDE = ["Portfolio d'artiste", 'Site vitrine', 'Projet sur mesure', 'Autre'] as const
export type TypeDemande = (typeof TYPES_DEMANDE)[number]

export type ChampErreur = 'nom' | 'email' | 'type' | 'message'
