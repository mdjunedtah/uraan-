import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { dbVoteHelpful } from '@/lib/reviewsDb';
import { assertSameOrigin } from '@/lib/security/csrf';
import { getClientIp } from '@/lib/security/request';
import { isRateLimited } from '@/lib/security/publicRateLimit';

// POST → mark a review helpful. One vote per visitor (deduped server-side by
// a hash of IP + User-Agent, so re-voting is a no-op rather than an error).
export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'Invalid request origin.' }, { status: 403 });
  }
  const ip = getClientIp(request);
  if (isRateLimited('review-helpful', ip, 60, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'Too many requests.' }, { status: 429 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, configured: false });
  }

  const ua = request.headers.get('user-agent') || '';
  const voterKey = await sha256Hex(`${ip}|${ua}`);
  const result = await dbVoteHelpful(params.id, voterKey);
  if (!result) return NextResponse.json({ ok: false, error: 'Could not record vote.' }, { status: 502 });
  return NextResponse.json({ configured: true, ...result });
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
