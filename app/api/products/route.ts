import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { dbGetProducts, dbInsertProduct } from '@/lib/productsDb';
import { isAdminRequest } from '@/lib/adminApi';
import { products as seed, type Product } from '@/data/jewelleryData';
import { checkLengths, MAX_LEN } from '@/lib/security/validate';

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// GET → public product list. Database when configured, else the bundled
// catalogue. (Storefront keeps the bundled catalogue if the DB is empty.)
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, configured: false, products: seed });
  }
  const products = await dbGetProducts();
  return NextResponse.json({ ok: true, configured: true, products: products || [] });
}

// POST → create a product (admin only).
export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, configured: false, error: 'Connect a database (Supabase) to save products.' },
      { status: 400 }
    );
  }

  let body: Partial<Product>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  if (!body.name || !body.price) {
    return NextResponse.json({ ok: false, error: 'Name and price are required.' }, { status: 400 });
  }
  const lengthError = checkLengths({
    Name: { value: String(body.name), max: MAX_LEN.short },
    Slug: { value: String(body.slug ?? ''), max: MAX_LEN.short },
    Category: { value: String(body.category ?? ''), max: MAX_LEN.short },
    Description: { value: String(body.description ?? ''), max: MAX_LEN.text },
    Material: { value: String(body.material ?? ''), max: MAX_LEN.short },
  });
  if (lengthError) return NextResponse.json({ ok: false, error: lengthError }, { status: 400 });

  const product: Product = {
    id: body.id || 'P' + Date.now().toString(36).toUpperCase(),
    name: body.name,
    slug: body.slug ? slugify(body.slug) : slugify(body.name),
    category: body.category || 'necklaces',
    price: Number(body.price),
    oldPrice: body.oldPrice ? Number(body.oldPrice) : undefined,
    image: body.image || '',
    images: body.images || undefined,
    description: body.description || '',
    tag: body.tag || undefined,
    material: body.material || '',
    weight: body.weight || undefined,
    purity: body.purity || undefined,
    inStock: body.inStock ?? true,
    rating: body.rating ?? 5,
    reviewCount: body.reviewCount ?? 0,
  };

  const saved = await dbInsertProduct(product);
  if (!saved) {
    return NextResponse.json({ ok: false, error: 'Could not save product.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, configured: true, product: saved });
}
