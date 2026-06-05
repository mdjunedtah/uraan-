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
};

export const orders: Order[] = [
  { id: 'OGP12345678', customerId: 'C001', customer: 'Priya Sharma', email: 'priya@example.com', phone: '+91 98765 11111', amount: 49999, items: 1, status: 'Delivered', payment: 'Card', date: '21 May 2026', address: 'Mumbai, MH' },
  { id: 'OGP12345679', customerId: 'C002', customer: 'Rahul Mehta', email: 'rahul@example.com', phone: '+91 98765 22222', amount: 24999, items: 1, status: 'Shipped', payment: 'UPI', date: '20 May 2026', address: 'Ahmedabad, GJ' },
  { id: 'OGP12345680', customerId: 'C003', customer: 'Anjali Kapoor', email: 'anjali@example.com', phone: '+91 98765 33333', amount: 8999, items: 2, status: 'Processing', payment: 'Card', date: '20 May 2026', address: 'Jaipur, RJ' },
  { id: 'OGP12345681', customerId: 'C004', customer: 'Suresh Iyer', email: 'suresh@example.com', phone: '+91 98765 44444', amount: 1999, items: 1, status: 'Pending', payment: 'COD', date: '19 May 2026', address: 'Chennai, TN' },
  { id: 'OGP12345682', customerId: 'C005', customer: 'Neha Verma', email: 'neha@example.com', phone: '+91 98765 55555', amount: 64999, items: 1, status: 'Delivered', payment: 'Netbanking', date: '19 May 2026', address: 'Bangalore, KA' },
  { id: 'OGP12345683', customerId: 'C006', customer: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 98765 66666', amount: 19999, items: 1, status: 'Delivered', payment: 'UPI', date: '18 May 2026', address: 'Lucknow, UP' },
  { id: 'OGP12345684', customerId: 'C007', customer: 'Meera Joshi', email: 'meera@example.com', phone: '+91 98765 77777', amount: 54999, items: 1, status: 'Cancelled', payment: 'Card', date: '17 May 2026', address: 'Pune, MH' },
  { id: 'OGP12345685', customerId: 'C008', customer: 'Ankit Verma', email: 'ankit@example.com', phone: '+91 98765 88888', amount: 14999, items: 1, status: 'Shipped', payment: 'Wallet', date: '16 May 2026', address: 'Delhi, DL' },
];

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