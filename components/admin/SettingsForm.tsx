'use client';

import { useState } from 'react';
import { Save, Store, Mail, Phone, MapPin, Globe, CreditCard } from 'lucide-react';

type SettingsData = {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  currency: string;
  taxRate: number;
  shippingFlat: number;
  freeShippingThreshold: number;
  codCharges: number;
  enableUPI: boolean;
  enableCards: boolean;
  enableNetbanking: boolean;
  enableWallet: boolean;
  enableCOD: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
};

export default function SettingsForm() {
  const [settings, setSettings] = useState<SettingsData>({
    storeName: 'Om Gauri Pulta',
    storeEmail: 'info@omgauripulta.com',
    storePhone: '+91 98765 43210',
    storeAddress: 'Main Bazaar Road, Your City, India - 123456',
    currency: 'INR',
    taxRate: 3,
    shippingFlat: 99,
    freeShippingThreshold: 1999,
    codCharges: 50,
    enableUPI: true,
    enableCards: true,
    enableNetbanking: true,
    enableWallet: true,
    enableCOD: true,
    emailNotifications: true,
    smsNotifications: true,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      alert('Settings saved successfully!');
      setSubmitted(false);
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Store Info */}
      <div className="bg-white border border-[rgba(184,137,58,0.18)] p-5 md:p-6">
        <h3 className="display text-sm tracking-[3px] uppercase text-[#1a1410] mb-5 pb-3 border-b border-[rgba(184,137,58,0.18)] flex items-center gap-2">
          <Store size={14} className="text-[#b8893a]" /> Store Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="luxury-label">Store Name</label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              className="luxury-input"
            />
          </div>

          <div>
            <label className="luxury-label">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8c75]" />
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                className="luxury-input pl-9"
              />
            </div>
          </div>

          <div>
            <label className="luxury-label">Phone</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8c75]" />
              <input
                type="tel"
                value={settings.storePhone}
                onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                className="luxury-input pl-9"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="luxury-label">Address</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-3 text-[#9a8c75]" />
              <textarea
                rows={2}
                value={settings.storeAddress}
                onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                className="luxury-input pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white border border-[rgba(184,137,58,0.18)] p-5 md:p-6">
        <h3 className="display text-sm tracking-[3px] uppercase text-[#1a1410] mb-5 pb-3 border-b border-[rgba(184,137,58,0.18)] flex items-center gap-2">
          <Globe size={14} className="text-[#b8893a]" /> Pricing & Shipping
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="luxury-label">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="luxury-input"
            >
              <option value="INR">₹ INR (Indian Rupee)</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
            </select>
          </div>

          <div>
            <label className="luxury-label">GST / Tax Rate (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={settings.taxRate}
              onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
              className="luxury-input"
            />
          </div>

          <div>
            <label className="luxury-label">Standard Shipping (₹)</label>
            <input
              type="number"
              min={0}
              value={settings.shippingFlat}
              onChange={(e) => setSettings({ ...settings, shippingFlat: Number(e.target.value) })}
              className="luxury-input"
            />
          </div>

          <div>
            <label className="luxury-label">Free Shipping Above (₹)</label>
            <input
              type="number"
              min={0}
              value={settings.freeShippingThreshold}
              onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
              className="luxury-input"
            />
          </div>

          <div>
            <label className="luxury-label">COD Charges (₹)</label>
            <input
              type="number"
              min={0}
              value={settings.codCharges}
              onChange={(e) => setSettings({ ...settings, codCharges: Number(e.target.value) })}
              className="luxury-input"
            />
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white border border-[rgba(184,137,58,0.18)] p-5 md:p-6">
        <h3 className="display text-sm tracking-[3px] uppercase text-[#1a1410] mb-5 pb-3 border-b border-[rgba(184,137,58,0.18)] flex items-center gap-2">
          <CreditCard size={14} className="text-[#b8893a]" /> Payment Methods
        </h3>

        <div className="space-y-3">
          {[
            { key: 'enableCards' as const, label: 'Credit / Debit Cards' },
            { key: 'enableUPI' as const, label: 'UPI Payments' },
            { key: 'enableNetbanking' as const, label: 'Net Banking' },
            { key: 'enableWallet' as const, label: 'Wallets (Paytm, etc.)' },
            { key: 'enableCOD' as const, label: 'Cash on Delivery (COD)' },
          ].map((p) => (
            <label
              key={p.key}
              className="flex items-center justify-between p-3 bg-[#fbf8f1] cursor-pointer hover:bg-[#f8f2e6]"
            >
              <span className="text-sm text-[#1a1410] font-medium">{p.label}</span>
              <input
                type="checkbox"
                checked={settings[p.key]}
                onChange={(e) => setSettings({ ...settings, [p.key]: e.target.checked })}
                className="accent-[#b8893a]"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white border border-[rgba(184,137,58,0.18)] p-5 md:p-6">
        <h3 className="display text-sm tracking-[3px] uppercase text-[#1a1410] mb-5 pb-3 border-b border-[rgba(184,137,58,0.18)]">
          Notifications
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-[#fbf8f1] cursor-pointer hover:bg-[#f8f2e6]">
            <span className="text-sm text-[#1a1410] font-medium">Email notifications for new orders</span>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
              className="accent-[#b8893a]"
            />
          </label>
          <label className="flex items-center justify-between p-3 bg-[#fbf8f1] cursor-pointer hover:bg-[#f8f2e6]">
            <span className="text-sm text-[#1a1410] font-medium">SMS notifications for new orders</span>
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
              className="accent-[#b8893a]"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={submitted}
          className="px-8 py-3 bg-[#1a1410] text-[#e8d49b] text-[11px] tracking-[2px] uppercase font-semibold hover:bg-[#b8893a] hover:text-[#1a1410] inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={14} /> {submitted ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </form>
  );
}