'use client';

import { useState } from 'react';
import CustomerTable from '@/components/admin/CustomerTable';
import { getAllCustomers, getTotalCustomers, getTotalCustomerRevenue, getAverageOrderValue, type User } from '@/lib/users';
import { getOrdersByCustomer, getStatusColor } from '@/lib/orders';
import { Search, X, Mail, Phone, MapPin } from 'lucide-react';

export default function AdminCustomersPage() {
  const allCustomers = getAllCustomers();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<User | null>(null);

  const filtered = allCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  const totalCustomers = getTotalCustomers();
  const totalRevenue = getTotalCustomerRevenue();
  const avgOrderValue = getAverageOrderValue();

  const handleView = (id: string) => {
    setSelected(allCustomers.find((c) => c.id === id) || null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="serif text-3xl text-[#1a1410] mb-1">Customers</h1>
        <p className="text-sm text-[#6b5d4c]">
          {filtered.length} of {totalCustomers} customers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-white border border-[rgba(184,137,58,0.18)] p-5">
          <div className="stat-label mb-2">Total Customers</div>
          <div className="stat-value text-[#1a1410]">{totalCustomers}</div>
        </div>
        <div className="bg-white border border-[rgba(184,137,58,0.18)] p-5">
          <div className="stat-label mb-2">Total Revenue</div>
          <div className="stat-value text-[#b8893a]">
            ₹{(totalRevenue / 100000).toFixed(2)}L
          </div>
        </div>
        <div className="bg-white border border-[rgba(184,137,58,0.18)] p-5">
          <div className="stat-label mb-2">Avg Order Value</div>
          <div className="stat-value text-[#3d6b5a]">
            ₹{avgOrderValue.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[rgba(184,137,58,0.18)] p-4 mb-5 flex items-center gap-2">
        <Search size={14} className="text-[#9a8c75]" />
        <input
          type="text"
          placeholder="Search by name, email, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      <CustomerTable customers={filtered} onView={handleView} />

      {selected && <CustomerDetailModal customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function CustomerDetailModal({ customer, onClose }: { customer: User; onClose: () => void }) {
  const orders = getOrdersByCustomer(customer.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[rgba(184,137,58,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-[rgba(184,137,58,0.18)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#b8893a]/10 grid place-items-center text-[#b8893a] font-semibold">
              {customer.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h2 className="serif text-2xl text-[#1a1410]">{customer.name}</h2>
              <p className="text-xs text-[#9a8c75]">{customer.id} · Joined {customer.joinedOn}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-[#6b5d4c] hover:text-[#1a1410] p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="space-y-1">
            <div className="text-sm text-[#6b5d4c] flex items-center gap-2"><Mail size={13} /> {customer.email}</div>
            <div className="text-sm text-[#6b5d4c] flex items-center gap-2"><Phone size={13} /> {customer.phone}</div>
            <div className="text-sm text-[#6b5d4c] flex items-center gap-2"><MapPin size={13} /> {customer.city}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#fbf8f1] p-4 text-center">
              <div className="serif text-2xl font-bold text-[#1a1410]">{customer.orders}</div>
              <div className="text-[10px] tracking-[1px] uppercase text-[#9a8c75] mt-1">Orders</div>
            </div>
            <div className="bg-[#fbf8f1] p-4 text-center">
              <div className="serif text-2xl font-bold text-[#b8893a]">₹{customer.totalSpent.toLocaleString('en-IN')}</div>
              <div className="text-[10px] tracking-[1px] uppercase text-[#9a8c75] mt-1">Total Spent</div>
            </div>
          </div>

          <div>
            <h3 className="display text-[11px] tracking-[2px] uppercase text-[#9a8c75] mb-2">Recent Orders</h3>
            {orders.length === 0 ? (
              <p className="text-sm text-[#6b5d4c]">No orders found in the current data.</p>
            ) : (
              <div className="divide-y divide-[rgba(184,137,58,0.12)] border border-[rgba(184,137,58,0.18)]">
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between gap-3 p-3">
                    <div>
                      <div className="text-xs font-medium text-[#1a1410]">{o.id}</div>
                      <div className="text-[10px] text-[#9a8c75]">{o.date}</div>
                    </div>
                    <div className="text-sm font-semibold text-[#1a1410]">₹{o.amount.toLocaleString('en-IN')}</div>
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold ${getStatusColor(o.status)}`}>
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
