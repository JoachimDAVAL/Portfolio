# Portfolio — Joachim Daval

Portfolio personnel développeur fullstack & webmaster.

## Stack

- **Framework** : Next.js 15 (App Router)
- **UI** : React 19, TypeScript, Tailwind CSS v4
- **Fonts** : BD Plakatbau (titres) + Chainprinter (corps) via Adobe Fonts
- **Déploiement** : Vercel

## Structure

```
src/app/
├── layout.tsx              # Layout racine (fonts, metadata)
├── page.tsx                # Page d'entrée — vidéo + bouton ENTER
└── (main)/
    ├── layout.tsx          # Navbar avec underline animé
    ├── about/page.tsx      # Grid 4 sections (hero, à propos, formation, stack)
    ├── projets/page.tsx    # 3 cards avec effet flip au hover
    └── contact/page.tsx    # Vidéo + liens (email, GitHub, LinkedIn, CV)

src/hooks/
└── useTextScramble.ts      # Hook d'effet scramble text (rAF)

public/
├── images/                 # Photos et illustrations
├── videos/                 # Vidéos de fond (WebM + MP4)
└── DAVALjoachim_CV.pdf
```

## Fonctionnalités

- **Text scramble** : effet de déchiffrement sur tous les textes au chargement et au hover
- **Cards projets** : flip recto/verso au hover avec scramble indépendant par face
- **Navbar** : underline qui suit la souris entre les liens
- **Vidéos de fond** : page d'entrée et contact

## Design system

| Élément     | Valeur                             |
| ----------- | ---------------------------------- |
| Fond        | `#141414`                          |
| Texte       | `rgb(226, 206, 202)` (crème)       |
| Font titres | `BD Plakatbau`                     |
| Font corps  | `Chainprinter`                     |
| H1          | `text-7xl md:text-8xl lg:text-9xl` |
| Sous-titres | `text-5xl lg:text-6xl`             |
| H2 sections | `text-4xl md:text-5xl lg:text-6xl` |
| Corps       | `text-sm min-[1700px]:text-base`   |

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).
