import type { MetadataRoute } from 'next'

// « / » n'y est pas tant qu'elle redirige vers /about (accueil pas encore codé)
export default function sitemap(): MetadataRoute.Sitemap {
  return ['/about', '/projets', '/methode', '/contact'].map((path) => ({ url: `https://www.joachimdaval.dev${path}` }))
}
