import { NextResponse } from 'next/server';
import { dbUpdateCategory, dbDeleteCategory } from '@/lib/categoriesDb';
import { isAdminRequest } from '@/lib/adminApi';
import type { Category } from '@/lib/categories';

// PATCH → edit a category (admin only).
export async function PATCH(request: Request, { params }: { params: { slug: string } }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }
  const patch: Partial<Category> = {};
  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.description !== undefined) patch.description = String(body.description).trim();
  if (body.image !== undefined) patch.image = String(body.image).trim();
  if (body.count !== undefined) patch.count = Number(body.count);

  const ok = await dbUpdateCategory(params.slug, patch);
  if (!ok) return NextResponse.json({ ok: false, error: 'Could not update category.' }, { status: 502 });
  return NextResponse.json({ ok: true });
}

// DELETE → remove a category (admin only).
export async function DELETE(_request: Request, { params }: { params: { slug: string } }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  const ok = await dbDeleteCategory(params.slug);
  if (!ok) return NextResponse.json({ ok: false, error: 'Could not delete category.' }, { status: 502 });
  return NextResponse.json({ ok: true });
}
