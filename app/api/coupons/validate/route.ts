import { NextResponse } from 'next/server';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import { dbGetCoupons, dbUpdateCoupon } from '@/lib/couponsDb';
import { getCoupons as getSeedCoupons } from '@/lib/coupons';
import { MAX_LEN, checkLengths } from '@/lib/security/validate';

// Best-effort "has this phone/email ordered before?" check for first-order-only
// coupons. Returns false (never blocks) when Supabase isn't configured — we
// can't verify in demo mode, so we don't punish the customer for it.
async function hasPriorOrder(phone: string, email: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  if (!phone && !email) return false;
  const query = sb.from('orders').select('id', { count: 'exact', head: true });
  const { count, error } = phone
    ? await query.eq('phone', phone)
    : await query.ilike('email', email);
  if (error) {
    console.error('[coupons/validate] priorOrder check:', error.message);
    return false;
  }
  return (count || 0) > 0;
}

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

  // Category restriction — only enforced when BOTH the coupon has a category
  // AND the request actually sent cart category info. If checkout didn't send
  // anything usable we skip this check rather than break a working checkout.
  if (coupon.category) {
    const categories: string[] = Array.isArray(body.categories)
      ? (body.categories as unknown[]).map((c) => String(c).toLowerCase())
      : typeof body.category === 'string' && body.category
      ? [String(body.category).toLowerCase()]
      : [];
    if (categories.length > 0 && !categories.includes(coupon.category.toLowerCase())) {
      return NextResponse.json(
        { ok: false, error: `This coupon only applies to ${coupon.category} products.` },
        { status: 400 }
      );
    }
  }

  // First-order-only restriction — requires a phone or email to check against
  // past orders. Skips gracefully (never blocks) when Supabase isn't
  // configured, since we can't verify order history in demo mode.
  if (coupon.firstOrderOnly) {
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    if (!phone && !email) {
      return NextResponse.json(
        { ok: false, error: 'Please enter your phone or email to use this coupon.' },
        { status: 400 }
      );
    }
    if (configured) {
      const alreadyOrdered = await hasPriorOrder(phone, email);
      if (alreadyOrdered) {
        return NextResponse.json(
          { ok: false, error: 'This coupon is valid for first-time customers only.' },
          { status: 400 }
        );
      }
    }
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
