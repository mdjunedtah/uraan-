import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { dbGetBanners, dbInsertBanner } from '@/lib/bannersDb';
import { isAdminRequest } from '@/lib/adminApi';
import type { BannerInput, BannerPosition } from '@/lib/banners';

// GET → public banner list. Database when configured, else the page falls back
// to its bundled browser store.
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, configured: false, banners: [] });
  }
  const banners = await dbGetBanners();
  if (banners === null) {
    return NextResponse.json({ ok: true, configured: false, banners: [] });
  }
  return NextResponse.json({ ok: true, configured: true, banners });
}

// POST → create a banner (admin only).
export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, configured: false });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }
  const title = String(body.title || '').trim();
  if (!title) return NextResponse.json({ ok: false, error: 'Title is required.' }, { status: 400 });

  const pos = String(body.position || 'hero');
  const input: BannerInput = {
    title,
    subtitle: String(body.subtitle || '').trim(),
    image: String(body.image || '').trim(),
    ctaText: String(body.ctaText || '').trim(),
    ctaLink: String(body.ctaLink || '').trim(),
    position: (['hero', 'middle', 'footer'].includes(pos) ? pos : 'hero') as BannerPosition,
    active: body.active === undefined ? true : Boolean(body.active),
  };
  const banner = await dbInsertBanner(input);
  if (!banner) return NextResponse.json({ ok: false, error: 'Could not save banner.' }, { status: 502 });
  return NextResponse.json({ ok: true, configured: true, banner });
}
