// Server-side order persistence (Supabase). Returns null / false when the DB is
// not configured so callers can fall back to the bundled demo orders.
import { getSupabase } from './supabase';
import type { Order, OrderStatus } from './orders';

const STATUSES: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function normStatus(s: string): OrderStatus {
  return (STATUSES.includes(s as OrderStatus) ? s : 'Processing') as OrderStatus;
}

type Row = {
  id: string;
  customer: string;
  email: string | null;
  phone: string | null;
  amount: number;
  item_count: number;
  status: string;
  payment: string | null;
  address: string | null;
  created_at: string;
};

function toOrder(r: Row): Order {
  return {
    id: r.id,
    customerId: '',
    customer: r.customer,
    email: r.email || '',
    phone: r.phone || '',
    amount: r.amount,
    items: r.item_count,
    status: normStatus(r.status),
    payment: r.payment || '',
    date: new Date(r.created_at).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    address: r.address || undefined,
  };
}

export async function dbGetOrders(): Promise<Order[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('orders').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('[ordersDb] list:', error.message);
    return null;
  }
  return (data as Row[]).map(toOrder);
}

export interface NewOrderInput {
  id: string;
  customer: string;
  email?: string;
  phone?: string;
  amount: number;
  items: { name: string; quantity: number; price: number; image?: string }[];
  payment?: string;
  status?: string;
  address?: string;
}

export async function dbInsertOrder(input: NewOrderInput): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from('orders').insert({
    id: input.id,
    customer: input.customer,
    email: input.email || null,
    phone: input.phone || null,
    amount: input.amount,
    items: input.items,
    item_count: input.items.reduce((sum, i) => sum + i.quantity, 0),
    status: input.status || 'Processing',
    payment: input.payment || null,
    address: input.address || null,
  });
  if (error) {
    console.error('[ordersDb] insert:', error.message);
    return false;
  }
  return true;
}

export async function dbUpdateOrderStatus(id: string, status: OrderStatus): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from('orders').update({ status }).eq('id', id);
  if (error) {
    console.error('[ordersDb] status:', error.message);
    return false;
  }
  return true;
}
