// Server-side product catalogue persistence (Supabase). Returns null / false
// when the DB is not configured so callers fall back to the bundled catalogue.
import { getSupabase } from './supabase';
import { products as seedProducts, type Product } from '@/data/jewelleryData';

type Row = {
  id: string;
  name: string;
  slug: string | null;
  category: string | null;
  price: number;
  old_price: number | null;
  image: string | null;
  images: string[] | null;
  description: string | null;
  material: string | null;
  weight: string | null;
  purity: string | null;
  tag: string | null;
  in_stock: boolean;
  rating: number | null;
  review_count: number | null;
};

function toProduct(r: Row): Product {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug || r.id,
    category: r.category || '',
    price: r.price,
    oldPrice: r.old_price ?? undefined,
    image: r.image || '',
    images: r.images && r.images.length ? r.images : undefined,
    description: r.description || '',
    tag: (r.tag as Product['tag']) || undefined,
    material: r.material || '',
    weight: r.weight || undefined,
    purity: r.purity || undefined,
    inStock: r.in_stock,
    rating: r.rating ?? 5,
    reviewCount: r.review_count ?? 0,
  };
}

function fullRow(p: Product) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug || p.id,
    category: p.category || null,
    price: p.price,
    old_price: p.oldPrice || null,
    image: p.image || null,
    images: p.images || [],
    description: p.description || null,
    material: p.material || null,
    weight: p.weight || null,
    purity: p.purity || null,
    tag: p.tag || null,
    in_stock: p.inStock,
    rating: p.rating ?? 5,
    review_count: p.reviewCount ?? 0,
  };
}

export async function dbGetProducts(): Promise<Product[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('products').select('*').order('created_at', { ascending: true });
  if (error) {
    console.error('[productsDb] list:', error.message);
    return null;
  }
  return (data as Row[]).map(toProduct);
}

export async function dbInsertProduct(p: Product): Promise<Product | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('products').insert(fullRow(p)).select().single();
  if (error) {
    console.error('[productsDb] insert:', error.message);
    return null;
  }
  return toProduct(data as Row);
}

// Only the provided fields are updated, so rating / reviews / images set
// elsewhere are preserved when the admin form doesn't include them.
export async function dbUpdateProduct(id: string, p: Partial<Product>): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const patch: Record<string, unknown> = {};
  if (p.name !== undefined) patch.name = p.name;
  if (p.slug !== undefined) patch.slug = p.slug;
  if (p.category !== undefined) patch.category = p.category;
  if (p.price !== undefined) patch.price = p.price;
  if (p.oldPrice !== undefined) patch.old_price = p.oldPrice || null;
  if (p.image !== undefined) patch.image = p.image;
  if (p.images !== undefined) patch.images = p.images;
  if (p.description !== undefined) patch.description = p.description;
  if (p.material !== undefined) patch.material = p.material;
  if (p.weight !== undefined) patch.weight = p.weight || null;
  if (p.purity !== undefined) patch.purity = p.purity || null;
  if (p.tag !== undefined) patch.tag = p.tag || null;
  if (p.inStock !== undefined) patch.in_stock = p.inStock;
  if (p.rating !== undefined) patch.rating = p.rating;
  if (p.reviewCount !== undefined) patch.review_count = p.reviewCount;

  const { error } = await sb.from('products').update(patch).eq('id', id);
  if (error) {
    console.error('[productsDb] update:', error.message);
    return false;
  }
  return true;
}

export async function dbDeleteProduct(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from('products').delete().eq('id', id);
  if (error) {
    console.error('[productsDb] delete:', error.message);
    return false;
  }
  return true;
}

export async function dbCountProducts(): Promise<number | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { count, error } = await sb.from('products').select('*', { count: 'exact', head: true });
  if (error) {
    console.error('[productsDb] count:', error.message);
    return null;
  }
  return count ?? 0;
}

// One-click import of the bundled catalogue into the database.
export async function dbImportSeed(): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;
  const rows = seedProducts.map(fullRow);
  const { error } = await sb.from('products').upsert(rows, { onConflict: 'id' });
  if (error) {
    console.error('[productsDb] import:', error.message);
    return 0;
  }
  return rows.length;
}
