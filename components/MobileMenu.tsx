'use client';

import Link from 'next/link';
import { X, Heart, ShoppingBag, User, Phone, Gem, ChevronRight } from 'lucide-react';
import { categories } from '@/data/jewelleryData';

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[200] backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-[340px] bg-white z-[201] transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-[#f8f2e6] px-6 py-7 border-b border-[rgba(184,137,58,0.18)] text-center relative">
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="absolute top-3 right-3 w-8 h-8 grid place-items-center text-[#6b5d4c]"
          >
            <X size={18} />
          </button>
          <div className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#b8893a] rotate-45" />
            <span className="display text-sm font-semibold tracking-[3px] text-[#1a1410]">
              OM GAURI PULTA
            </span>
            <span className="w-1.5 h-1.5 bg-[#b8893a] rotate-45" />
          </div>
          <div className="text-[8px] tracking-[3px] text-[#9a8c75] mt-2 uppercase">
            Gems · Jewellery · Rudraksh
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-3">
          {/* Main Links */}
          <div className="text-[9px] tracking-[2px] uppercase text-[#9a8c75] px-6 py-2 font-semibold">
            Browse
          </div>
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center justify-between px-6 py-3 text-sm hover:text-[#b8893a] hover:bg-[rgba(184,137,58,0.06)]"
          >
            Home <ChevronRight size={14} className="opacity-30" />
          </Link>
          <Link
            href="/collections"
            onClick={onClose}
            className="flex items-center justify-between px-6 py-3 text-sm hover:text-[#b8893a] hover:bg-[rgba(184,137,58,0.06)]"
          >
            All Products <ChevronRight size={14} className="opacity-30" />
          </Link>

          {/* Categories */}
          <div className="text-[9px] tracking-[2px] uppercase text-[#9a8c75] px-6 py-2 pt-5 font-semibold">
            Categories
          </div>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/collections?type=${cat.slug}`}
              onClick={onClose}
              className="flex items-center gap-3 px-6 py-3 text-sm hover:text-[#b8893a] hover:bg-[rgba(184,137,58,0.06)]"
            >
              <Gem size={14} className="text-[#b8893a]" />
              <span className="flex-1">{cat.name}</span>
              <span className="text-[10px] text-[#9a8c75]">{cat.count}</span>
            </Link>
          ))}

          {/* Account */}
          <div className="text-[9px] tracking-[2px] uppercase text-[#9a8c75] px-6 py-2 pt-5 font-semibold">
            Account
          </div>
          <Link href="/login" onClick={onClose} className="flex items-center gap-3 px-6 py-3 text-sm hover:text-[#b8893a] hover:bg-[rgba(184,137,58,0.06)]">
            <User size={14} /> Login / Register
          </Link>
          <Link href="/profile" onClick={onClose} className="flex items-center gap-3 px-6 py-3 text-sm hover:text-[#b8893a] hover:bg-[rgba(184,137,58,0.06)]">
            <User size={14} /> My Profile
          </Link>
          <Link href="/wishlist" onClick={onClose} className="flex items-center gap-3 px-6 py-3 text-sm hover:text-[#b8893a] hover:bg-[rgba(184,137,58,0.06)]">
            <Heart size={14} /> Wishlist
          </Link>
          <Link href="/cart" onClick={onClose} className="flex items-center gap-3 px-6 py-3 text-sm hover:text-[#b8893a] hover:bg-[rgba(184,137,58,0.06)]">
            <ShoppingBag size={14} /> Cart
          </Link>

          {/* Other */}
          <div className="text-[9px] tracking-[2px] uppercase text-[#9a8c75] px-6 py-2 pt-5 font-semibold">
            More
          </div>
          <Link href="/about" onClick={onClose} className="flex items-center justify-between px-6 py-3 text-sm hover:text-[#b8893a] hover:bg-[rgba(184,137,58,0.06)]">
            About Us <ChevronRight size={14} className="opacity-30" />
          </Link>
          <Link href="/contact" onClick={onClose} className="flex items-center justify-between px-6 py-3 text-sm hover:text-[#b8893a] hover:bg-[rgba(184,137,58,0.06)]">
            Contact <ChevronRight size={14} className="opacity-30" />
          </Link>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[rgba(184,137,58,0.18)] text-center">
          <div className="text-[10px] tracking-[1.5px] text-[#6b5d4c]">Need Help?</div>
          <a href="tel:+919876543210" className="text-sm font-semibold text-[#b8893a] mt-1 inline-flex items-center gap-2">
            <Phone size={12} /> +91 98765 43210
          </a>
        </div>
      </aside>
    </>
  );
}