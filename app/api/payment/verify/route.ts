import { NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { dbInsertOrder } from '@/lib/ordersDb';

type NewItem = { name?: unknown; quantity?: unknown; price?: unknown; image?: unknown };

// POST { razorpay_order_id, razorpay_payment_id, razorpay_signature, order }
// Verifies the payment signature and, only if genuine, records the order on
// the server marked as paid — so a paid order can never be forged from the
// browser.
export async function POST(request: Request) {
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
  try {
    await dbInsertOrder({
      id,
      customer: String(o.customer || ''),
      email: o.email ? String(o.email) : undefined,
      phone: o.phone ? String(o.phone) : undefined,
      amount: Number(o.amount || 0),
      items: Array.isArray(o.items)
        ? (o.items as NewItem[]).map((i) => ({
            name: String(i.name || ''),
            quantity: Number(i.quantity || 1),
            price: Number(i.price || 0),
            image: i.image ? String(i.image) : undefined,
          }))
        : [],
      payment: o.payment ? `${String(o.payment)} · Paid` : 'Paid',
      status: 'Processing',
      address: o.address ? String(o.address) : undefined,
      paid: true,
      paymentId,
    });
  } catch (err) {
    console.error('[verify] save order failed:', err);
  }

  return NextResponse.json({ ok: true, valid: true, orderId: id });
}
