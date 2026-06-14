import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminApi';
import { dbUpdateOrderStatus } from '@/lib/ordersDb';
import type { OrderStatus } from '@/lib/orders';

const STATUSES: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

// PATCH → update an order's status (admin only).
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const status = String(body.status || '') as OrderStatus;
  if (!STATUSES.includes(status)) {
    return NextResponse.json({ ok: false, error: 'Invalid status.' }, { status: 400 });
  }

  const ok = await dbUpdateOrderStatus(params.id, status);
  if (!ok) {
    return NextResponse.json({ ok: false, error: 'Could not update order.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
