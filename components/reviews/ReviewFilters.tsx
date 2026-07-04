'use client';

import { Camera, CheckCircle2 } from 'lucide-react';
import type { ReviewFilters, ReviewSort } from '@/lib/reviews';

const SORT_LABELS: Record<ReviewSort, string> = {
  helpful: 'Most Helpful',
  newest: 'Newest',
  highest: 'Highest Rating',
  lowest: 'Lowest Rating',
  images: 'With Images',
};

export default function ReviewFiltersBar({
  sort,
  onSortChange,
  filters,
  onFiltersChange,
  variants,
}: {
  sort: ReviewSort;
  onSortChange: (s: ReviewSort) => void;
  filters: ReviewFilters;
  onFiltersChange: (f: ReviewFilters) => void;
  variants: string[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-4 border-y border-[rgba(184,137,58,0.18)]">
      <label className="flex items-center gap-2 text-[11px] tracking-[1px] uppercase text-[#6b5d4c]">
        Sort
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as ReviewSort)}
          className="border border-[rgba(184,137,58,0.32)] bg-white text-[#1a1410] text-xs px-2 py-1.5 normal-case tracking-normal focus:outline-none focus:ring-1 focus:ring-[#b8893a]"
          aria-label="Sort reviews"
        >
          {(Object.keys(SORT_LABELS) as ReviewSort[]).map((key) => (
            <option key={key} value={key}>
              {SORT_LABELS[key]}
            </option>
          ))}
        </select>
      </label>

      {variants.length > 0 && (
        <label className="flex items-center gap-2 text-[11px] tracking-[1px] uppercase text-[#6b5d4c]">
          Variant
          <select
            value={filters.variant || ''}
            onChange={(e) => onFiltersChange({ ...filters, variant: e.target.value || undefined })}
            className="border border-[rgba(184,137,58,0.32)] bg-white text-[#1a1410] text-xs px-2 py-1.5 normal-case tracking-normal focus:outline-none focus:ring-1 focus:ring-[#b8893a]"
            aria-label="Filter by variant purchased"
          >
            <option value="">All</option>
            {variants.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      )}

      <button
        type="button"
        onClick={() => onFiltersChange({ ...filters, verifiedOnly: !filters.verifiedOnly })}
        aria-pressed={Boolean(filters.verifiedOnly)}
        className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 border transition-colors ${
          filters.verifiedOnly
            ? 'bg-[#3d6b5a] text-white border-[#3d6b5a]'
            : 'border-[rgba(184,137,58,0.32)] text-[#6b5d4c] hover:border-[#b8893a]'
        }`}
      >
        <CheckCircle2 size={12} /> Verified Only
      </button>

      <button
        type="button"
        onClick={() => onFiltersChange({ ...filters, withPhotos: !filters.withPhotos })}
        aria-pressed={Boolean(filters.withPhotos)}
        className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 border transition-colors ${
          filters.withPhotos
            ? 'bg-[#b8893a] text-white border-[#b8893a]'
            : 'border-[rgba(184,137,58,0.32)] text-[#6b5d4c] hover:border-[#b8893a]'
        }`}
      >
        <Camera size={12} /> With Photos
      </button>

      {(filters.rating || filters.variant || filters.verifiedOnly || filters.withPhotos) && (
        <button
          type="button"
          onClick={() => onFiltersChange({})}
          className="text-[11px] text-[#7a2e2e] underline underline-offset-2 ml-auto"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
