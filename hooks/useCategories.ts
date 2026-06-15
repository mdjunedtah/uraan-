'use client';

import { useEffect, useState } from 'react';
import { categories as seed, type Category } from '@/data/jewelleryData';

// Module-level cache so every category-consuming component shares a single
// /api/categories request. Mirrors hooks/useProducts.ts.
let cached: Category[] | null = null;
let inflight: Promise<Category[] | null> | null = null;

function loadCategories(): Promise<Category[] | null> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && Array.isArray(d.categories) && d.categories.length) {
          cached = d.categories as Category[];
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

// Live categories from the database, falling back to the bundled list so the
// first paint (and SEO) always has content and the storefront never goes blank.
export function useCategories(): { categories: Category[]; loaded: boolean } {
  const [categories, setCategories] = useState<Category[]>(cached || seed);
  const [loaded, setLoaded] = useState(Boolean(cached));

  useEffect(() => {
    let active = true;
    loadCategories().then((list) => {
      if (!active) return;
      if (list && list.length) setCategories(list);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return { categories, loaded };
}
