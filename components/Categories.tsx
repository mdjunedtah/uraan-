'use client';

import Link from 'next/link';
import { Gem } from 'lucide-react';
import { categories } from '@/data/jewelleryData';

export default function Categories() {
  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <p className="section-tag-italic">Explore Our Collection</p>
      <h2 className="section-heading">Shop By Category</h2>
      <div className="luxury-divider">
        <Gem size={10} />
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 mt-8">
        {categories.slice(0, 12).map((cat) => (
          <Link
            key={cat.slug}
            href={`/collections?type=${cat.slug}`}
            className="group relative bg-white border border-[rgba(184,137,58,0.18)] p-4 md:p-5 text-center flex flex-col items-center gap-3 hover:shadow-[0_12px_40px_rgba(122,90,31,0.12)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#d4a857] via-[#b8893a] to-[#8c6726] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />

            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cover bg-center bg-[#f8f2e6]"
              style={{
                backgroundImage: `url(${cat.image})`,
                boxShadow: 'inset 0 0 0 1px rgba(184,137,58,0.32)',
              }}
            />

            <div>
              <div className="display text-[10px] md:text-[11px] font-semibold tracking-[1.5px] uppercase text-[#1a1410]">
                {cat.name}
              </div>
              <div className="text-[9px] md:text-[10px] text-[#9a8c75] italic mt-1">
                {cat.count} Products
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}