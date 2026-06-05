'use client';

import { Eye, Truck } from 'lucide-react';
import { Order, getStatusColor } from '@/lib/orders';

type OrderTableProps = {
  orders: Order[];
  onView?: (id: string) => void;
};

export default function OrderTable({ orders, onView }: OrderTableProps) {
  return (
    <div className="bg-white border border-[rgba(184,137,58,0.18)] overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] tracking-[1.5px] uppercase text-[#9a8c75] border-b border-[rgba(184,137,58,0.18)] bg-[#fbf8f1]">
            <th className="text-left py-3 px-4 font-semibold">Order ID</th>
            <th className="text-left py-3 px-4 font-semibold">Customer</th>
            <th className="text-left py-3 px-4 font-semibold">Amount</th>
            <th className="text-left py-3 px-4 font-semibold">Items</th>
            <th className="text-left py-3 px-4 font-semibold">Payment</th>
            <th className="text-left py-3 px-4 font-semibold">Status</th>
            <th className="text-left py-3 px-4 font-semibold">Date</th>
            <th className="text-right py-3 px-4 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-[rgba(184,137,58,0.1)] hover:bg-[#fbf8f1]/40">
              <td className="py-3 px-4 font-medium text-[#1a1410] text-xs">{o.id}</td>
              <td className="py-3 px-4">
                <div className="font-medium text-[#1a1410]">{o.customer}</div>
                <div className="text-[10px] text-[#9a8c75]">{o.email}</div>
              </td>
              <td className="py-3 px-4 font-semibold text-[#1a1410]">
                ₹{o.amount.toLocaleString('en-IN')}
              </td>
              <td className="py-3 px-4 text-[#6b5d4c]">{o.items}</td>
              <td className="py-3 px-4 text-[#6b5d4c]">{o.payment}</td>
              <td className="py-3 px-4">
                <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold ${getStatusColor(o.status)}`}>
                  {o.status}
                </span>
              </td>
              <td className="py-3 px-4 text-xs text-[#6b5d4c]">{o.date}</td>
              <td className="py-3 px-4 text-right">
                <button
                  onClick={() => onView && onView(o.id)}
                  aria-label="View order"
                  className="text-[#6b5d4c] hover:text-[#b8893a]"
                >
                  <Eye size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && (
        <div className="text-center py-12">
          <Truck className="text-[#9a8c75] mx-auto mb-2" size={32} />
          <p className="text-sm text-[#6b5d4c]">No orders found.</p>
        </div>
      )}
    </div>
  );
}