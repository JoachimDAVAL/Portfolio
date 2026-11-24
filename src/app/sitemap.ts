import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/about', '/projets', '/methode', '/contact'].map((path) => ({ url: `https://www.joachimdaval.dev${path}` }))
}
