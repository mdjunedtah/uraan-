// Server-side review persistence (Supabase). Returns null / false when the DB
// is not configured (or the table is missing) so callers fall back to the
// in-browser store. Admin moderates (verify / delete); customers don't write
// here in this build. Mirrors lib/leadsDb.ts.
import { getSupabase } from './supabase';
import type { Review } from './reviewsStore';

type Row = {
  id: string;
  name: string;
  city: string | null;
  avatar: string | null;
  rating: number | null;
  text: string | null;
  product: string | null;
  date: string | null;
  verified: boolean | null;
};

function toReview(r: Row): Review {
  return {
    id: r.id,
    name: r.name,
    city: r.city || '',
    avatar: r.avatar || '/images/model.jpg',
    rating: r.rating ?? 5,
    text: r.text || '',
    product: r.product || undefined,
    date: r.date || '',
    verified: Boolean(r.verified),
  };
}

export async function dbGetReviews(): Promise<Review[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('reviews').select('*').order('created_at', { ascending: true });
  if (error) {
    console.error('[reviewsDb] list:', error.message);
    return null;
  }
  return (data as Row[]).map(toReview);
}

export async function dbSetReviewVerified(id: string, verified: boolean): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from('reviews').update({ verified }).eq('id', id);
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
