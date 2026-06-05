'use client';

import Link from 'next/link';
import AnalyticsCard from '@/components/admin/AnalyticsCards';
import { RevenueChart, OrdersChart, CategoryChart } from '@/components/admin/RevenueChart';
import { IndianRupee, ShoppingCart, Users, Package } from 'lucide-react';
import { orders, getStatusColor } from '@/lib/orders';
import { getDashboardStats } from '@/lib/analytics';

export default function AdminDashboard() {
  const stats = getDashboardStats();
  const recentOrders = orders.slice(0, 5);

  return (
    <div>
      <div className="mb-6">
        <h1 className="serif text-3xl text-[#1a1410] mb-1">Dashboard</h1>
        <p className="text-sm text-[#6b5d4c]">Welcome back, here&apos;s today&apos;s overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AnalyticsCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={IndianRupee}
          change={stats.revenueChange}
          color="gold"
        />
        <AnalyticsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          change={stats.ordersChange}
          color="green"
        />
        <AnalyticsCard
          title="Customers"
          value={stats.totalCustomers}
          icon={Users}
          change={stats.customersChange}
          color="blue"
        />
        <AnalyticsCard
          title="Products Sold"
          value={stats.productsSold}
          icon={Package}
          change={stats.productsChange}
          color="red"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <RevenueChart />
        <OrdersChart />
      </div>

      {/* Recent Orders + Category Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-[rgba(184,137,58,0.18)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="display text-sm tracking-[2px] uppercase text-[#1a1410]">Recent Orders</h3>
              <p className="text-[10px] text-[#9a8c75] mt-1">Last 5 orders</p>
            </div>
            <Link href="/admin/orders" className="text-[10px] tracking-[1.5px] uppercase text-[#b8893a] font-semibold hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] tracking-[1.5px] uppercase text-[#9a8c75] border-b border-[rgba(184,137,58,0.18)]">
                  <th className="text-left py-2 font-semibold">Order ID</th>
                  <th className="text-left py-2 font-semibold">Customer</th>
                  <th className="text-left py-2 font-semibold">Amount</th>
                  <th className="text-left py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-[rgba(184,137,58,0.1)]">
                    <td className="py-3 font-medium text-[#1a1410] text-xs">{o.id}</td>
                    <td className="py-3 text-[#1a1410]">{o.customer}</td>
                    <td className="py-3 font-semibold text-[#1a1410]">
                      ₹{o.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold ${getStatusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <CategoryChart />
      </div>
    </div>
  );
}