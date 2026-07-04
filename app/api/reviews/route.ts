import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  dbGetReviews,
  dbGetProductReviews,
  dbGetProductReviewSummary,
  dbGetProductVariants,
  dbFindVerifiedPurchase,
  dbHasExistingReview,
  dbInsertReview,
  dbAdminListReviews,
} from '@/lib/reviewsDb';
import { dbGetProducts } from '@/lib/productsDb';
import { products as seedProducts } from '@/data/jewelleryData';
import { getProductById } from '@/lib/products';
import { isAdminRequest } from '@/lib/adminApi';
import { assertSameOrigin } from '@/lib/security/csrf';
import { checkLengths, isBodyTooLarge, MAX_LEN } from '@/lib/security/validate';
import { getClientIp } from '@/lib/security/request';
import { isRateLimited } from '@/lib/security/publicRateLimit';
import { checkReviewForSpam, statusForSpamScore } from '@/lib/reviewSpam';
import { isReviewSort, MAX_REVIEW_IMAGES, MAX_REVIEW_VIDEOS, MIN_REVIEW_TEXT, type ReviewSort, type ReviewStatus } from '@/lib/reviews';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

function clampInt(v: string | null, fallback: number, min: number, max: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

// GET → public review list.
//  - ?productId=... : paginated + sorted + filtered reviews for one product,
//    plus the rating summary/breakdown and the list of purchased variants.
//  - no productId    : legacy site-wide testimonial list (admins see every
//    status for moderation; everyone else sees approved only).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (productId) {
    const sortParam = searchParams.get('sort') || 'helpful';
    const sort: ReviewSort = isReviewSort(sortParam) ? sortParam : 'helpful';
    const page = clampInt(searchParams.get('page'), 1, 1, 100000);
    const pageSize = clampInt(searchParams.get('pageSize'), DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
    const rating = searchParams.get('rating') ? clampInt(searchParams.get('rating'), 0, 1, 5) : undefined;
    const variant = searchParams.get('variant') || undefined;
    const verifiedOnly = searchParams.get('verified') === '1';
    const withPhotos = searchParams.get('withPhotos') === '1';

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ ok: true, configured: false });
    }
    const [result, summary, variants] = await Promise.all([
      dbGetProductReviews(productId, { sort, page, pageSize, filters: { rating, variant, verifiedOnly, withPhotos } }),
      dbGetProductReviewSummary(productId),
      dbGetProductVariants(productId),
    ]);
    if (!result || !summary) {
      return NextResponse.json({ ok: true, configured: false });
    }
    return NextResponse.json({
      ok: true,
      configured: true,
      reviews: result.reviews,
      total: result.total,
      page,
      pageSize,
      summary,
      variants: variants || [],
    });
  }

  const admin = await isAdminRequest();

  // Admin moderation queue: paginated + filterable by status/product.
  if (admin && (searchParams.has('status') || searchParams.has('page') || searchParams.has('productFilter'))) {
    const status = (searchParams.get('status') || 'all') as ReviewStatus | 'all';
    const page = clampInt(searchParams.get('page'), 1, 1, 100000);
    const pageSize = clampInt(searchParams.get('pageSize'), 20, 1, MAX_PAGE_SIZE);
    const productFilter = searchParams.get('productFilter') || undefined;
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ ok: true, configured: false, reviews: [], total: 0 });
    }
    const result = await dbAdminListReviews({ status, productId: productFilter, page, pageSize });
    if (!result) return NextResponse.json({ ok: true, configured: false, reviews: [], total: 0 });
    return NextResponse.json({ ok: true, configured: true, reviews: result.reviews, total: result.total, page, pageSize });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, configured: false, reviews: [] });
  }
  const reviews = await dbGetReviews(admin);
  if (reviews === null) {
    return NextResponse.json({ ok: true, configured: false, reviews: [] });
  }
  return NextResponse.json({ ok: true, configured: true, reviews });
}

