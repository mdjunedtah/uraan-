import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { dbGetCoupons, dbUpdateCoupon } from '@/lib/couponsDb';
import { getCoupons as getSeedCoupons } from '@/lib/coupons';
import { MAX_LEN, checkLengths } from '@/lib/security/validate';

function isExpired(validUntil: string): boolean {
  if (!validUntil) return false;
  const d = new Date(validUntil);
  if (Number.isNaN(d.getTime())) return false;
  d.setHours(23, 59, 59, 999);
  return d.getTime() < Date.now();
}

// POST → public coupon lookup for checkout ("Apply Coupon"). Unlike GET
// /api/coupons (admin-only — the full discount config isn't public), this
// only reveals whether ONE specific code the customer already typed is
// valid, and by how much it discounts their current order total.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const code = String(body.code || '').trim().toUpperCase();
  const orderTotal = Number(body.orderTotal || 0);

  if (!code) {
    return NextResponse.json({ ok: false, error: 'Please enter a coupon code.' }, { status: 400 });
  }
  const lengthError = checkLengths({ Code: { value: code, max: MAX_LEN.short } });
  if (lengthError) {
    return NextResponse.json({ ok: false, error: lengthError }, { status: 400 });
  }

  const configured = isSupabaseConfigured();
  const list = configured ? (await dbGetCoupons()) || [] : getSeedCoupons();
  const coupon = list.find((c) => c.code.toUpperCase() === code);

  if (!coupon) {
    return NextResponse.json({ ok: false, error: 'Invalid coupon code.' }, { status: 404 });
  }
  if (!coupon.active) {
    return NextResponse.json({ ok: false, error: 'This coupon is no longer active.' }, { status: 400 });
  }
  if (isExpired(coupon.validUntil)) {
    return NextResponse.json({ ok: false, error: 'This coupon has expired.' }, { status: 400 });
  }
  if (coupon.usageLimit > 0 && coupon.used >= coupon.usageLimit) {
    return NextResponse.json({ ok: false, error: 'This coupon has reached its usage limit.' }, { status: 400 });
  }
  if (orderTotal < coupon.minOrder) {
    return NextResponse.json(
      {
        ok: false,
        error: `Add ₹${(coupon.minOrder - orderTotal).toLocaleString('en-IN')} more to your cart to use this coupon (minimum order ₹${coupon.minOrder.toLocaleString('en-IN')}).`,
      },
      { status: 400 }
    );
  }

  const discount =
    coupon.type === 'percent'
      ? Math.round((orderTotal * coupon.value) / 100)
      : Math.min(coupon.value, orderTotal);

  // Best-effort usage counter — tracks applications, not confirmed orders
  // (a customer who applies then abandons checkout still counts here).
  if (configured) {
    dbUpdateCoupon(coupon.id, { used: coupon.used + 1 }).catch(() => {});
  }

  return NextResponse.json({
    ok: true,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount,
  });
}
