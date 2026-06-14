'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, X, Contact, MessageCircle, Sparkles, Trophy } from 'lucide-react';
import LeadsTable from '@/components/admin/LeadsTable';
import {
  Lead,
  LeadStatus,
  LEAD_STATUSES,
  getLeads,
  addLead,
  updateLeadStatus,
  deleteLead,
  leadStats,
} from '@/lib/leads';

const SOURCES = ['Website', 'Contact Page', 'Newsletter Signup', 'WhatsApp', 'Instagram', 'Phone', 'Walk-in', 'Other'];

const emptyForm = { name: '', email: '', phone: '', source: 'Phone', message: '' };

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Read from localStorage on the client to avoid a hydration mismatch.
  useEffect(() => {
    setLeads(getLeads());
  }, []);

  const refresh = () => setLeads(getLeads());

  const handleStatus = (id: string, status: LeadStatus) => {
    updateLeadStatus(id, status);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteLead(id);
    refresh();
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    addLead(form);
    setForm(emptyForm);
    setShowForm(false);
    refresh();
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      const matchSearch =
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.phone || '').toLowerCase().includes(q) ||
        l.source.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [leads, search, statusFilter]);

  const stats = leadStats(leads);

  const cards = [
    { label: 'Total Leads', value: stats.total, icon: Contact, color: 'text-[#1a1410]' },
    { label: 'New', value: stats.new, icon: Sparkles, color: 'text-[#7a2e2e]' },
    { label: 'From WhatsApp', value: stats.whatsapp, icon: MessageCircle, color: 'text-[#16796F]' },
    { label: 'Won', value: stats.won, icon: Trophy, color: 'text-[#3d6b5a]' },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="serif text-3xl text-[#1a1410] mb-1">CRM / Leads</h1>
          <p className="text-sm text-[#6b5d4c]">
            {filtered.length} of {stats.total} leads across all channels
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-5 py-2.5 bg-[#1a1410] text-[#e8d49b] text-[11px] tracking-[2px] uppercase font-semibold hover:bg-[#b8893a] hover:text-[#1a1410] inline-flex items-center gap-2 transition-colors"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'Close' : 'Add Lead'}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-[rgba(184,137,58,0.18)] p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] tracking-[2px] uppercase text-[#9a8c75]">{c.label}</div>
              <c.icon size={15} className={c.color} />
            </div>
            <div className={`serif text-3xl font-bold ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Add lead form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white border border-[rgba(184,137,58,0.18)] p-5 mb-5 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="luxury-label">Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="luxury-input"
              placeholder="Customer name"
            />
          </div>
          <div>
            <label className="luxury-label">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="luxury-input"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="luxury-label">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="luxury-input"
              placeholder="+91 ..."
            />
          </div>
          <div>
            <label className="luxury-label">Source</label>
            <select
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="luxury-input"
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="luxury-label">Enquiry / Note</label>
            <textarea
              rows={2}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="luxury-input"
              placeholder="What is the lead interested in?"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#b8893a] text-white text-[11px] tracking-[2px] uppercase font-semibold hover:bg-[#1a1410] hover:text-[#e8d49b] inline-flex items-center gap-2 transition-colors"
            >
              <Plus size={14} /> Save Lead
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="bg-white border border-[rgba(184,137,58,0.18)] p-4 mb-5 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search size={14} className="text-[#9a8c75]" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or source..."
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
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <LeadsTable leads={filtered} onStatusChange={handleStatus} onDelete={handleDelete} />
    </div>
  );
}
