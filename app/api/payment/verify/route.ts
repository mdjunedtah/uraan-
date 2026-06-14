import { NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';

// POST { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// → verifies the payment signature so we know the payment is genuine.
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

  return NextResponse.json({ ok: true, valid: true });
}
