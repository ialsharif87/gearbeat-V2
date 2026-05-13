import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://gearbeat.app'
 
  // Public static routes
  const routes = [
    '',
    '/studios',
    '/marketplace',
    '/services',
    '/tickets',
    '/partner',
    '/gearbeat-certified',
    '/legal',
    '/legal/terms',
    '/legal/privacy',
    '/legal/booking-policy',
    '/legal/marketplace-policy',
    '/legal/ticketing-policy',
    '/about',
    '/contact',
    '/support',
  ]
 
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))
}
