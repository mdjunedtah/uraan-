'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Review, ReviewFilters, ReviewSort, ReviewSummary } from '@/lib/reviews';
import { emptyBreakdown } from '@/lib/reviews';
import * as localStore from '@/lib/reviewsStore';

const PAGE_SIZE = 8;

export type SubmitPayload = {
  productId: string;
  productName: string;
  rating: number;
  title: string;
  text: string;
  variant?: string;
  images: string[];
  videos: string[];
  anonymous: boolean;
  name: string;
  email: string;
};

export type SubmitOutcome = { ok: true; status: string; message?: string } | { ok: false; error: string };

// Drives the whole product-page Reviews section: paginated/sorted/filtered
// fetch (DB-backed when Supabase is configured, else the localStorage
// fallback), plus submit/vote/report mutations that call the matching API
// route and gracefully degrade to the local store when the DB is off.
export function useProductReviews(productId: string) {
  const [sort, setSort] = useState<ReviewSort>('helpful');
  const [filters, setFiltersState] = useState<ReviewFilters>({});
  const [page, setPage] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<ReviewSummary>({ average: 0, count: 0, breakdown: emptyBreakdown() });
  const [variants, setVariants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingLocalStore, setUsingLocalStore] = useState(false);

  const setFilters = useCallback((next: ReviewFilters) => {
    setFiltersState(next);
    setPage(1);
  }, []);

  const changeSort = useCallback((next: ReviewSort) => {
    setSort(next);
    setPage(1);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ productId, sort, page: String(page), pageSize: String(PAGE_SIZE) });
    if (filters.rating) params.set('rating', String(filters.rating));
    if (filters.variant) params.set('variant', filters.variant);
    if (filters.verifiedOnly) params.set('verified', '1');
    if (filters.withPhotos) params.set('withPhotos', '1');

    try {
      const res = await fetch(`/api/reviews?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.configured) {
        setReviews(data.reviews);
        setTotal(data.total);
        setSummary(data.summary);
        setVariants(data.variants || []);
        setUsingLocalStore(false);
        setLoading(false);
        return;
      }
    } catch {
      /* fall through to local store */
    }

    const local = localStore.getReviewsForProduct(productId, { sort, page, pageSize: PAGE_SIZE, filters });
    setReviews(local.reviews);
    setTotal(local.total);
    setSummary(localStore.getProductReviewSummary(productId));
    setVariants(localStore.getProductVariants(productId));
    setUsingLocalStore(true);
    setLoading(false);
  }, [productId, sort, page, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = useCallback(
    async (payload: SubmitPayload): Promise<SubmitOutcome> => {
      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) return { ok: false, error: data.error || 'Could not submit review.' };
        if (data.configured) {
          await load();
          return { ok: true, status: data.status, message: data.message };
        }
      } catch {
        /* fall through to local store */
      }
      const result = localStore.submitReview(payload);
      if (!result.ok) return result;
      await load();
      return {
        ok: true,
        status: result.status,
        message: result.status === 'approved' ? 'Thank you! Your review is live.' : 'Thank you! Your review is awaiting moderation.',
      };
    },
    [load]
  );

  const vote = useCallback(async (reviewId: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.configured) {
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: data.count } : r)));
        return { alreadyVoted: Boolean(data.alreadyVoted) };
      }
    } catch {
      /* fall through */
    }
    const result = localStore.voteHelpful(reviewId);
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: result.count } : r)));
    return { alreadyVoted: result.alreadyVoted };
  }, []);

  const report = useCallback(async (reviewId: string, reason: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (res.ok && data.configured) return { alreadyReported: Boolean(data.alreadyReported) };
    } catch {
      /* fall through */
    }
    return localStore.reportReview(reviewId);
  }, []);

  return {
    reviews,
    total,
    summary,
    variants,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    sort,
    setSort: changeSort,
    filters,
    setFilters,
    loading,
    usingLocalStore,
    submit,
    vote,
    report,
    reload: load,
  };
}
