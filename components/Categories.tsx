'use client';

import Link from 'next/link';
import { Gem, ChevronRight } from 'lucide-react';
import { categories } from '@/data/jewelleryData';
import { CATEGORY_THEME, CATEGORY_IMAGES } from '@/lib/categoryStyles';

export default function Categories() {
  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <p className="section-tag-italic">Explore Our Collection</p>
      <h2 className="section-heading">Shop By Category</h2>
      <div className="luxury-divider">
        <Gem size={10} />
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 mt-8">
        {categories.slice(0, 12).map((cat) => {
          const theme = CATEGORY_THEME[cat.slug] ?? { bg: '#FFFFFF', text: '#1a1410' };
          const image = CATEGORY_IMAGES[cat.slug] ?? cat.image;
          return (
            <Link
              key={cat.slug}
              href={`/collections?type=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden flex flex-col hover:shadow-[0_14px_44px_rgba(122,90,31,0.16)] hover:-translate-y-1 transition-all duration-300"
              style={{ backgroundColor: theme.bg }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] z-10 bg-gradient-to-r from-[#d4a857] via-[#b8893a] to-[#8c6726] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />

              <div className="relative w-full aspect-[4/5] overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url(${image})` }}
                />
              </div>

              <div className="px-2 py-3 md:py-4 text-center">
                <div
                  className="display text-[10px] md:text-[11px] font-semibold tracking-[1.5px] uppercase leading-tight"
                  style={{ color: theme.text }}
                >
                  {cat.name}
                </div>
                <div className="text-[9px] md:text-[10px] text-[#9a8c75] italic mt-1">
                  {cat.count} Products
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 md:mt-10 text-center">
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 px-7 py-3 border border-[#b8893a] text-[#b8893a] text-[10px] tracking-[3px] uppercase font-medium hover:bg-[#b8893a] hover:text-[#1a1410] transition-all"
        >
          View All Categories <ChevronRight size={12} />
        </Link>
      </div>
    </section>
  );
}