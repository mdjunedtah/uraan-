export type ChartDataPoint = {
  label: string;
  value: number;
};

export type RevenuePoint = {
  month: string;
  revenue: number;
  orders: number;
};

export const monthlyRevenue: RevenuePoint[] = [
  { month: 'Jan', revenue: 145000, orders: 42 },
  { month: 'Feb', revenue: 168000, orders: 51 },
  { month: 'Mar', revenue: 192000, orders: 58 },
  { month: 'Apr', revenue: 215000, orders: 64 },
  { month: 'May', revenue: 248000, orders: 72 },
  { month: 'Jun', revenue: 286000, orders: 85 },
  { month: 'Jul', revenue: 312000, orders: 94 },
  { month: 'Aug', revenue: 298000, orders: 88 },
  { month: 'Sep', revenue: 342000, orders: 102 },
  { month: 'Oct', revenue: 385000, orders: 118 },
  { month: 'Nov', revenue: 412000, orders: 128 },
  { month: 'Dec', revenue: 478000, orders: 142 },
];

export const weeklyOrders: ChartDataPoint[] = [
  { label: 'Mon', value: 12 },
  { label: 'Tue', value: 19 },
  { label: 'Wed', value: 15 },
  { label: 'Thu', value: 22 },
  { label: 'Fri', value: 28 },
  { label: 'Sat', value: 35 },
  { label: 'Sun', value: 24 },
];

export const categorySales: ChartDataPoint[] = [
  { label: 'Gold', value: 35 },
  { label: 'Silver', value: 22 },
  { label: 'Diamond', value: 18 },
  { label: 'Rudraksh', value: 12 },
  { label: 'Gems', value: 8 },
  { label: 'Others', value: 5 },
];

export const topProducts = [
  { id: 'p102', name: 'Diamond Stud Earrings', sales: 124, revenue: 2479876 },
  { id: 'p002', name: 'Gold Temple Necklace', sales: 67, revenue: 4354933 },
  { id: 'p401', name: '5 Mukhi Rudraksh Mala', sales: 156, revenue: 311844 },
  { id: 'p601', name: 'Om Gold Pendant', sales: 92, revenue: 735908 },
  { id: 'p004', name: 'Kundan Bridal Necklace', sales: 89, revenue: 4894911 },
];

export const trafficSources = [
  { label: 'Direct', value: 40 },
  { label: 'Instagram', value: 28 },
  { label: 'Google', value: 18 },
  { label: 'Facebook', value: 9 },
  { label: 'WhatsApp', value: 5 },
];

export function getDashboardStats() {
  return {
    totalRevenue: '₹4.78L',
    totalOrders: 1248,
    totalCustomers: 892,
    productsSold: 2156,
    revenueChange: 18.5,
    ordersChange: 12.3,
    customersChange: 8.7,
    productsChange: -2.1,
  };
}

export function getMonthlyRevenueTotal(): number {
  return monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
}

export function getOrdersTotal(): number {
  return monthlyRevenue.reduce((sum, m) => sum + m.orders, 0);
}