// Server-side banner persistence (Supabase). Returns null / false when the DB
// is not configured (or the table is missing) so callers fall back to the
// in-browser store. Mirrors lib/leadsDb.ts.
import { getSupabase } from './supabase';
import type { Banner, BannerPosition, BannerInput } from './banners';

type Row = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  cta_text: string | null;
  cta_link: string | null;
  position: string;
  active: boolean;
};

function toBanner(r: Row): Banner {
  return {
    id: r.id,
    title: r.title,
    subtitle: r.subtitle || '',
    image: r.image || '',
    ctaText: r.cta_text || '',
    ctaLink: r.cta_link || '',
    position: (['hero', 'middle', 'footer'].includes(r.position) ? r.position : 'hero') as BannerPosition,
    active: r.active,
  };
}

export async function dbGetBanners(): Promise<Banner[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('banners').select('*').order('created_at', { ascending: true });
  if (error) {
    console.error('[bannersDb] list:', error.message);
    return null;
  }
  return (data as Row[]).map(toBanner);
}

export async function dbInsertBanner(input: BannerInput): Promise<Banner | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const id = 'B' + Date.now().toString(36).toUpperCase();
  const { data, error } = await sb
    .from('banners')
    .insert({
      id,
      title: input.title,
      subtitle: input.subtitle || null,
      image: input.image || null,
      cta_text: input.ctaText || null,
      cta_link: input.ctaLink || null,
      position: input.position,
      active: input.active,
    })
    .select()
    .single();
  if (error) {
    console.error('[bannersDb] insert:', error.message);
    return null;
  }
  return toBanner(data as Row);
}

export async function dbUpdateBanner(id: string, patch: Partial<Banner>): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.subtitle !== undefined) row.subtitle = patch.subtitle || null;
  if (patch.image !== undefined) row.image = patch.image || null;
  if (patch.ctaText !== undefined) row.cta_text = patch.ctaText || null;
  if (patch.ctaLink !== undefined) row.cta_link = patch.ctaLink || null;
  if (patch.position !== undefined) row.position = patch.position;
  if (patch.active !== undefined) row.active = patch.active;
  const { error } = await sb.from('banners').update(row).eq('id', id);
  if (error) {
    console.error('[bannersDb] update:', error.message);
    return false;
  }
  return true;
}

export async function dbDeleteBanner(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from('banners').delete().eq('id', id);
  if (error) {
    console.error('[bannersDb] delete:', error.message);
    return false;
  }
  return true;
}
