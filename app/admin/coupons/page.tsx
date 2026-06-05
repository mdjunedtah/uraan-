'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Ticket, Copy } from 'lucide-react';

type Coupon = {
  id: string;
  code: string;
  type: 'percent' | 'flat';
  value: number;
  minOrder: number;
  usageLimit: number;
  used: number;
  validUntil: string;
  active: boolean;
};

const initialCoupons: Coupon[] = [
  { id: 'CP001', code: 'WELCOME10', type: 'percent', value: 10, minOrder: 999, usageLimit: 1000, used: 245, validUntil: '31 Dec 2026', active: true },
  { id: 'CP002', code: 'FESTIVE25', type: 'percent', value: 25, minOrder: 4999, usageLimit: 500, used: 78, validUntil: '15 Nov 2026', active: true },
  { id: 'CP003', code: 'FLAT500', type: 'flat', value: 500, minOrder: 2499, usageLimit: 200, used: 56, validUntil: '30 Jun 2026', active: true },
  { id: 'CP004', code: 'SUMMER15', type: 'percent', value: 15, minOrder: 1999, usageLimit: 800, used: 800, validUntil: '15 Apr 2026', active: false },
  { id: 'CP005', code: 'NEWUSER', type: 'flat', value: 200, minOrder: 999, usageLimit: 5000, used: 1245, validUntil: '31 Dec 2026', active: true },
];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '', type: 'percent' as 'percent' | 'flat', value: 0, minOrder: 0, usageLimit: 100, validUntil: '',
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const id = 'CP' + (coupons.length + 1).toString().padStart(3, '0');
    setCoupons([...coupons, { id, ...newCoupon, used: 0, active: true }]);
    setNewCoupon({ code: '', type: 'percent', value: 0, minOrder: 0, usageLimit: 100, validUntil: '' });
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Delete coupon ${id}?`)) {
      setCoupons(coupons.filter((c) => c.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    setCoupons(coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Copied: ${code}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="serif text-3xl text-[#1a1410] mb-1">Coupons</h1>
          <p className="text-sm text-[#6b5d4c]">
            {coupons.length} coupons · {coupons.filter((c) => c.active).length} active
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1410] text-[#e8d49b] text-[11px] tracking-[2px] uppercase font-semibold hover:bg-[#b8893a] hover:text-[#1a1410]"
        >
          <Plus size={14} /> Add Coupon
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-white border border-[rgba(184,137,58,0.18)] p-5 mb-5">
          <h3 className="display text-sm tracking-[3px] uppercase text-[#1a1410] mb-4">New Coupon</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="luxury-label">Code *</label>
              <input
                type="text"
                required
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                className="luxury-input"
                placeholder="e.g., SAVE20"
              />
            </div>
            <div>
              <label className="luxury-label">Type *</label>
              <select
                value={newCoupon.type}
                onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as 'percent' | 'flat' })}
                className="luxury-input"
              >
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="luxury-label">Value *</label>
              <input
                type="number"
                required
                min={1}
                value={newCoupon.value}
                onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                className="luxury-input"
              />
            </div>
            <div>
              <label className="luxury-label">Min Order (₹)</label>
              <input
                type="number"
                min={0}
                value={newCoupon.minOrder}
                onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: Number(e.target.value) })}
                className="luxury-input"
              />
            </div>
            <div>
              <label className="luxury-label">Usage Limit</label>
              <input
                type="number"
                min={1}
                value={newCoupon.usageLimit}
                onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: Number(e.target.value) })}
                className="luxury-input"
              />
            </div>
            <div>
              <label className="luxury-label">Valid Until *</label>
              <input
                type="text"
                required
                value={newCoupon.validUntil}
                onChange={(e) => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
                className="luxury-input"
                placeholder="e.g., 31 Dec 2026"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className="px-6 py-2 bg-[#1a1410] text-[#e8d49b] text-[11px] tracking-[2px] uppercase font-semibold">
              Save Coupon
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 border border-[#1a1410] text-[11px] tracking-[2px] uppercase font-semibold">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-[rgba(184,137,58,0.18)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] tracking-[1.5px] uppercase text-[#9a8c75] border-b border-[rgba(184,137,58,0.18)] bg-[#fbf8f1]">
              <th className="text-left py-3 px-4 font-semibold">Code</th>
              <th className="text-left py-3 px-4 font-semibold">Discount</th>
              <th className="text-left py-3 px-4 font-semibold">Min Order</th>
              <th className="text-left py-3 px-4 font-semibold">Usage</th>
              <th className="text-left py-3 px-4 font-semibold">Valid Until</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-right py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-[rgba(184,137,58,0.1)] hover:bg-[#fbf8f1]/40">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Ticket size={14} className="text-[#b8893a]" />
                    <span className="font-bold text-[#1a1410] tracking-[1px]">{c.code}</span>
                    <button onClick={() => copyCode(c.code)} aria-label="Copy" className="text-[#9a8c75] hover:text-[#b8893a]">
                      <Copy size={11} />
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4 font-semibold text-[#b8893a]">
                  {c.type === 'percent' ? `${c.value}%` : `₹${c.value}`}
                </td>
                <td className="py-3 px-4 text-[#6b5d4c]">₹{c.minOrder.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4">
                  <div className="text-xs text-[#1a1410] font-medium">{c.used}/{c.usageLimit}</div>
                  <div className="w-full h-1 bg-[#fbf8f1] mt-1 overflow-hidden rounded-full">
                    <div className="h-full bg-[#b8893a]" style={{ width: `${(c.used / c.usageLimit) * 100}%` }} />
                  </div>
                </td>
                <td className="py-3 px-4 text-xs text-[#6b5d4c]">{c.validUntil}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleActive(c.id)}
                    className={`inline-block px-2 py-0.5 text-[10px] font-semibold ${
                      c.active ? 'bg-[#3d6b5a]/10 text-[#3d6b5a]' : 'bg-gray-500/10 text-gray-600'
                    }`}
                  >
                    {c.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-2">
                    <button aria-label="Edit" className="text-[#6b5d4c] hover:text-[#b8893a]">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} aria-label="Delete" className="text-[#6b5d4c] hover:text-[#7a2e2e]">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}