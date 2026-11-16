import { redirect } from 'next/navigation'

// Plus de page ENTER (un sas à cliquer avant le site, jugé peu accessible) : l'entrée se fait
// sans clic via le Preloader de (main)/layout.tsx. En attendant que l'accueil soit codé, / mène à /about.
export default function Home() {
  redirect('/about')
}
