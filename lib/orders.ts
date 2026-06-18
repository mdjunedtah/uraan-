export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export type Order = {
  id: string;
  customerId: string;
  customer: string;
  email: string;
  phone: string;
  amount: number;
  items: number;
  status: OrderStatus;
  payment: string;
  date: string;
  address?: string;
  paid?: boolean;
  paymentId?: string;
};

export const orders: Order[] = [];

export function getAllOrders(): Order[] {
  return orders;
}

export function getOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function getOrdersByStatus(status: OrderStatus): Order[] {
  return orders.filter((o) => o.status === status);
}

export function getOrdersByCustomer(customerId: string): Order[] {
  return orders.filter((o) => o.customerId === customerId);
}

export function getTotalRevenue(): number {
  return orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.amount, 0);
}

export function getStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    Pending: 'bg-[#7a2e2e]/10 text-[#7a2e2e]',
    Processing: 'bg-[#b8893a]/10 text-[#b8893a]',
    Shipped: 'bg-blue-500/10 text-blue-600',
    Delivered: 'bg-[#3d6b5a]/10 text-[#3d6b5a]',
    Cancelled: 'bg-gray-500/10 text-gray-600',
  };
  return colors[status];
}