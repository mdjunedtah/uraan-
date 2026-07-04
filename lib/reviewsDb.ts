// Server-side review persistence (Supabase). Every export returns null/false
// on missing configuration or DB error so callers can fall back to the
// in-browser store (lib/reviewsStore.ts), mirroring the rest of this project.
import { getSupabase } from './supabase';
import type { Review, ReviewFilters, ReviewSort, ReviewStatus, ReviewSummary } from './reviews';
import { sortReviews, summarize } from './reviews';

type Row = {
  id: string;
  product_id: string | null;
  name: string;
  city: string | null;
  avatar: string | null;
  anonymous: boolean | null;
  rating: number | null;
  title: string | null;
  text: string | null;
  variant: string | null;
  images: string[] | null;
  videos: string[] | null;
  product: string | null;
  date: string | null;
  verified: boolean | null;
  status: string | null;
  helpful_count: number | null;
  report_count: number | null;
  order_id: string | null;
  email: string | null;
  spam_score: number | null;
  moderation_note: string | null;
  created_at: string;
  updated_at: string | null;
};

const STATUSES: ReviewStatus[] = ['pending', 'approved', 'rejected', 'hidden'];

function normStatus(s: string | null): ReviewStatus {
  return (STATUSES.includes(s as ReviewStatus) ? s : 'approved') as ReviewStatus;
}

function toReview(r: Row): Review {
  return {
    id: r.id,
    productId: r.product_id || '',
    product: r.product || undefined,
    name: r.anonymous ? 'Anonymous' : r.name,
    city: r.city || '',
    avatar: r.avatar || '/images/model.jpg',
    anonymous: Boolean(r.anonymous),
    rating: r.rating ?? 5,
    title: r.title || '',
    text: r.text || '',
    variant: r.variant || undefined,
    images: r.images || [],
    videos: r.videos || [],
    verified: Boolean(r.verified),
    status: normStatus(r.status),
    helpfulCount: r.helpful_count ?? 0,
    reportCount: r.report_count ?? 0,
    spamScore: r.spam_score ?? undefined,
    date: r.date || (r.created_at ? r.created_at.slice(0, 10) : ''),
    createdAt: r.created_at,
  };
}

// ── Legacy (site-wide testimonials: homepage + /reviews + admin panel) ────

export async function dbGetReviews(includeAll = false): Promise<Review[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  let q = sb.from('reviews').select('*').order('created_at', { ascending: true });
  if (!includeAll) q = q.eq('status', 'approved');
  const { data, error } = await q;
  if (error) {
    console.error('[reviewsDb] list:', error.message);
    return null;
  }
  return (data as Row[]).map(toReview);
}

export async function dbSetReviewVerified(id: string, verified: boolean): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from('reviews').update({ verified, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) {
    console.error('[reviewsDb] verify:', error.message);
    return false;
  }
  return true;
}

export async function dbDeleteReview(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from('reviews').delete().eq('id', id);
  if (error) {
    console.error('[reviewsDb] delete:', error.message);
    return false;
  }
  return true;
}

// ── Product page: fetch + summary ──────────────────────────────────────

export type ProductReviewQuery = {
  sort: ReviewSort;
  page: number;
  pageSize: number;
  filters: ReviewFilters;
};

const MAX_FETCH = 2000; // cap for the in-memory sort/paginate pass below

export async function dbGetProductReviews(
  productId: string,
  query: ProductReviewQuery
): Promise<{ reviews: Review[]; total: number } | null> {
  const sb = getSupabase();
  if (!sb) return null;

  let q = sb.from('reviews').select('*').eq('product_id', productId).eq('status', 'approved');
  if (query.filters.rating) q = q.eq('rating', query.filters.rating);
  if (query.filters.variant) q = q.eq('variant', query.filters.variant);
  if (query.filters.verifiedOnly) q = q.eq('verified', true);
  q = q.limit(MAX_FETCH);

  const { data, error } = await q;
  if (error) {
    console.error('[reviewsDb] productReviews:', error.message);
    return null;
  }

  let reviews = (data as Row[]).map(toReview);
  if (query.filters.withPhotos) reviews = reviews.filter((r) => r.images.length > 0 || r.videos.length > 0);
  reviews = sortReviews(reviews, query.sort);

  const total = reviews.length;
  const start = (query.page - 1) * query.pageSize;
  const page = reviews.slice(start, start + query.pageSize);
  return { reviews: page, total };
}

export async function dbGetProductReviewSummary(productId: string): Promise<ReviewSummary | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .limit(MAX_FETCH);
  if (error) {
    console.error('[reviewsDb] summary:', error.message);
    return null;
  }
  return summarize((data as { rating: number }[]) || []);
}

export async function dbGetProductVariants(productId: string): Promise<string[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from('reviews')
    .select('variant')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .not('variant', 'is', null);
  if (error) return null;
  const set = new Set((data as { variant: string | null }[]).map((r) => r.variant).filter(Boolean) as string[]);
  return Array.from(set);
}

// ── Verified purchase + duplicate prevention ───────────────────────────

// Looks for a paid order placed with this email that contains an item whose
// name matches the product. Order items only store item name (not id), so
// the caller passes the product's display name to match against.
export async function dbFindVerifiedPurchase(
  email: string,
  productName: string
): Promise<{ orderId: string; variant?: string } | null> {
  const sb = getSupabase();
  if (!sb || !email || !productName) return null;
  const { data, error } = await sb
    .from('orders')
    .select('id, items, paid')
    .ilike('email', email.trim())
    .eq('paid', true)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[reviewsDb] verifiedPurchase:', error.message);
    return null;
  }
  const wanted = productName.trim().toLowerCase();
  for (const order of data as { id: string; items: { name: string }[] }[]) {
    const items = Array.isArray(order.items) ? order.items : [];
    if (items.some((i) => String(i?.name || '').trim().toLowerCase() === wanted)) {
      return { orderId: order.id };
    }
  }
  return null;
}

