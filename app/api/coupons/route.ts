import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { dbGetCoupons, dbInsertCoupon } from '@/lib/couponsDb';
import { isAdminRequest } from '@/lib/adminApi';
import type { CouponInput, CouponType } from '@/lib/coupons';

// GET → list coupons (admin only — discount config is not public).
export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, configured: false, coupons: [] });
  }
  const coupons = await dbGetCoupons();
  if (coupons === null) {
    return NextResponse.json({ ok: true, configured: false, coupons: [] });
  }
  return NextResponse.json({ ok: true, configured: true, coupons });
}

// POST → create a coupon (admin only).
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
  const code = String(body.code || '').trim();
  if (!code) return NextResponse.json({ ok: false, error: 'Code is required.' }, { status: 400 });

  const input: CouponInput = {
    code,
    type: (String(body.type) === 'flat' ? 'flat' : 'percent') as CouponType,
    value: Number(body.value || 0),
    minOrder: Number(body.minOrder || 0),
    usageLimit: Number(body.usageLimit || 0),
    validUntil: String(body.validUntil || '').trim(),
  };
  const coupon = await dbInsertCoupon(input);
  if (!coupon) return NextResponse.json({ ok: false, error: 'Could not save coupon.' }, { status: 502 });
  return NextResponse.json({ ok: true, configured: true, coupon });
}
