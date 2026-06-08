'use client';

import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { reviews } from '@/data/jewelleryData';
import { Heart, Star, CheckCircle2 } from 'lucide-react';

export default function ReviewsPage() {
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <CartDrawer />

      <div className="max-w-7xl mx-auto px-4 py-3 text-[11px] text-[#9a8c75]">
        <Link href="/" className="text-[#b8893a] font-medium">Home</Link>
        <span className="mx-2 opacity-50">›</span>
        <span>Reviews</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-4">
        <p className="section-tag-italic">Words of Love</p>
        <h1 className="serif text-4xl md:text-5xl text-[#1a1410] mb-3">Customer Reviews</h1>
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={15}
                className={i < Math.round(avgRating) ? 'text-[#b8893a] fill-[#b8893a]' : 'text-[#d4cfc5]'}
              />
            ))}
          </div>
          <span className="text-sm text-[#6b5d4c]">
            {avgRating.toFixed(1)} average · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-[rgba(184,137,58,0.18)] p-5 md:p-6 relative hover:shadow-luxury hover:border-[rgba(184,137,58,0.32)] transition-all duration-300"
            >
              <div
                className="absolute top-2 right-4 serif text-6xl text-[#b8893a] opacity-15 leading-none pointer-events-none"
                aria-hidden="true"
              >
                &ldquo;
              </div>

              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={i < r.rating ? 'text-[#b8893a] fill-[#b8893a]' : 'text-[#9a8c75]'}
                  />
                ))}
              </div>

              <p className="serif italic text-[#1a1410] text-base md:text-[17px] leading-relaxed mb-4">
                {r.text}
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-[rgba(184,137,58,0.18)]">
                <div
                  className="w-10 h-10 rounded-full bg-cover bg-center border border-[#b8893a] flex-shrink-0"
                  style={{ backgroundImage: `url(${r.avatar})` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#1a1410]">{r.name}</div>
                  <div className="text-[10px] text-[#9a8c75] tracking-[1px] uppercase mt-0.5">
                    {r.city} · {new Date(r.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
                {r.verified && (
                  <div className="flex items-center gap-1 text-[10px] text-[#3d6b5a] font-medium flex-shrink-0">
                    <CheckCircle2 size={11} />
                    <span>Verified</span>
                  </div>
                )}
              </div>

              {r.product && (
                <div className="mt-3 text-[10px] text-[#6b5d4c] tracking-[0.5px]">
                  Purchased: <span className="text-[#b8893a]">{r.product}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="luxury-divider mt-12">
          <Heart size={10} />
        </div>
        <p className="text-center text-sm text-[#6b5d4c] mt-4">
          Loved your purchase?{' '}
          <Link href="/contact" className="text-[#b8893a] font-medium hover:underline">
            Share your experience with us
          </Link>
        </p>
      </section>

      <Footer />
    </main>
  );
}
