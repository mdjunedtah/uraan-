'use client';

import { useEffect, useState } from 'react';
import OrderTable from '@/components/admin/OrderTable';
import { orders as demoOrders, type Order, type OrderStatus } from '@/lib/orders';
import { Search, Database, HardDrive } from 'lucide-react';

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [data, setData] = useState<Order[]>(demoOrders);
  const [configured, setConfigured] = useState(false);

  // Prefer real orders from the database; fall back to the demo data.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/orders');
        const json = await res.json();
        if (res.ok && json.configured) {
          setConfigured(true);
          setData(json.orders as Order[]);
        }
      } catch {
        /* keep demo data */
      }
    })();
  }, []);

  const filtered = data.filter((o) => {
    const matchSearch =
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = filtered.reduce(
    (sum, o) => (o.status !== 'Cancelled' ? sum + o.amount : sum),
    0
  );

  const handleView = (id: string) => {
    alert(`Viewing order: ${id}`);
  };

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    setData((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    if (configured) {
      await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="serif text-3xl text-[#1a1410] mb-1">Orders</h1>
        <p className="text-sm text-[#6b5d4c] flex items-center gap-2 flex-wrap">
          {filtered.length} orders · Revenue: ₹{totalRevenue.toLocaleString('en-IN')}
          <span
            className={`inline-flex items-center gap-1 text-[10px] tracking-[1px] uppercase px-2 py-0.5 ${
              configured ? 'bg-[#3d6b5a]/10 text-[#3d6b5a]' : 'bg-[#b8893a]/10 text-[#b8893a]'
            }`}
            title={configured ? 'Live orders from your database' : 'Sample data — connect a database to see real orders'}
          >
            {configured ? <Database size={11} /> : <HardDrive size={11} />}
            {configured ? 'Live' : 'Sample data'}
          </span>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {[
          { label: 'Pending', value: 'Pending', color: 'text-[#7a2e2e]' },
          { label: 'Processing', value: 'Processing', color: 'text-[#b8893a]' },
          { label: 'Shipped', value: 'Shipped', color: 'text-blue-600' },
          { label: 'Delivered', value: 'Delivered', color: 'text-[#3d6b5a]' },
          { label: 'Cancelled', value: 'Cancelled', color: 'text-gray-600' },
        ].map((s, i) => {
          const count = data.filter((o) => o.status === s.value).length;
          return (
            <button
              key={i}
              onClick={() => setStatusFilter(s.value)}
              className="bg-white border border-[rgba(184,137,58,0.18)] p-3 text-center hover:border-[#b8893a]"
            >
              <div className={`serif text-2xl font-bold ${s.color}`}>{count}</div>
              <div className="text-[10px] tracking-[1px] uppercase text-[#9a8c75] mt-1">
                {s.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white border border-[rgba(184,137,58,0.18)] p-4 mb-5 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={14} className="text-[#9a8c75]" />
          <input
            type="text"
            placeholder="Search by customer or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm min-w-0"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-[rgba(184,137,58,0.32)] px-3 py-1.5 text-xs outline-none cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <OrderTable orders={filtered} onView={handleView} onStatusChange={handleStatusChange} />
    </div>
  );
}
