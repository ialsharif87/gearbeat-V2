import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/portal/',
        '/customer/',
        '/login',
        '/signup',
        '/api/',
      ],
    },
    sitemap: 'https://gearbeat.com/sitemap.xml',
  }
}
