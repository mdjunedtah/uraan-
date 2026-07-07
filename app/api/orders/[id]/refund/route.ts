import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminApi';
import { dbGetOrderById, dbSetOrderRefund, dbInsertTransaction } from '@/lib/ordersDb';
import { isRazorpayConfigured, createRazorpayRefund } from '@/lib/razorpay';
import { currentApiAdmin } from '@/lib/security/guard';
import { logAudit } from '@/lib/audit';
import { checkLengths, MAX_LEN } from '@/lib/security/validate';

// POST → refund an order, fully or partially (admin only). Calls Razorpay's
// refund API when the order was paid online and Razorpay is configured;
// otherwise this simply records a manual/COD refund the admin is logging.
export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const amount = Number(body.amount || 0);
  const reason = String(body.reason || '').trim();
  if (!amount || amount <= 0) {
    return NextResponse.json(
      { ok: false, error: 'Refund amount must be greater than zero.' },
      { status: 400 }
    );
  }
  const lengthError = checkLengths({ Reason: { value: reason, max: MAX_LEN.text } });
  if (lengthError) {
    return NextResponse.json({ ok: false, error: lengthError }, { status: 400 });
  }

  const order = await dbGetOrderById(params.id);
  if (!order) {
    return NextResponse.json({ ok: false, error: 'Order not found.' }, { status: 404 });
  }

  const alreadyRefunded = order.refundAmount || 0;
  const totalRefunded = alreadyRefunded + amount;
  if (totalRefunded > order.amount) {
    return NextResponse.json(
      { ok: false, error: 'Refund amount exceeds the order total.' },
      { status: 400 }
    );
  }

  let gateway: string | undefined;
  let gatewayResponse: Record<string, unknown> = { manual: true, reason: reason || undefined };

  if (order.paymentId && isRazorpayConfigured()) {
    gateway = 'razorpay';
    const result = await createRazorpayRefund(order.paymentId, Math.round(amount * 100));
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error || 'Refund failed.' },
        { status: 502 }
      );
    }
    gatewayResponse = { razorpayRefundId: result.id };
  }

  const refundStatus: 'partial' | 'full' = totalRefunded >= order.amount ? 'full' : 'partial';

  const saved = await dbSetOrderRefund(params.id, totalRefunded, refundStatus);
  if (!saved) {
    return NextResponse.json({ ok: false, error: 'Could not record refund.' }, { status: 502 });
  }

  await dbInsertTransaction({
    orderId: params.id,
    type: 'refund',
    gateway,
    gatewayResponse,
    amount,
    status: 'success',
  });

  const admin = await currentApiAdmin();
  await logAudit({
    actorEmail: admin?.email,
    actorRole: admin?.role,
    action: 'order_refunded',
    target: params.id,
    metadata: { amount, totalRefunded, refundStatus, reason: reason || undefined },
  });

  return NextResponse.json({ ok: true, refundStatus, refundAmount: totalRefunded });
}
