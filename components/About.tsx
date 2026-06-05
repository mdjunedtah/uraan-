'use client';

import Link from 'next/link';
import { ChevronRight, Gem, Award, Heart, Star } from 'lucide-react';

export default function About() {
  return (
    <>
      {/* Heritage Section */}
      <section className="bg-[#f8f2e6] py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div
            className="aspect-[4/5] bg-cover bg-center"
            style={{ backgroundImage: 'url(/images/model.jpg)' }}
          />
          <div>
            <p className="section-tag-italic !text-left">Our Heritage</p>
            <h2 className="serif text-3xl md:text-4xl text-[#1a1410] mb-4 leading-tight">
              A Legacy of <em className="gold-text">Trust</em>
              <br />Since Generations
            </h2>
            <p className="text-sm text-[#6b5d4c] leading-relaxed mb-4">
              At Om Gauri Pulta, every ornament tells a story — of devotion,
              of craftsmanship, of celebrations. Three generations of master
              artisans handcraft each piece with care, ensuring purity of
              gold, brilliance of gems, and authenticity of every Rudraksh bead.
            </p>
            <p className="text-sm text-[#6b5d4c] leading-relaxed mb-6">
              From bridal masterpieces to spiritual blessings, we honour the
              richness of Indian tradition while embracing modern elegance.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-[11px] tracking-[3px] uppercase font-semibold border-b border-[#1a1410] pb-1 hover:text-[#b8893a] hover:border-[#b8893a]"
            >
              Read Our Story <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#fbf8f1] py-12 px-4 border-y border-[rgba(184,137,58,0.18)]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: '25+', label: 'Years of Trust', icon: Award },
            { num: '10K+', label: 'Happy Customers', icon: Heart },
            { num: '500+', label: 'Unique Designs', icon: Gem },
            { num: '4.9★', label: 'Average Rating', icon: Star },
          ].map((s, i) => (
            <div key={i} className="text-center bg-white p-5 border border-[rgba(184,137,58,0.18)]">
              <s.icon className="text-[#b8893a] mx-auto mb-2" size={22} />
              <div className="serif text-3xl text-[#1a1410] font-semibold">{s.num}</div>
              <div className="text-[10px] tracking-[1.5px] uppercase text-[#9a8c75] mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}