// Browser-persisted review store (localStorage) — the fallback used whenever
// Supabase isn't configured, so the whole feature (browse, submit, vote,
// report, moderate) still works end-to-end in a pure front-end demo. Mirrors
// the DB-backed lib/reviewsDb.ts as closely as the browser allows.
import { reviews as seedReviews, type Review as LegacyReview } from '@/data/jewelleryData';
import type { Review, ReviewFilters, ReviewSort, ReviewStatus } from './reviews';
import { sortReviews, summarize, type ReviewSummary } from './reviews';
import { checkReviewForSpam, statusForSpamScore } from './reviewSpam';
import { getCurrentUser } from './auth';
import { getUserOrders } from './userOrders';

export type { Review };

const KEY = 'ogp_reviews';
const VOTES_KEY = 'ogp_review_votes';
const REPORTS_KEY = 'ogp_review_reports';

function toFullReview(r: LegacyReview): Review {
  return {
    id: r.id,
    productId: r.productId || '',
    product: r.product,
    name: r.name,
    city: r.city,
    avatar: r.avatar,
    rating: r.rating,
    title: r.title || '',
    text: r.text,
    variant: r.variant,
    images: r.images || [],
    videos: r.videos || [],
    verified: r.verified,
    status: r.status || 'approved',
    helpfulCount: r.helpfulCount ?? 0,
    reportCount: r.reportCount ?? 0,
    date: r.date,
    createdAt: r.date,
  };
}

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

function readSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore */
  }
}

export function getReviews(): Review[] {
  const stored = read();
  if (stored) return stored;
  const seeded = seedReviews.map(toFullReview);
  write(seeded);
  return seeded;
}

export function getReviewsForProduct(
  productId: string,
  opts: { sort: ReviewSort; page: number; pageSize: number; filters: ReviewFilters }
): { reviews: Review[]; total: number } {
  let list = getReviews().filter((r) => r.productId === productId && r.status === 'approved');
  if (opts.filters.rating) list = list.filter((r) => Math.round(r.rating) === opts.filters.rating);
  if (opts.filters.variant) list = list.filter((r) => r.variant === opts.filters.variant);
  if (opts.filters.verifiedOnly) list = list.filter((r) => r.verified);
  if (opts.filters.withPhotos) list = list.filter((r) => r.images.length > 0 || r.videos.length > 0);
  list = sortReviews(list, opts.sort);
  const total = list.length;
  const start = (opts.page - 1) * opts.pageSize;
  return { reviews: list.slice(start, start + opts.pageSize), total };
}

export function getProductReviewSummary(productId: string): ReviewSummary {
  return summarize(getReviews().filter((r) => r.productId === productId && r.status === 'approved'));
}

export function getProductVariants(productId: string): string[] {
  const set = new Set(
    getReviews()
      .filter((r) => r.productId === productId && r.status === 'approved' && r.variant)
      .map((r) => r.variant as string)
  );
  return Array.from(set);
}

export function setReviewVerified(id: string, verified: boolean): void {
  write(getReviews().map((r) => (r.id === id ? { ...r, verified } : r)));
}

export function deleteReview(id: string): void {
  write(getReviews().filter((r) => r.id !== id));
}

export function moderateReview(
  id: string,
  patch: { status?: ReviewStatus; title?: string; text?: string; rating?: number; verified?: boolean }
): void {
  write(getReviews().map((r) => (r.id === id ? { ...r, ...patch } : r)));
}

// ── Submission (client-only best-effort verified-purchase + dedup check) ──

export type SubmitReviewInput = {
  productId: string;
  productName: string;
  rating: number;
  title: string;
  text: string;
  variant?: string;
  images: string[];
  videos: string[];
  anonymous: boolean;
};

export type SubmitReviewResult =
  | { ok: true; status: ReviewStatus }
  | { ok: false; error: string };

export function submitReview(input: SubmitReviewInput): SubmitReviewResult {
  const user = getCurrentUser();
  if (!user) {
    return { ok: false, error: 'Please sign in to write a review.' };
  }
  if (input.text.trim().length < 10) {
    return { ok: false, error: 'Please write at least 10 characters.' };
  }

  const wanted = input.productName.trim().toLowerCase();
  const purchase = getUserOrders().find((o) => o.items.some((i) => i.name.trim().toLowerCase() === wanted));
  if (!purchase) {
    return { ok: false, error: 'Only customers who purchased this product can leave a review.' };
  }

  const existing = getReviews().find(
    (r) => r.productId === input.productId && r.name.toLowerCase() === user.name.toLowerCase()
  );
  if (existing) {
    return { ok: false, error: 'You have already reviewed this product.' };
  }

  const spam = checkReviewForSpam({ title: input.title, text: input.text, rating: input.rating, name: user.name });
  const status = statusForSpamScore(spam.score);

  const now = new Date();
  const review: Review = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productId: input.productId,
    product: input.productName,
    name: input.anonymous ? 'Anonymous' : user.name,
    anonymous: input.anonymous,
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    title: input.title.trim(),
    text: input.text.trim(),
    variant: input.variant,
    images: input.images.slice(0, 6),
    videos: input.videos.slice(0, 2),
    verified: true,
    status,
    helpfulCount: 0,
    reportCount: 0,
    date: now.toISOString().slice(0, 10),
    createdAt: now.toISOString(),
  };

  write([review, ...getReviews()]);
  return { ok: true, status };
}

// ── Helpful votes / reports (deduped per-browser) ──────────────────────

export function voteHelpful(reviewId: string): { ok: boolean; alreadyVoted: boolean; count: number } {
  const votes = readSet(VOTES_KEY);
  const alreadyVoted = votes.has(reviewId);
  let count = 0;
  const list = getReviews().map((r) => {
    if (r.id !== reviewId) return r;
    count = alreadyVoted ? r.helpfulCount : r.helpfulCount + 1;
    return { ...r, helpfulCount: count };
  });
  if (!alreadyVoted) {
    votes.add(reviewId);
    writeSet(VOTES_KEY, votes);
    write(list);
  }
  return { ok: true, alreadyVoted, count };
}

export function hasVotedHelpful(reviewId: string): boolean {
  return readSet(VOTES_KEY).has(reviewId);
}

export function reportReview(reviewId: string): { ok: boolean; alreadyReported: boolean } {
  const reports = readSet(REPORTS_KEY);
  const alreadyReported = reports.has(reviewId);
  if (!alreadyReported) {
    reports.add(reviewId);
    writeSet(REPORTS_KEY, reports);
    write(
      getReviews().map((r) => {
        if (r.id !== reviewId) return r;
        const reportCount = r.reportCount + 1;
        return { ...r, reportCount, status: reportCount >= 5 ? 'hidden' : r.status };
      })
    );
  }
  return { ok: true, alreadyReported };
}

export function hasReported(reviewId: string): boolean {
  return readSet(REPORTS_KEY).has(reviewId);
}
