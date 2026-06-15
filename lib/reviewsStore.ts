// Browser-persisted review moderation store (localStorage), so verify / unverify
// and delete actions in the admin panel survive a refresh without a backend.
// Seeded from the bundled reviews — the same pattern used by lib/leads.ts.
import { reviews as seedReviews, type Review } from '@/data/jewelleryData';

export type { Review };

const KEY = 'ogp_reviews';

function read(): Review[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Review[]) : null;
  } catch {
    return null;
  }
}

function write(list: Review[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function getReviews(): Review[] {
  const stored = read();
  if (stored) return stored;
  write(seedReviews);
  return seedReviews;
}

export function setReviewVerified(id: string, verified: boolean): void {
  write(getReviews().map((r) => (r.id === id ? { ...r, verified } : r)));
}

export function deleteReview(id: string): void {
  write(getReviews().filter((r) => r.id !== id));
}