// POST → submit a new review. Only reachable for a product the submitter has
// a paid order for (Verified Purchase), one review per purchased item, run
// through heuristic spam/profanity screening before publishing.
export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'Invalid request origin.' }, { status: 403 });
  }
  if (isBodyTooLarge(request)) {
    return NextResponse.json({ ok: false, error: 'Request too large.' }, { status: 413 });
  }

  const ip = getClientIp(request);
  if (isRateLimited('review-submit', ip, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'Too many reviews submitted. Please try again later.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const productId = String(body.productId || '').trim();
  const email = String(body.email || '').trim();
  const name = String(body.name || '').trim();
  const anonymous = Boolean(body.anonymous);
  const rating = Number(body.rating);
  const title = String(body.title || '').trim();
  const text = String(body.text || '').trim();
  const variant = body.variant ? String(body.variant).trim() : undefined;
  const images = Array.isArray(body.images) ? (body.images as unknown[]).map(String).slice(0, MAX_REVIEW_IMAGES) : [];
  const videos = Array.isArray(body.videos) ? (body.videos as unknown[]).map(String).slice(0, MAX_REVIEW_VIDEOS) : [];

  if (!productId) return NextResponse.json({ ok: false, error: 'Missing product.' }, { status: 400 });
  if (!name) return NextResponse.json({ ok: false, error: 'Please enter your name.' }, { status: 400 });
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Please sign in with a valid email to submit a review.' }, { status: 400 });
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ ok: false, error: 'Please choose a star rating.' }, { status: 400 });
  }
  if (!title) return NextResponse.json({ ok: false, error: 'Please add a review title.' }, { status: 400 });
  if (text.length < MIN_REVIEW_TEXT) {
    return NextResponse.json({ ok: false, error: `Please write at least ${MIN_REVIEW_TEXT} characters.` }, { status: 400 });
  }
  const lengthError = checkLengths({
    Name: { value: name, max: MAX_LEN.short },
    Title: { value: title, max: MAX_LEN.short },
    Review: { value: text, max: MAX_LEN.text },
    Variant: { value: variant || '', max: MAX_LEN.short },
  });
  if (lengthError) return NextResponse.json({ ok: false, error: lengthError }, { status: 400 });
  if (images.some((u) => u.length > MAX_LEN.url) || videos.some((u) => u.length > MAX_LEN.url)) {
    return NextResponse.json({ ok: false, error: 'Media URL too long.' }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    // No DB yet: the client already ran the equivalent checks against the
    // browser-only fallback store (lib/reviewsStore.ts) and saved locally.
    return NextResponse.json({ ok: true, configured: false });
  }

  const dbProducts = await dbGetProducts();
  const product = getProductById(productId, dbProducts || seedProducts);
  if (!product) {
    return NextResponse.json({ ok: false, error: 'Product not found.' }, { status: 404 });
  }

  const purchase = await dbFindVerifiedPurchase(email, product.name);
  if (!purchase) {
    return NextResponse.json(
      { ok: false, error: 'Only customers who purchased this product can leave a review.' },
      { status: 403 }
    );
  }

  const duplicate = await dbHasExistingReview(productId, purchase.orderId, email);
  if (duplicate) {
    return NextResponse.json({ ok: false, error: 'You have already reviewed this product.' }, { status: 409 });
  }

  const spam = checkReviewForSpam({ title, text, rating, name });
  const status = statusForSpamScore(spam.score);

  const review = await dbInsertReview({
    id: `rv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productId,
    productName: product.name,
    name,
    anonymous,
    email,
    rating: Math.round(rating),
    title,
    text,
    variant,
    images,
    videos,
    verified: true,
    orderId: purchase.orderId,
    status,
    spamScore: spam.score,
  });
  if (!review) {
    return NextResponse.json({ ok: false, error: 'Could not save your review.' }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    configured: true,
    status,
    message:
      status === 'approved'
        ? 'Thank you! Your review is live.'
        : status === 'pending'
          ? 'Thank you! Your review is awaiting moderation.'
          : 'Your review could not be published.',
  });
}
