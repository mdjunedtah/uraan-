'use client';

import { FaInstagram } from "react-icons/fa";
import { instagramImages } from '@/data/jewelleryData';

export default function InstagramGallery() {
  return (
    <section className="py-14 px-4 max-w-7xl mx-auto">
      <p className="section-tag-italic">Follow Our Journey</p>
      <h2 className="section-heading">@omgauripulta</h2>
      <div className="luxury-divider">
        <FaInstagram size={10} />
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-6">
        {instagramImages.map((img, i) => (
          <a
            key={i}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="aspect-square bg-[#f8f2e6] relative group overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
              style={{ backgroundImage: `url(${img})` }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <FaInstagram
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                size={22}
              />
            </div>
          </a>
        ))}
      </div>

      <div className="text-center mt-6">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[11px] tracking-[2px] uppercase font-semibold text-[#b8893a] hover:text-[#7a5a1f]"
        >
          <FaInstagram size={14} /> Follow Us on Instagram
        </a>
      </div>
    </section>
  );
}