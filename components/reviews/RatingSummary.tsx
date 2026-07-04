'use client';

import { Star } from 'lucide-react';
import type { ReviewSummary } from '@/lib/reviews';

export default function RatingSummary({
  summary,
  activeRating,
  onSelectRating,
}: {
  summary: ReviewSummary;
  activeRating?: number;
  onSelectRating: (rating: number | undefined) => void;
}) {
  const { average, count, breakdown } = summary;
  const stars = [5, 4, 3, 2, 1] as const;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 sm:gap-10">
      <div className="flex flex-col items-center sm:items-start justify-center text-center sm:text-left">
        <div className="serif text-5xl text-[#1a1410] font-semibold leading-none">{average.toFixed(1)}</div>
        <div className="flex gap-0.5 my-2" role="img" aria-label={`${average.toFixed(1)} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < Math.round(average) ? 'text-[#b8893a] fill-[#b8893a]' : 'text-[#d4cfc5]'}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="text-xs text-[#6b5d4c]">
          Based on {count} review{count !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 justify-center min-w-0" role="group" aria-label="Filter by star rating">
        {stars.map((star) => {
          const n = breakdown[star];
          const pct = count ? Math.round((n / count) * 100) : 0;
          const isActive = activeRating === star;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onSelectRating(isActive ? undefined : star)}
              aria-pressed={isActive}
              className={`group flex items-center gap-2 text-left w-full max-w-md ${n === 0 ? 'opacity-50 cursor-default' : ''}`}
              disabled={n === 0}
            >
              <span className="text-[11px] tabular-nums text-[#6b5d4c] w-8 shrink-0">{star}★</span>
              <span className="flex-1 h-2 bg-[#f0e9d8] overflow-hidden">
                <span
                  className={`block h-full ${isActive ? 'bg-[#7a5a1f]' : 'bg-[#b8893a]'} transition-all duration-300 group-hover:bg-[#7a5a1f]`}
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="text-[11px] tabular-nums text-[#9a8c75] w-10 shrink-0 text-right">{n}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
