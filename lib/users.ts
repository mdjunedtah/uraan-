export type UserRole = 'customer' | 'admin' | 'staff';

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: UserRole;
  orders: number;
  totalSpent: number;
  joinedOn: string;
  avatar?: string;
};

export const customers: User[] = [
  { id: 'C001', name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 98765 11111', city: 'Mumbai', role: 'customer', orders: 8, totalSpent: 234500, joinedOn: '15 Jan 2024' },
  { id: 'C002', name: 'Ankit Verma', email: 'ankit@example.com', phone: '+91 98765 22222', city: 'Delhi', role: 'customer', orders: 5, totalSpent: 148000, joinedOn: '22 Feb 2024' },
  { id: 'C003', name: 'Neha Joshi', email: 'neha@example.com', phone: '+91 98765 33333', city: 'Bangalore', role: 'customer', orders: 12, totalSpent: 412000, joinedOn: '08 Mar 2024' },
  { id: 'C004', name: 'Suresh Iyer', email: 'suresh@example.com', phone: '+91 98765 44444', city: 'Chennai', role: 'customer', orders: 3, totalSpent: 56000, joinedOn: '14 Apr 2024' },
  { id: 'C005', name: 'Meera Joshi', email: 'meera@example.com', phone: '+91 98765 55555', city: 'Pune', role: 'customer', orders: 6, totalSpent: 198000, joinedOn: '20 May 2024' },
  { id: 'C006', name: 'Rahul Mehta', email: 'rahul@example.com', phone: '+91 98765 66666', city: 'Ahmedabad', role: 'customer', orders: 4, totalSpent: 87500, joinedOn: '11 Jun 2024' },
  { id: 'C007', name: 'Anjali Kapoor', email: 'anjali@example.com', phone: '+91 98765 77777', city: 'Jaipur', role: 'customer', orders: 7, totalSpent: 162000, joinedOn: '03 Jul 2024' },
  { id: 'C008', name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 98765 88888', city: 'Lucknow', role: 'customer', orders: 2, totalSpent: 34500, joinedOn: '19 Aug 2024' },
];

export const adminUsers: User[] = [
  { id: 'A001', name: 'Admin User', email: 'admin@omgauripulta.com', phone: '+91 98765 00001', city: 'HQ', role: 'admin', orders: 0, totalSpent: 0, joinedOn: '01 Jan 2024' },
  { id: 'S001', name: 'Sales Manager', email: 'sales@omgauripulta.com', phone: '+91 98765 00002', city: 'HQ', role: 'staff', orders: 0, totalSpent: 0, joinedOn: '15 Jan 2024' },
  { id: 'S002', name: 'Support Staff', email: 'support@omgauripulta.com', phone: '+91 98765 00003', city: 'HQ', role: 'staff', orders: 0, totalSpent: 0, joinedOn: '20 Feb 2024' },
];

export function getAllCustomers(): User[] {
  return customers;
}

export function getCustomerById(id: string): User | undefined {
  return customers.find((c) => c.id === id);
}

export function getAllAdminUsers(): User[] {
  return adminUsers;
}

export function getTotalCustomers(): number {
  return customers.length;
}

export function getTotalCustomerRevenue(): number {
  return customers.reduce((sum, c) => sum + c.totalSpent, 0);
}

export function getAverageOrderValue(): number {
  const totalOrders = customers.reduce((sum, c) => sum + c.orders, 0);
  if (totalOrders === 0) return 0;
  return Math.round(getTotalCustomerRevenue() / totalOrders);
}