export async function dbHasExistingReview(productId: string, orderId?: string, email?: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  if (orderId) {
    const { data, error } = await sb
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('order_id', orderId)
      .limit(1);
    if (error) return false;
    if (data && data.length) return true;
  }
  if (email) {
    const { data, error } = await sb
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .ilike('email', email.trim())
      .limit(1);
    if (error) return false;
    if (data && data.length) return true;
  }
  return false;
}

// ── Submission ──────────────────────────────────────────────────────────

export type NewReviewInput = {
  id: string;
  productId: string;
  productName: string;
  name: string;
  anonymous: boolean;
  email: string;
  rating: number;
  title: string;
  text: string;
  variant?: string;
  images: string[];
  videos: string[];
  verified: boolean;
  orderId?: string;
  status: ReviewStatus;
  spamScore: number;
};

export async function dbInsertReview(input: NewReviewInput): Promise<Review | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const now = new Date().toISOString();
  const { data, error } = await sb
    .from('reviews')
    .insert({
      id: input.id,
      product_id: input.productId,
      name: input.name,
      anonymous: input.anonymous,
      city: null,
      avatar: null,
      rating: input.rating,
      title: input.title,
      text: input.text,
      variant: input.variant || null,
      images: input.images,
      videos: input.videos,
      product: input.productName,
      date: now.slice(0, 10),
      verified: input.verified,
      status: input.status,
      helpful_count: 0,
      report_count: 0,
      order_id: input.orderId || null,
      email: input.email || null,
      spam_score: input.spamScore,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();
  if (error) {
    console.error('[reviewsDb] insert:', error.message);
    return null;
  }
  return toReview(data as Row);
}

// ── Helpful votes ───────────────────────────────────────────────────────

export async function dbVoteHelpful(reviewId: string, voterKey: string): Promise<{ ok: boolean; alreadyVoted: boolean; count: number } | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { error: insertError } = await sb.from('review_votes').insert({ review_id: reviewId, voter_key: voterKey });
  const alreadyVoted = Boolean(insertError && insertError.code === '23505');
  if (insertError && !alreadyVoted) {
    console.error('[reviewsDb] vote:', insertError.message);
    return null;
  }
  if (!alreadyVoted) {
    const { error: rpcError } = await sb.rpc('increment_review_helpful', { review_id_in: reviewId });
    if (rpcError) console.error('[reviewsDb] increment_review_helpful:', rpcError.message);
  }
  const { data: row } = await sb.from('reviews').select('helpful_count').eq('id', reviewId).maybeSingle();
  return { ok: true, alreadyVoted, count: row?.helpful_count ?? 0 };
}

// ── Reports ─────────────────────────────────────────────────────────────

export async function dbReportReview(reviewId: string, reporterKey: string, reason: string): Promise<{ ok: boolean; alreadyReported: boolean } | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { error: insertError } = await sb.from('review_reports').insert({ review_id: reviewId, reporter_key: reporterKey, reason });
  const alreadyReported = Boolean(insertError && insertError.code === '23505');
  if (insertError && !alreadyReported) {
    console.error('[reviewsDb] report:', insertError.message);
    return null;
  }
  if (!alreadyReported) {
    const { data: current } = await sb.from('reviews').select('report_count').eq('id', reviewId).maybeSingle();
    const next = (current?.report_count ?? 0) + 1;
    // 5+ reports auto-hides the review pending admin review, without deleting it.
    const patch: Record<string, unknown> = { report_count: next };
    if (next >= 5) patch.status = 'hidden';
    await sb.from('reviews').update(patch).eq('id', reviewId);
  }
  return { ok: true, alreadyReported };
}

// ── Admin moderation ────────────────────────────────────────────────────

export type AdminReviewQuery = {
  status?: ReviewStatus | 'all';
  productId?: string;
  page: number;
  pageSize: number;
};

export async function dbAdminListReviews(query: AdminReviewQuery): Promise<{ reviews: Review[]; total: number } | null> {
  const sb = getSupabase();
  if (!sb) return null;
  let q = sb.from('reviews').select('*', { count: 'exact' }).order('created_at', { ascending: false });
  if (query.status && query.status !== 'all') q = q.eq('status', query.status);
  if (query.productId) q = q.eq('product_id', query.productId);
  const start = (query.page - 1) * query.pageSize;
  q = q.range(start, start + query.pageSize - 1);
  const { data, error, count } = await q;
  if (error) {
    console.error('[reviewsDb] adminList:', error.message);
    return null;
  }
  return { reviews: (data as Row[]).map(toReview), total: count ?? 0 };
}

export type ReviewModerationPatch = {
  status?: ReviewStatus;
  title?: string;
  text?: string;
  rating?: number;
  moderationNote?: string;
};

export async function dbModerateReview(id: string, patch: ReviewModerationPatch): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.text !== undefined) row.text = patch.text;
  if (patch.rating !== undefined) row.rating = patch.rating;
  if (patch.moderationNote !== undefined) row.moderation_note = patch.moderationNote;
  const { error } = await sb.from('reviews').update(row).eq('id', id);
  if (error) {
    console.error('[reviewsDb] moderate:', error.message);
    return false;
  }
  return true;
}
