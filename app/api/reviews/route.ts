import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { dbGetReviews } from '@/lib/reviewsDb';

// GET → public review list. Database when configured, else the page falls back
// to its bundled browser store.
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, configured: false, reviews: [] });
  }
  const reviews = await dbGetReviews();
  if (reviews === null) {
    return NextResponse.json({ ok: true, configured: false, reviews: [] });
  }
  return NextResponse.json({ ok: true, configured: true, reviews });
}
