// Shared types + pure helpers for the Customer Reviews & Ratings system.
// Used by both the server (API routes, reviewsDb) and the client (components).

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden';

export type ReviewMedia = {
  url: string;
  type: 'image' | 'video';
};

export type Review = {
  id: string;
  productId: string;
  product?: string; // display name of the product at review time (legacy testimonial views)
  name: string;
  city?: string;
  avatar?: string;
  anonymous?: boolean;
  rating: number; // 1-5
  title: string;
  text: string;
  variant?: string;
  images: string[];
  videos: string[];
  verified: boolean;
  status: ReviewStatus;
  helpfulCount: number;
  reportCount: number;
  spamScore?: number;
  date: string; // ISO date
  createdAt?: string;
};

export type RatingBreakdown = Record<1 | 2 | 3 | 4 | 5, number>;

export type ReviewSummary = {
  average: number;
  count: number;
  breakdown: RatingBreakdown;
};

export type ReviewSort = 'helpful' | 'newest' | 'highest' | 'lowest' | 'images';

export const REVIEW_SORTS: ReviewSort[] = ['helpful', 'newest', 'highest', 'lowest', 'images'];

export function isReviewSort(v: unknown): v is ReviewSort {
  return typeof v === 'string' && (REVIEW_SORTS as string[]).includes(v);
}

export type ReviewFilters = {
  rating?: number; // 1-5, filter to exact star rating
  variant?: string;
  verifiedOnly?: boolean;
  withPhotos?: boolean;
};

export function emptyBreakdown(): RatingBreakdown {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
}

export function summarize(reviews: { rating: number }[]): ReviewSummary {
  const breakdown = emptyBreakdown();
  let total = 0;
  for (const r of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    breakdown[star] += 1;
    total += r.rating;
  }
  const count = reviews.length;
  return {
    average: count ? Math.round((total / count) * 10) / 10 : 0,
    count,
    breakdown,
  };
}

export function sortReviews<T extends { rating: number; helpfulCount: number; createdAt?: string; date: string; images: string[] }>(
  list: T[],
  sort: ReviewSort
): T[] {
  const sorted = [...list];
  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => (b.createdAt || b.date).localeCompare(a.createdAt || a.date));
    case 'highest':
      return sorted.sort((a, b) => b.rating - a.rating || b.helpfulCount - a.helpfulCount);
    case 'lowest':
      return sorted.sort((a, b) => a.rating - b.rating || b.helpfulCount - a.helpfulCount);
    case 'images':
      return sorted.sort((a, b) => (b.images.length > 0 ? 1 : 0) - (a.images.length > 0 ? 1 : 0) || b.helpfulCount - a.helpfulCount);
    case 'helpful':
    default:
      return sorted.sort((a, b) => b.helpfulCount - a.helpfulCount || (b.createdAt || b.date).localeCompare(a.createdAt || a.date));
  }
}

export const MAX_REVIEW_IMAGES = 6;
export const MAX_REVIEW_VIDEOS = 2;
export const MIN_REVIEW_TEXT = 10;
