import type { MetadataRoute } from 'next';

const base = 'https://mdjunedtah-uraan.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ['', '/collections', '/about', '/contact', '/reviews', '/login', '/register'];
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/collections' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : path === '/collections' ? 0.9 : 0.6,
  }));
}
