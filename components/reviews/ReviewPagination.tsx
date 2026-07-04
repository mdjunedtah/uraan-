'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ReviewPagination({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2 pt-6" aria-label="Reviews pagination">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="w-9 h-9 flex items-center justify-center border border-[rgba(184,137,58,0.32)] disabled:opacity-30 hover:border-[#b8893a]"
        aria-label="Previous page"
      >
        <ChevronLeft size={14} />
      </button>
      <span className="text-xs text-[#6b5d4c] tabular-nums px-2">
        Page {page} of {pageCount}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        disabled={page >= pageCount}
        className="w-9 h-9 flex items-center justify-center border border-[rgba(184,137,58,0.32)] disabled:opacity-30 hover:border-[#b8893a]"
        aria-label="Next page"
      >
        <ChevronRight size={14} />
      </button>
    </nav>
  );
}
