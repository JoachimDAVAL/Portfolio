// Entrée sur le site (src/components/Preloader.tsx) : constantes partagées avec le layout racine (composant serveur).

export const INTRO_KEY = 'intro-vue'

// Script inline lancé dans le <head>, avant le premier affichage : pose html[data-intro]
// si l'entrée doit être jouée (pas encore vue dans la session, pas de demande de moins de mouvement).
// Le CSS (globals.css) n'affiche l'overlay que dans ce cas : pas de flash de la page avant l'entrée.
export const INTRO_SCRIPT =
  "try{if(!sessionStorage.getItem('" + INTRO_KEY + "')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)" +
  "document.documentElement.dataset.intro='1'}catch(e){}"
