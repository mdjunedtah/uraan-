import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { dbGetCategories, dbInsertCategory } from '@/lib/categoriesDb';
import { isAdminRequest } from '@/lib/adminApi';

// GET → public category list. Database when configured, else the page falls
// back to the bundled list in the browser store.
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, configured: false, categories: [] });
  }
  const categories = await dbGetCategories();
  if (categories === null) {
    // Configured but the table is missing (run supabase/schema.sql) — let the
    // client fall back to its bundled store instead of showing an empty list.
    return NextResponse.json({ ok: true, configured: false, categories: [] });
  }
  return NextResponse.json({ ok: true, configured: true, categories });
}

// POST → create a category (admin only).
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
  const name = String(body.name || '').trim();
  if (!name) return NextResponse.json({ ok: false, error: 'Name is required.' }, { status: 400 });

  const category = await dbInsertCategory({
    name,
    description: String(body.description || '').trim() || undefined,
    image: String(body.image || '').trim() || undefined,
  });
  if (!category) return NextResponse.json({ ok: false, error: 'Could not save category.' }, { status: 502 });
  return NextResponse.json({ ok: true, configured: true, category });
}
