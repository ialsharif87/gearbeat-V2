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
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gearbeat.app'}/sitemap.xml`,
  }
}
