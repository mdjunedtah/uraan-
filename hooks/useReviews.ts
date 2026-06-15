'use client';

import { useEffect, useState } from 'react';
import { reviews as seed, type Review } from '@/data/jewelleryData';

// Module-level cache shared across the testimonials block and the reviews page.
// Mirrors hooks/useProducts.ts.
let cached: Review[] | null = null;
let inflight: Promise<Review[] | null> | null = null;

function loadReviews(): Promise<Review[] | null> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetch('/api/reviews')
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && Array.isArray(d.reviews) && d.reviews.length) {
          cached = d.reviews as Review[];
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

// Live reviews from the database, falling back to the bundled set. Public views
// should show only verified reviews (see `verifiedOnly`).
export function useReviews(): { reviews: Review[]; loaded: boolean } {
  const [reviews, setReviews] = useState<Review[]>(cached || seed);
  const [loaded, setLoaded] = useState(Boolean(cached));

  useEffect(() => {
    let active = true;
    loadReviews().then((list) => {
      if (!active) return;
      if (list && list.length) setReviews(list);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return { reviews, loaded };
}

/** Verified reviews for public display; falls back to all if none are verified. */
export function verifiedOnly(list: Review[]): Review[] {
  const verified = list.filter((r) => r.verified);
  return verified.length ? verified : list;
}
