import type { MetadataRoute } from 'next'

export const dynamic = 'force-static' // requis par l'export statique

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/about', '/projets', '/methode', '/contact'].map((path) => ({ url: `https://www.joachimdaval.dev${path}` }))
}
