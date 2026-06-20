import { NextResponse } from 'next/server';
import { isRazorpayConfigured, createRazorpayOrder, razorpayKeyId } from '@/lib/razorpay';
import { isBodyTooLarge } from '@/lib/security/validate';

// POST { amount } (rupees) → creates a Razorpay order to pay against.
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

  const amount = Number(body.amount || 0);
  if (!amount || amount < 1) {
    return NextResponse.json({ ok: false, error: 'Invalid amount.' }, { status: 400 });
  }

  // No keys yet: tell the client to fall back to a direct (demo) order.
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ ok: true, configured: false });
  }

  const order = await createRazorpayOrder(Math.round(amount * 100), 'rcpt_' + Date.now());
  if (!order) {
    return NextResponse.json({ ok: false, error: 'Could not start payment.' }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    configured: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: razorpayKeyId(),
  });
}
