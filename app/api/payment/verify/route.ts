import { NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { dbInsertOrder } from '@/lib/ordersDb';
import { checkLengths, isBodyTooLarge, MAX_LEN } from '@/lib/security/validate';
import { notifyAdminNewOrder } from '@/lib/whatsappServer';
import { notify } from '@/lib/notify';

const MAX_ITEMS = 100;

type NewItem = { name?: unknown; quantity?: unknown; price?: unknown; image?: unknown };

// POST { razorpay_order_id, razorpay_payment_id, razorpay_signature, order }
// Verifies the payment signature and, only if genuine, records the order on
// the server marked as paid — so a paid order can never be forged from the
// browser.
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

  const orderId = String(body.razorpay_order_id || '');
  const paymentId = String(body.razorpay_payment_id || '');
  const signature = String(body.razorpay_signature || '');

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ ok: false, valid: false, error: 'Missing fields.' }, { status: 400 });
  }

  const valid = verifyRazorpaySignature(orderId, paymentId, signature);
  if (!valid) {
    return NextResponse.json({ ok: false, valid: false, error: 'Payment verification failed.' }, { status: 400 });
  }

  const id = 'OGP' + Date.now().toString().slice(-8);
  const o = (body.order || {}) as Record<string, unknown>;
  const items = Array.isArray(o.items) ? (o.items as NewItem[]).slice(0, MAX_ITEMS) : [];
  const customer = String(o.customer || '');
  const address = o.address ? String(o.address) : '';
  const lengthError =
    checkLengths({
      Customer: { value: customer, max: MAX_LEN.short },
      Address: { value: address, max: MAX_LEN.text },
    }) || items.map((i) => checkLengths({ 'Item name': { value: String(i.name || ''), max: MAX_LEN.short } })).find(Boolean);
  if (lengthError) {
    return NextResponse.json({ ok: false, valid: false, error: lengthError }, { status: 400 });
  }

  const orderItems = items.map((i) => ({
    name: String(i.name || ''),
    quantity: Number(i.quantity || 1),
    price: Number(i.price || 0),
    image: i.image ? String(i.image) : undefined,
  }));
  const paymentLabel = o.payment ? `${String(o.payment)} · Paid` : 'Paid';
  try {
    await dbInsertOrder({
      id,
      customer,
      email: o.email ? String(o.email) : undefined,
      phone: o.phone ? String(o.phone) : undefined,
      amount: Number(o.amount || 0),
      items: orderItems,
      payment: paymentLabel,
      status: 'Processing',
      address: address || undefined,
      paid: true,
      paymentId,
    });
  } catch (err) {
    console.error('[verify] save order failed:', err);
  }

  // Best-effort admin notification — never fails the payment response.
  notifyAdminNewOrder({
    orderId: id,
    customer,
    amount: Number(o.amount || 0),
    payment: paymentLabel,
    items: orderItems.map((i) => ({ name: i.name, quantity: i.quantity })),
  }).catch(() => {});

  const amount = Number(o.amount || 0);
  notify('new_order', `${customer} placed order ${id} for ₹${amount.toLocaleString('en-IN')}.`, {
    link: `/admin/orders/${id}`,
  }).catch(() => {});
  notify('payment_received', `Payment received for order ${id} (₹${amount.toLocaleString('en-IN')}, online).`, {
    link: `/admin/orders/${id}`,
  }).catch(() => {});

  return NextResponse.json({ ok: true, valid: true, orderId: id });
}
