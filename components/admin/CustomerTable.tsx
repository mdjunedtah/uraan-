'use client';

import { Mail, Phone, Eye, Users } from 'lucide-react';
import { User } from '@/lib/users';

type CustomerTableProps = {
  customers: User[];
  onView?: (id: string) => void;
};

export default function CustomerTable({ customers, onView }: CustomerTableProps) {
  return (
    <div className="bg-white border border-[rgba(184,137,58,0.18)] overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] tracking-[1.5px] uppercase text-[#9a8c75] border-b border-[rgba(184,137,58,0.18)] bg-[#fbf8f1]">
            <th className="text-left py-3 px-4 font-semibold">Customer</th>
            <th className="text-left py-3 px-4 font-semibold">Contact</th>
            <th className="text-left py-3 px-4 font-semibold">City</th>
            <th className="text-left py-3 px-4 font-semibold">Orders</th>
            <th className="text-left py-3 px-4 font-semibold">Spent</th>
            <th className="text-left py-3 px-4 font-semibold">Joined</th>
            <th className="text-right py-3 px-4 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-b border-[rgba(184,137,58,0.1)] hover:bg-[#fbf8f1]/40">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#b8893a]/10 grid place-items-center text-[#b8893a] font-semibold text-xs">
                    {c.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium text-[#1a1410]">{c.name}</div>
                    <div className="text-[10px] text-[#9a8c75]">{c.id}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="text-xs text-[#6b5d4c] flex items-center gap-1">
                  <Mail size={11} /> {c.email}
                </div>
                <div className="text-xs text-[#6b5d4c] flex items-center gap-1 mt-0.5">
                  <Phone size={11} /> {c.phone}
                </div>
              </td>
              <td className="py-3 px-4 text-[#6b5d4c]">{c.city}</td>
              <td className="py-3 px-4 font-semibold text-[#1a1410]">{c.orders}</td>
              <td className="py-3 px-4 font-semibold text-[#b8893a]">
                ₹{c.totalSpent.toLocaleString('en-IN')}
              </td>
              <td className="py-3 px-4 text-xs text-[#6b5d4c]">{c.joinedOn}</td>
              <td className="py-3 px-4 text-right">
                <button
                  onClick={() => onView && onView(c.id)}
                  aria-label="View"
                  className="text-[#6b5d4c] hover:text-[#b8893a]"
                >
                  <Eye size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {customers.length === 0 && (
        <div className="text-center py-12">
          <Users className="text-[#9a8c75] mx-auto mb-2" size={32} />
          <p className="text-sm text-[#6b5d4c]">No customers found.</p>
        </div>
      )}
    </div>
  );
}