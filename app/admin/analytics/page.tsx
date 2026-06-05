'use client';

import AnalyticsCard from '@/components/admin/AnalyticsCards';
import { RevenueChart, OrdersChart, CategoryChart } from '@/components/admin/RevenueChart';
import { IndianRupee, ShoppingCart, Users, Package, TrendingUp } from 'lucide-react';
import { getDashboardStats, topProducts, trafficSources } from '@/lib/analytics';

export default function AdminAnalyticsPage() {
  const stats = getDashboardStats();

  return (
    <div>
      <div className="mb-6">
        <h1 className="serif text-3xl text-[#1a1410] mb-1">Analytics</h1>
        <p className="text-sm text-[#6b5d4c]">Deep insights into your business performance.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AnalyticsCard title="Total Revenue" value={stats.totalRevenue} icon={IndianRupee} change={stats.revenueChange} color="gold" />
        <AnalyticsCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} change={stats.ordersChange} color="green" />
        <AnalyticsCard title="Customers" value={stats.totalCustomers} icon={Users} change={stats.customersChange} color="blue" />
        <AnalyticsCard title="Products Sold" value={stats.productsSold} icon={Package} change={stats.productsChange} color="red" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <RevenueChart />
        <OrdersChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <CategoryChart />

        {/* Top Products */}
        <div className="lg:col-span-2 bg-white border border-[rgba(184,137,58,0.18)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="display text-sm tracking-[2px] uppercase text-[#1a1410]">Top Products</h3>
              <p className="text-[10px] text-[#9a8c75] mt-1">Best performers this month</p>
            </div>
            <TrendingUp className="text-[#b8893a]" size={18} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] tracking-[1.5px] uppercase text-[#9a8c75] border-b border-[rgba(184,137,58,0.18)]">
                  <th className="text-left py-2 font-semibold">Product</th>
                  <th className="text-left py-2 font-semibold">Sales</th>
                  <th className="text-left py-2 font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.id} className="border-b border-[rgba(184,137,58,0.1)]">
                    <td className="py-3">
                      <div className="font-medium text-[#1a1410]">{p.name}</div>
                      <div className="text-[10px] text-[#9a8c75]">{p.id}</div>
                    </td>
                    <td className="py-3 font-semibold text-[#1a1410]">{p.sales}</td>
                    <td className="py-3 font-semibold text-[#b8893a]">
                      ₹{p.revenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white border border-[rgba(184,137,58,0.18)] p-5">
        <h3 className="display text-sm tracking-[2px] uppercase text-[#1a1410] mb-4">Traffic Sources</h3>
        <div className="space-y-3">
          {trafficSources.map((src, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#1a1410] w-24">{src.label}</span>
              <div className="flex-1 h-2 bg-[#fbf8f1] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#b8893a]"
                  style={{ width: `${src.value}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-[#b8893a] w-12 text-right">{src.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}