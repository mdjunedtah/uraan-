import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { dbGetOrders, dbInsertOrder } from '@/lib/ordersDb';

// GET → list orders from the database (admin).
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, configured: false, orders: [] });
  }
  const orders = await dbGetOrders();
  return NextResponse.json({ ok: true, configured: true, orders: orders || [] });
}

// POST → record a placed order (from checkout).
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const id = String(body.id || '').trim();
  const customer = String(body.customer || '').trim();
  const amount = Number(body.amount || 0);
  const items = Array.isArray(body.items) ? (body.items as NewItem[]) : [];

  if (!id || !customer || !items.length) {
    return NextResponse.json({ ok: false, error: 'Incomplete order.' }, { status: 400 });
  }

  // No DB yet: accept silently so checkout still succeeds.
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, configured: false });
  }

  const saved = await dbInsertOrder({
    id,
    customer,
    email: String(body.email || '').trim() || undefined,
    phone: String(body.phone || '').trim() || undefined,
    amount,
    items: items.map((i) => ({
      name: String(i.name || ''),
      quantity: Number(i.quantity || 1),
      price: Number(i.price || 0),
      image: i.image ? String(i.image) : undefined,
    })),
    payment: String(body.payment || '').trim() || undefined,
    status: String(body.status || 'Processing').trim(),
    address: String(body.address || '').trim() || undefined,
    paid: Boolean(body.paid),
    paymentId: String(body.paymentId || '').trim() || undefined,
  });

  if (!saved) {
    return NextResponse.json({ ok: false, error: 'Could not save order.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, configured: true });
}

type NewItem = { name?: unknown; quantity?: unknown; price?: unknown; image?: unknown };
