import type { MetadataRoute } from 'next';

const base = 'https://mdjunedtah-uraan.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/checkout', '/profile'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
