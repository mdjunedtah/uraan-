'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Star, Trash2, CheckCircle2, XCircle, Database, HardDrive,
  EyeOff, Pencil, Save, ShieldAlert, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { type Review, getReviews, moderateReview, deleteReview } from '@/lib/reviewsStore';
import type { ReviewStatus } from '@/lib/reviews';

const TABS: { value: ReviewStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'hidden', label: 'Hidden' },
];

const PAGE_SIZE = 10;

export default function AdminReviewsPage() {
  const [reviewList, setReviewList] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [configured, setConfigured] = useState(false);
  const [status, setStatus] = useState<ReviewStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ title: string; text: string; rating: number }>({ title: '', text: '', rating: 5 });

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ status, page: String(page), pageSize: String(PAGE_SIZE) });
      const res = await fetch(`/api/reviews?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.configured) {
        setConfigured(true);
        setReviewList(data.reviews as Review[]);
        setTotal(data.total as number);
        return;
      }
    } catch {
      /* ignore — use the local fallback */
    }
    setConfigured(false);
    const all = getReviews().filter((r) => status === 'all' || r.status === status);
    setTotal(all.length);
    setReviewList(all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const overallAvg = reviewList.length
    ? (reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length).toFixed(1)
    : '0.0';

  async function patch(id: string, body: Record<string, unknown>) {
    if (configured) {
      await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      moderateReview(id, body as Parameters<typeof moderateReview>[1]);
    }
    await load();
  }

  const handleApprove = (id: string) => patch(id, { status: 'approved' });
  const handleReject = (id: string) => patch(id, { status: 'rejected' });
  const handleHide = (id: string, current: ReviewStatus) => patch(id, { status: current === 'hidden' ? 'approved' : 'hidden' });
  const handleVerifyToggle = (id: string, current: boolean) => patch(id, { verified: !current });

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete review ${id}? This cannot be undone.`)) return;
    if (configured) {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    } else {
      deleteReview(id);
    }
    await load();
  };

  const startEdit = (r: Review) => {
    setEditingId(r.id);
    setDraft({ title: r.title, text: r.text, rating: r.rating });
  };

  const saveEdit = async (id: string) => {
    await patch(id, { title: draft.title, text: draft.text, rating: draft.rating });
    setEditingId(null);
  };

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6">
        <h1 className="serif text-3xl text-[#1a1410] mb-1">Reviews</h1>
        <p className="text-sm text-[#6b5d4c] flex items-center gap-2 flex-wrap">
          {total} reviews in this view · Avg {overallAvg}★
          <StorageBadge configured={configured} />
        </p>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => {
              setStatus(t.value);
              setPage(1);
            }}
            className={`px-4 py-2 text-xs font-semibold border ${
              status === t.value ? 'border-[#b8893a] bg-[#b8893a]/10 text-[#7a5a1f]' : 'border-[rgba(184,137,58,0.18)] text-[#6b5d4c]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {reviewList.map((r) => (
          <div key={r.id} className="bg-white border border-[rgba(184,137,58,0.18)] p-5">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-full bg-cover bg-center border border-[#b8893a] flex-shrink-0 bg-[#f8f2e6]"
                style={r.avatar ? { backgroundImage: `url(${r.avatar})` } : undefined}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <div className="font-semibold text-[#1a1410]">{r.name}</div>
                  <StatusBadge status={r.status} />
                  {r.verified && (
                    <span className="bg-[#3d6b5a]/10 text-[#3d6b5a] px-2 py-0.5 text-[9px] font-semibold flex items-center gap-1">
                      <CheckCircle2 size={9} /> Verified Purchase
                    </span>
                  )}
                  {typeof r.spamScore === 'number' && r.spamScore > 0 && (
                    <span
                      className={`px-2 py-0.5 text-[9px] font-semibold flex items-center gap-1 ${
                        r.spamScore >= 60 ? 'bg-[#7a2e2e]/10 text-[#7a2e2e]' : 'bg-[#b8893a]/10 text-[#b8893a]'
                      }`}
                      title="Heuristic spam/profanity score (0-100)"
                    >
                      <ShieldAlert size={9} /> Spam {r.spamScore}
                    </span>
                  )}
                  {r.reportCount > 0 && (
                    <span className="text-[9px] text-[#7a2e2e]">{r.reportCount} report{r.reportCount !== 1 ? 's' : ''}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < r.rating ? 'text-[#b8893a] fill-[#b8893a]' : 'text-[#d4cfc5]'} />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#9a8c75]">{r.date}</span>
                  {r.variant && <span className="text-[10px] text-[#9a8c75]">· {r.variant}</span>}
                  <span className="text-[10px] text-[#9a8c75]">· {r.helpfulCount} helpful</span>
                </div>

                {editingId === r.id ? (
                  <div className="space-y-2 mb-2">
                    <input
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      className="w-full border border-[rgba(184,137,58,0.32)] px-2 py-1.5 text-sm font-semibold"
                    />
                    <textarea
                      value={draft.text}
                      onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                      rows={3}
                      className="w-full border border-[rgba(184,137,58,0.32)] px-2 py-1.5 text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-[#6b5d4c]">Rating</label>
                      <select
                        value={draft.rating}
                        onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
                        className="border border-[rgba(184,137,58,0.32)] px-2 py-1 text-xs"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => saveEdit(r.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-[#3d6b5a] px-2 py-1"
                      >
                        <Save size={12} /> Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-[#9a8c75] px-2 py-1">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {r.title && <p className="text-sm font-semibold text-[#1a1410] mb-1">{r.title}</p>}
                    <p className="text-sm text-[#6b5d4c] leading-relaxed mb-2">{r.text}</p>
                  </>
                )}

                {r.product && (
                  <div className="text-[10px] text-[#b8893a] tracking-[0.5px]">
                    Product: {r.product} {r.productId ? `(${r.productId})` : ''}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {r.status !== 'approved' && (
                  <button onClick={() => handleApprove(r.id)} aria-label="Approve" title="Approve" className="p-2 text-[#3d6b5a]">
                    <CheckCircle2 size={14} />
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button onClick={() => handleReject(r.id)} aria-label="Reject" title="Reject" className="p-2 text-[#7a2e2e]">
                    <XCircle size={14} />
                  </button>
                )}
                <button onClick={() => handleHide(r.id, r.status)} aria-label="Hide" title={r.status === 'hidden' ? 'Unhide' : 'Hide'} className="p-2 text-[#6b5d4c]">
                  <EyeOff size={14} />
                </button>
                <button onClick={() => startEdit(r)} aria-label="Edit" title="Edit" className="p-2 text-[#6b5d4c]">
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleVerifyToggle(r.id, r.verified)}
                  aria-label="Toggle verified purchase"
                  title={r.verified ? 'Unmark Verified Purchase' : 'Mark Verified Purchase'}
                  className={r.verified ? 'p-2 text-[#7a2e2e]' : 'p-2 text-[#3d6b5a]'}
                >
                  {r.verified ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                </button>
                <button onClick={() => handleDelete(r.id)} aria-label="Delete" title="Delete" className="p-2 text-[#6b5d4c] hover:text-[#7a2e2e]">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviewList.length === 0 && (
        <div className="bg-white border border-[rgba(184,137,58,0.18)] text-center py-12 text-sm text-[#6b5d4c]">
          No reviews in this view.
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="w-8 h-8 flex items-center justify-center border border-[rgba(184,137,58,0.32)] disabled:opacity-30"
          >
            <ChevronLeft size={13} />
          </button>
          <span className="text-xs text-[#6b5d4c]">Page {page} of {pageCount}</span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page >= pageCount}
            className="w-8 h-8 flex items-center justify-center border border-[rgba(184,137,58,0.32)] disabled:opacity-30"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const map: Record<ReviewStatus, string> = {
    approved: 'bg-[#3d6b5a]/10 text-[#3d6b5a]',
    pending: 'bg-[#b8893a]/10 text-[#b8893a]',
    rejected: 'bg-[#7a2e2e]/10 text-[#7a2e2e]',
    hidden: 'bg-[#6b5d4c]/10 text-[#6b5d4c]',
  };
  return <span className={`px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.5px] ${map[status]}`}>{status}</span>;
}

function StorageBadge({ configured }: { configured: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] tracking-[1px] uppercase px-2 py-0.5 ${
        configured ? 'bg-[#3d6b5a]/10 text-[#3d6b5a]' : 'bg-[#b8893a]/10 text-[#b8893a]'
      }`}
      title={configured ? 'Saved to your database' : 'Stored in this browser only — run supabase/schema.sql to sync'}
    >
      {configured ? <Database size={11} /> : <HardDrive size={11} />}
      {configured ? 'Database' : 'This browser'}
    </span>
  );
}
