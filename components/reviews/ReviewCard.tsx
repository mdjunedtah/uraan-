'use client';

import { useState } from 'react';
import { CheckCircle2, ThumbsUp, Flag, X } from 'lucide-react';
import { Star } from 'lucide-react';
import type { Review } from '@/lib/reviews';
import { reviewAccent, initialsOf } from '@/lib/reviewStyle';
import { hasVotedHelpful, hasReported } from '@/lib/reviewsStore';

const REPORT_REASONS: { value: string; label: string }[] = [
  { value: 'spam', label: 'Spam or advertising' },
  { value: 'offensive', label: 'Offensive language' },
  { value: 'fake', label: 'Seems fake' },
  { value: 'irrelevant', label: 'Not relevant to this product' },
  { value: 'other', label: 'Other' },
];

export default function ReviewCard({
  review,
  index,
  onVote,
  onReport,
}: {
  review: Review;
  index: number;
  onVote: (id: string) => Promise<{ alreadyVoted: boolean }>;
  onReport: (id: string, reason: string) => Promise<{ alreadyReported: boolean }>;
}) {
  const accent = reviewAccent(index);
  const [voted, setVoted] = useState(() => hasVotedHelpful(review.id));
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [reported, setReported] = useState(() => hasReported(review.id));
  const [reportOpen, setReportOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [voting, setVoting] = useState(false);

  const media = [...review.images.map((url) => ({ url, type: 'image' as const })), ...review.videos.map((url) => ({ url, type: 'video' as const }))];

  const handleVote = async () => {
    if (voted || voting) return;
    setVoting(true);
    const result = await onVote(review.id);
    setVoting(false);
    setVoted(true);
    if (!result.alreadyVoted) setHelpfulCount((c) => c + 1);
  };

  const handleReport = async (reason: string) => {
    setReportOpen(false);
    if (reported) return;
    setReported(true);
    await onReport(review.id, reason);
  };

  return (
    <div className="border border-[rgba(184,137,58,0.18)] p-5" style={{ borderLeft: `3px solid ${accent}` }}>
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        >
          {initialsOf(review.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[#1a1410]">{review.name}</span>
            {review.verified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#3d6b5a] bg-[#3d6b5a]/10 px-1.5 py-0.5">
                <CheckCircle2 size={10} /> Verified Purchase
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-[#9a8c75]">
            <span className="flex gap-0.5" role="img" aria-label={`${review.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={11} className={i < review.rating ? 'text-[#b8893a] fill-[#b8893a]' : 'text-[#d4cfc5]'} aria-hidden="true" />
              ))}
            </span>
            <span>·</span>
            <time dateTime={review.date}>
              {review.date ? new Date(review.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
            </time>
            {review.variant && (
              <>
                <span>·</span>
                <span>Purchased: {review.variant}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {review.title && <h3 className="text-sm font-semibold text-[#1a1410] mb-1.5">{review.title}</h3>}
      <p className="text-sm text-[#6b5d4c] leading-relaxed whitespace-pre-line">{review.text}</p>

      {media.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {media.map((m, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightbox(m)}
              className="w-16 h-16 overflow-hidden border border-[rgba(184,137,58,0.32)] bg-[#f8f2e6]"
              aria-label={`View ${m.type} ${i + 1} from this review`}
            >
              {m.type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <video src={m.url} className="w-full h-full object-cover" muted />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[rgba(184,137,58,0.12)]">
        <button
          type="button"
          onClick={handleVote}
          disabled={voted || voting}
          aria-pressed={voted}
          className={`flex items-center gap-1.5 text-[11px] tracking-[0.5px] ${voted ? 'text-[#3d6b5a]' : 'text-[#6b5d4c] hover:text-[#b8893a]'} disabled:cursor-default`}
        >
          <ThumbsUp size={13} className={voted ? 'fill-[#3d6b5a]' : ''} />
          Helpful{helpfulCount > 0 ? ` (${helpfulCount})` : ''}
        </button>

        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setReportOpen((v) => !v)}
            disabled={reported}
            className="flex items-center gap-1.5 text-[11px] text-[#9a8c75] hover:text-[#7a2e2e] disabled:text-[#c5bca9]"
            aria-expanded={reportOpen}
          >
            <Flag size={12} />
            {reported ? 'Reported' : 'Report'}
          </button>
          {reportOpen && (
            <div className="absolute right-0 z-10 mt-2 w-56 bg-white border border-[rgba(184,137,58,0.32)] shadow-luxury text-left">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(184,137,58,0.18)]">
                <span className="text-[11px] font-semibold text-[#1a1410]">Report review</span>
                <button type="button" onClick={() => setReportOpen(false)} aria-label="Close">
                  <X size={13} className="text-[#9a8c75]" />
                </button>
              </div>
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => handleReport(r.value)}
                  className="block w-full text-left px-3 py-2 text-xs text-[#6b5d4c] hover:bg-[#f8f2e6]"
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Review media viewer"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white"
            aria-label="Close viewer"
          >
            <X size={24} />
          </button>
          <div onClick={(e) => e.stopPropagation()}>
            {lightbox.type === 'video' ? (
              <video src={lightbox.url} controls autoPlay className="max-w-full max-h-full" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lightbox.url} alt="" className="max-w-full max-h-full object-contain" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
