'use client';

import { useState } from 'react';
import { Star, PenSquare } from 'lucide-react';
import { useProductReviews } from '@/hooks/useProductReviews';
import RatingSummary from './RatingSummary';
import ReviewFiltersBar from './ReviewFilters';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import ReviewPagination from './ReviewPagination';

export default function ReviewsSection({
  productId,
  productName,
  fallbackRating,
  fallbackCount,
}: {
  productId: string;
  productName: string;
  fallbackRating: number;
  fallbackCount: number;
}) {
  const {
    reviews,
    total,
    summary,
    variants,
    page,
    setPage,
    pageSize,
    sort,
    setSort,
    filters,
    setFilters,
    loading,
    submit,
    vote,
    report,
  } = useProductReviews(productId);
  const [showForm, setShowForm] = useState(false);

  const displaySummary = summary.count > 0 ? summary : { average: fallbackRating, count: fallbackCount, breakdown: summary.breakdown };

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="max-w-7xl mx-auto px-4 py-12 border-t border-[rgba(184,137,58,0.18)] mt-8 scroll-mt-24"
    >
      <p className="section-tag-italic">Words of Love</p>
      <h2 id="reviews-heading" className="section-heading">
        Customer Reviews
      </h2>
      <div className="luxury-divider">
        <Star size={10} />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
        <RatingSummary summary={displaySummary} activeRating={filters.rating} onSelectRating={(rating) => setFilters({ ...filters, rating })} />
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="h-12 px-6 border border-[#1a1410] text-[11px] tracking-[3px] uppercase font-semibold hover:bg-[#1a1410] hover:text-[#e8d49b] flex items-center justify-center gap-2 whitespace-nowrap"
          aria-expanded={showForm}
        >
          <PenSquare size={14} /> Write a Review
        </button>
      </div>

      {showForm && (
        <div className="mt-6">
          <ReviewForm productId={productId} productName={productName} onSubmit={submit} onDone={() => setShowForm(false)} />
        </div>
      )}

      <div className="mt-8">
        <ReviewFiltersBar sort={sort} onSortChange={setSort} filters={filters} onFiltersChange={setFilters} variants={variants} />

        {loading ? (
          <div className="py-16 text-center text-sm text-[#9a8c75] tracking-[2px] uppercase">Loading reviews…</div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#6b5d4c]">
            {total === 0 && !filters.rating && !filters.variant && !filters.verifiedOnly && !filters.withPhotos
              ? 'No reviews yet — be the first to share your experience.'
              : 'No reviews match these filters.'}
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {reviews.map((review, i) => (
              <ReviewCard key={review.id} review={review} index={i} onVote={vote} onReport={report} />
            ))}
          </div>
        )}

        <ReviewPagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
      </div>
    </section>
  );
}
