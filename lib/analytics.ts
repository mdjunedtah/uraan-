export type ChartDataPoint = {
  label: string;
  value: number;
};

export type RevenuePoint = {
  month: string;
  revenue: number;
  orders: number;
};

export const monthlyRevenue: RevenuePoint[] = [];

export const weeklyOrders: ChartDataPoint[] = [];

export const categorySales: ChartDataPoint[] = [];

export const topProducts: { id: string; name: string; sales: number; revenue: number }[] = [];

export const trafficSources: ChartDataPoint[] = [];

export function getDashboardStats() {
  return {
    totalRevenue: '₹0',
    totalOrders: 0,
    totalCustomers: 0,
    productsSold: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0,
    productsChange: 0,
  };
}

export function getMonthlyRevenueTotal(): number {
  return monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
}

export function getOrdersTotal(): number {
  return monthlyRevenue.reduce((sum, m) => sum + m.orders, 0);
}