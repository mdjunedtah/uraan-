'use client';

import { useState } from 'react';
import CustomerTable from '@/components/admin/CustomerTable';
import { getAllCustomers, getTotalCustomers, getTotalCustomerRevenue, getAverageOrderValue } from '@/lib/users';
import { Search } from 'lucide-react';

export default function AdminCustomersPage() {
  const allCustomers = getAllCustomers();
  const [search, setSearch] = useState('');

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
    alert(`Viewing customer: ${id}`);
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
          <div className="text-[10px] tracking-[2px] uppercase text-[#9a8c75] mb-2">Total Customers</div>
          <div className="serif text-3xl font-bold text-[#1a1410]">{totalCustomers}</div>
        </div>
        <div className="bg-white border border-[rgba(184,137,58,0.18)] p-5">
          <div className="text-[10px] tracking-[2px] uppercase text-[#9a8c75] mb-2">Total Revenue</div>
          <div className="serif text-3xl font-bold text-[#b8893a]">
            ₹{(totalRevenue / 100000).toFixed(2)}L
          </div>
        </div>
        <div className="bg-white border border-[rgba(184,137,58,0.18)] p-5">
          <div className="text-[10px] tracking-[2px] uppercase text-[#9a8c75] mb-2">Avg Order Value</div>
          <div className="serif text-3xl font-bold text-[#3d6b5a]">
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
    </div>
  );
}