'use client';

import { useEffect, useState } from 'react';
import { seedBanners, type Banner } from '@/lib/banners';

// Module-level cache so the homepage promo section shares a single
// /api/banners request. Mirrors hooks/useProducts.ts.
let cached: Banner[] | null = null;
let inflight: Promise<Banner[] | null> | null = null;

function loadBanners(): Promise<Banner[] | null> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetch('/api/banners')
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && Array.isArray(d.banners) && d.banners.length) {
          cached = d.banners as Banner[];
          return cached;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

// Live banners from the database, falling back to the bundled set.
export function useBanners(): { banners: Banner[]; loaded: boolean } {
  const [banners, setBanners] = useState<Banner[]>(cached || seedBanners);
  const [loaded, setLoaded] = useState(Boolean(cached));

  useEffect(() => {
    let active = true;
    loadBanners().then((list) => {
      if (!active) return;
      if (list && list.length) setBanners(list);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return { banners, loaded };
}
