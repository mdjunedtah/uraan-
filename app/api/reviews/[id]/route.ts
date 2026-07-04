import { NextResponse } from 'next/server';
import { dbSetReviewVerified, dbDeleteReview, dbModerateReview } from '@/lib/reviewsDb';
import { isAdminRequest } from '@/lib/adminApi';
import { assertSameOrigin } from '@/lib/security/csrf';
import { checkLengths, MAX_LEN } from '@/lib/security/validate';
import type { ReviewStatus } from '@/lib/reviews';

const STATUSES: ReviewStatus[] = ['pending', 'approved', 'rejected', 'hidden'];

// PATCH → admin moderation: verify (purchase badge), change status
// (approve/reject/hide), or edit the title/text/rating.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'Invalid request origin.' }, { status: 403 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  if (body.verified !== undefined && Object.keys(body).length === 1) {
    const ok = await dbSetReviewVerified(params.id, Boolean(body.verified));
    if (!ok) return NextResponse.json({ ok: false, error: 'Could not update review.' }, { status: 502 });
    return NextResponse.json({ ok: true });
  }

  const patch: { status?: ReviewStatus; title?: string; text?: string; rating?: number; moderationNote?: string } = {};
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status as ReviewStatus)) {
      return NextResponse.json({ ok: false, error: 'Invalid status.' }, { status: 400 });
    }
    patch.status = body.status as ReviewStatus;
  }
  if (body.title !== undefined) patch.title = String(body.title).trim();
  if (body.text !== undefined) patch.text = String(body.text).trim();
  if (body.rating !== undefined) {
    const rating = Number(body.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ ok: false, error: 'Invalid rating.' }, { status: 400 });
    }
    patch.rating = Math.round(rating);
  }
  if (body.moderationNote !== undefined) patch.moderationNote = String(body.moderationNote).trim();
  if (body.verified !== undefined) await dbSetReviewVerified(params.id, Boolean(body.verified));

  const lengthError = checkLengths({
    Title: { value: patch.title ?? '', max: MAX_LEN.short },
    Review: { value: patch.text ?? '', max: MAX_LEN.text },
    'Moderation note': { value: patch.moderationNote ?? '', max: MAX_LEN.text },
  });
  if (lengthError) return NextResponse.json({ ok: false, error: lengthError }, { status: 400 });

  const ok = await dbModerateReview(params.id, patch);
  if (!ok) return NextResponse.json({ ok: false, error: 'Could not update review.' }, { status: 502 });
  return NextResponse.json({ ok: true });
}

// DELETE → remove a review (admin only).
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'Invalid request origin.' }, { status: 403 });
  }
  const ok = await dbDeleteReview(params.id);
  if (!ok) return NextResponse.json({ ok: false, error: 'Could not delete review.' }, { status: 502 });
  return NextResponse.json({ ok: true });
}
