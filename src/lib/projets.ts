// Projets affichés sur /projets et, pour une sélection, sur la page d'accueil
export type Projet = {
  titre: string
  annee: string
  type: string
  interventions: string[]
  description: string[] // un élément = un paragraphe ; la première phrase s'affiche aussi sur l'accueil
  image: string
  lien?: string
  // Captures pleine page (desktop, même largeur) affichées avec la loupe : Avant / Après ou pages clés
  galerie?: GalerieImage[]
  galerieDefaut?: number // index affiché dans la loupe au repos (0 par défaut)
  // Projet client pas encore livré : pas de lien, visuels floutés, mention "en cours".
  // Les captures réelles attendent dans le vault (01 PROJECTS/Portfolio/images-en-attente/) :
  // à la mise en ligne, les remettre dans public/, retirer ce champ et rétablir lien + galerie.
  enCours?: { miseEnLigne?: string } // ex. { miseEnLigne: 'janvier 2027' }
}

// flou : visuel volontairement illisible (projet en cours) → mention superposée
export type GalerieImage = { label: string; src: string; flou?: boolean }

// Source des textes : vault → 01 PROJECTS/Portfolio/contenus/projets/<projet>.md
export const projets: Projet[] = [
  {
    titre: 'Ylyos',
    annee: '2026',
    type: 'Site vitrine',
    interventions: ['Web Design', 'Web Development', 'WordPress'],
    description: [
      "Ylyos est un cabinet de conseil en finance d'entreprise, spécialisé dans les marchés de capitaux. Son site existant tenait sur une seule page, avec des images manquantes et une navigation quasi absente. Le dirigeant avait besoin d'une vraie vitrine professionnelle.",
      "J'ai étudié les souhaits du client pour établir une charte graphique qui lui correspondait, puis construit les maquettes dans une démarche UX/UI et accessibilité avant de les intégrer sur WordPress pour que mon client garde une autonomie sur ses contenus.",
    ],
    image: '/images/projets/ylyos/card-flou.webp',
    enCours: {},
    galerie: [
      { label: 'Avant', src: '/images/projets/ylyos/avant.webp' },
      { label: 'Après', src: '/images/projets/ylyos/apres-flou.webp', flou: true },
    ],
  },
  {
    titre: 'Bleu Minuit',
    annee: '2025-2026',
    type: 'Site vitrine',
    interventions: ['Web Design', 'Webflow'],
    description: [
      "Ce site a été réalisé dans le cadre de mon alternance dans une startup en hôtellerie. Je ne suis pas parti de rien car il existait un ancien site, mais j'ai réadapté la charte graphique et produit l'ensemble des maquettes (desktop, tablette, mobile). Puis, j'ai réalisé l'implémentation sur Webflow.",
    ],
    image: '/images/projets/bleu-minuit/card.webp',
    lien: 'https://www.bleu-minuit.com/',
    galerie: [
      { label: 'Accueil', src: '/images/projets/bleu-minuit/accueil.webp' },
      { label: 'Domaine La Rive Étoilée', src: '/images/projets/bleu-minuit/lodge-la-rive-etoilee.webp' },
    ],
  },
  {
    titre: 'Boplicity',
    annee: '2026',
    type: 'Site vitrine',
    interventions: ['Web Design', 'Web Development', 'WordPress'],
    description: [
      "Site vitrine pour un festival de jazz. Je l'ai réalisé dans le cadre de mon activité en tant que freelance. Ce projet m'a appris l'importance de la définition des besoins avec son client et qu'un site doit être, avant toute chose, pratique.",
    ],
    image: '/images/projets/boplicity/card.webp',
    lien: 'https://boplicityjazzfestival.fr/',
    galerie: [
      { label: 'Accueil', src: '/images/projets/boplicity/accueil.webp' },
      { label: 'Programmation', src: '/images/projets/boplicity/programmation.webp' },
      { label: 'Artiste — Anne Paceo', src: '/images/projets/boplicity/artiste-anne-paceo.webp' },
    ],
  },
  {
    titre: 'Chalet Nature',
    annee: '2026',
    type: 'Site vitrine (refonte)',
    interventions: ['Web Design', 'Web Development', 'WordPress', 'Automation'],
    description: [
      'Chalet Nature loue un chalet dans les Hautes-Vosges, au bord du lac de Longemer. Son site était assez vieillissant et mal conçu.',
      "Pour ce projet j'ai repensé intégralement l'identité du site, conçu un parcours de réservation directe, puis développé un thème WordPress sur mesure.",
      "Mais je suis allé plus loin qu'un simple site vitrine : j'ai aussi construit toute la mécanique en coulisses. Une base de données centralise désormais les clients et l'historique des réservations, les devis et contrats sont générés et envoyés automatiquement, et le suivi client passe par un CRM. Le propriétaire gère son activité en autonomie, depuis son téléphone, pour quelques euros par mois.",
    ],
    image: '/images/projets/chalet-nature/card.webp',
    lien: 'https://chaletnature.fr/',
    galerie: [
      { label: 'Avant', src: '/images/projets/chalet-nature/avant.webp' },
      { label: 'Après', src: '/images/projets/chalet-nature/accueil.webp' },
      { label: 'Chalet', src: '/images/projets/chalet-nature/chalet.webp' },
      { label: 'Réservation', src: '/images/projets/chalet-nature/reservation.webp' },
    ],
    galerieDefaut: 1,
  },
]

// Texte court des cartes de l'accueil
export const premierePhrase = (projet: Projet) => projet.description[0].match(/^.*?[.!?](?= |$)/)?.[0] ?? projet.description[0]
