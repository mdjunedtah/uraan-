'use client';

import { useEffect, useState } from 'react';
import OrderTable from '@/components/admin/OrderTable';
import { orders as demoOrders, type Order, type OrderStatus, getStatusColor } from '@/lib/orders';
import { whatsappLink, orderUpdateMessage } from '@/lib/whatsapp';
import { Search, Database, HardDrive, X, MessageCircle } from 'lucide-react';

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [data, setData] = useState<Order[]>(demoOrders);
  const [configured, setConfigured] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

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
    setSelected(data.find((o) => o.id === id) || null);
  };

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    setData((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
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
              <div className={`stat-value ${s.color}`}>{count}</div>
              <div className="stat-label mt-1">
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

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[rgba(184,137,58,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-[rgba(184,137,58,0.18)]">
          <div>
            <h2 className="serif text-2xl text-[#1a1410]">Order {order.id}</h2>
            <p className="text-xs text-[#9a8c75] mt-1">Placed {order.date}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-[#6b5d4c] hover:text-[#1a1410] p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className={`inline-block px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
              className="border border-[rgba(184,137,58,0.32)] px-3 py-1.5 text-xs outline-none cursor-pointer"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="display text-[11px] tracking-[2px] uppercase text-[#9a8c75] mb-2">Customer</h3>
            <div className="text-sm text-[#1a1410] font-medium">{order.customer}</div>
            <div className="text-sm text-[#6b5d4c]">{order.email}</div>
            <div className="text-sm text-[#6b5d4c]">{order.phone}</div>
            {order.address && <div className="text-sm text-[#6b5d4c] mt-1">{order.address}</div>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="display text-[11px] tracking-[2px] uppercase text-[#9a8c75] mb-2">Payment</h3>
              <div className="text-sm text-[#1a1410]">{order.payment || '—'}</div>
              {order.paid !== undefined && (
                <span
                  className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold ${
                    order.paid ? 'bg-[#3d6b5a]/10 text-[#3d6b5a]' : 'bg-gray-500/10 text-gray-600'
                  }`}
                >
                  {order.paid ? 'PAID' : 'UNPAID'}
                </span>
              )}
              {order.paymentId && (
                <div className="text-[10px] text-[#9a8c75] mt-1 break-all">{order.paymentId}</div>
              )}
            </div>
            <div>
              <h3 className="display text-[11px] tracking-[2px] uppercase text-[#9a8c75] mb-2">Summary</h3>
              <div className="text-sm text-[#6b5d4c]">{order.items} item(s)</div>
              <div className="serif text-2xl font-bold text-[#1a1410]">
                ₹{order.amount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <a
            href={whatsappLink(orderUpdateMessage(order), order.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-5 py-3 bg-[#16796F] text-white text-[11px] tracking-[2px] uppercase font-semibold hover:opacity-90 inline-flex items-center justify-center gap-2"
          >
            <MessageCircle size={14} /> Send update on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
