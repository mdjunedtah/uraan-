import { NextResponse } from 'next/server';
import { dbUpdateProduct, dbDeleteProduct } from '@/lib/productsDb';
import { isAdminRequest } from '@/lib/adminApi';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { Product } from '@/data/jewelleryData';

// PATCH → update a product (admin only).
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

  const ok = await dbUpdateProduct(params.id, body);
  if (!ok) {
    return NextResponse.json({ ok: false, error: 'Could not update product.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

// DELETE → remove a product (admin only).
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  const ok = await dbDeleteProduct(params.id);
  if (!ok) {
    return NextResponse.json({ ok: false, error: 'Could not delete product.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
