import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { dbGetOrders, dbInsertOrder } from '@/lib/ordersDb';
import { isAdminRequest } from '@/lib/adminApi';
import { checkLengths, isBodyTooLarge, MAX_LEN } from '@/lib/security/validate';
import { notifyAdminNewOrder } from '@/lib/whatsappServer';
import { normalizePhone } from '@/lib/phone';

const MAX_ITEMS = 100;

// GET → list orders from the database (admin only — contains customer PII).
export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, configured: false, orders: [] });
  }
  const orders = await dbGetOrders();
  return NextResponse.json({ ok: true, configured: true, orders: orders || [] });
}

// POST → record a placed order (from checkout).
export async function POST(request: Request) {
  if (isBodyTooLarge(request)) {
    return NextResponse.json({ ok: false, error: 'Request too large.' }, { status: 413 });
  }
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
  if (items.length > MAX_ITEMS) {
    return NextResponse.json({ ok: false, error: `Orders are limited to ${MAX_ITEMS} items.` }, { status: 400 });
  }

  const email = String(body.email || '').trim();
  const rawPhone = String(body.phone || '').trim();
  const phone = normalizePhone(rawPhone) || rawPhone;
  const payment = String(body.payment || '').trim();
  const status = String(body.status || 'Processing').trim();
  const address = String(body.address || '').trim();
  const paymentId = String(body.paymentId || '').trim();
  const lengthError =
    checkLengths({
      'Order id': { value: id, max: MAX_LEN.short },
      Customer: { value: customer, max: MAX_LEN.short },
      Email: { value: email, max: MAX_LEN.short },
      Address: { value: address, max: MAX_LEN.text },
      Status: { value: status, max: MAX_LEN.short },
    }) ||
    items
      .map((i) => checkLengths({ 'Item name': { value: String(i.name || ''), max: MAX_LEN.short } }))
      .find(Boolean);
  if (lengthError) {
    return NextResponse.json({ ok: false, error: lengthError }, { status: 400 });
  }

  // No DB yet: accept silently so checkout still succeeds.
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, configured: false });
  }

  const saved = await dbInsertOrder({
    id,
    customer,
    email: email || undefined,
    phone: phone || undefined,
    amount,
    items: items.map((i) => ({
      name: String(i.name || ''),
      quantity: Number(i.quantity || 1),
      price: Number(i.price || 0),
      image: i.image ? String(i.image) : undefined,
    })),
    payment: payment || undefined,
    status,
    address: address || undefined,
    paid: Boolean(body.paid),
    paymentId: paymentId || undefined,
  });

  if (!saved) {
    return NextResponse.json({ ok: false, error: 'Could not save order.' }, { status: 502 });
  }

  // Best-effort admin notification — never fails the order response.
  notifyAdminNewOrder({
    orderId: id,
    customer,
    amount,
    payment: payment || 'COD',
    items: items.map((i) => ({ name: String(i.name || ''), quantity: Number(i.quantity || 1) })),
  }).catch(() => {});

  return NextResponse.json({ ok: true, configured: true });
}

type NewItem = { name?: unknown; quantity?: unknown; price?: unknown; image?: unknown };
