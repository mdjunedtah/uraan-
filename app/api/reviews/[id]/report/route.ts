import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { dbReportReview } from '@/lib/reviewsDb';
import { assertSameOrigin } from '@/lib/security/csrf';
import { checkLengths, MAX_LEN } from '@/lib/security/validate';
import { getClientIp } from '@/lib/security/request';
import { isRateLimited } from '@/lib/security/publicRateLimit';

const REASONS = ['spam', 'offensive', 'fake', 'irrelevant', 'other'];

// POST → report a review for admin attention. One report per visitor per
// review; a review auto-hides once it collects 5 reports (lib/reviewsDb.ts).
export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'Invalid request origin.' }, { status: 403 });
  }
  const ip = getClientIp(request);
  if (isRateLimited('review-report', ip, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'Too many requests.' }, { status: 429 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    /* reason is optional */
  }
  const reason = REASONS.includes(String(body.reason)) ? String(body.reason) : 'other';
  const note = String(body.note || '').slice(0, MAX_LEN.short);
  const lengthError = checkLengths({ Note: { value: note, max: MAX_LEN.short } });
  if (lengthError) return NextResponse.json({ ok: false, error: lengthError }, { status: 400 });

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, configured: false });
  }

  const ua = request.headers.get('user-agent') || '';
  const reporterKey = await sha256Hex(`${ip}|${ua}`);
  const result = await dbReportReview(params.id, reporterKey, note ? `${reason}: ${note}` : reason);
  if (!result) return NextResponse.json({ ok: false, error: 'Could not submit report.' }, { status: 502 });
  return NextResponse.json({ configured: true, ...result });
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
