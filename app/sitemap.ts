import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { products } from '@/data/jewelleryData';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = ['', '/collections', '/about', '/contact', '/reviews', '/login', '/register'];
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/collections' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : path === '/collections' ? 0.9 : 0.6,
  }));

  // One entry per product so Google can index every product page.
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
