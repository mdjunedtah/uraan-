'use client';

import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/hero';
import Categories from '@/components/Categories';
import Bestseller from '@/components/Bestseller';
import Trending from '@/components/Trending';
import Testimonials from '@/components/Testimonials';
import InstagramGallery from '@/components/InstagramGallery';
import Newsletter from '@/components/Newsletter';
import About from '@/components/About';
import CartDrawer from '@/components/CartDrawer';
import ProductCard from '@/components/ProductCard';
import { getSaleProducts } from '@/lib/products';
import {
  Truck,
  ShieldCheck,
  RotateCw,
  Lock,
  Wallet,
  CreditCard,
  Smartphone,
  Banknote,
  ChevronRight,
  Sparkles,
  MessageCircle,
  Diamond,
  Gift,
  ShoppingBag,
  Package,
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube, } from "react-icons/fa";

// Delicate gold leaf-branch corner ornament for the "Shop By Budget" section.
function LeafBranch({ className }: { className?: string }) {
  const leaves = [
    { x: 15, y: 20, r: -50 },
    { x: 38, y: 46, r: 135 },
    { x: 26, y: 74, r: -40 },
    { x: 50, y: 100, r: 140 },
    { x: 38, y: 128, r: -35 },
    { x: 62, y: 150, r: 130 },
  ];
  return (
    <svg viewBox="0 0 100 170" className={className} fill="none" aria-hidden="true">
      <path d="M8 6 C 50 45, 25 95, 68 164" stroke="#d4a857" strokeWidth="1.4" />
      {leaves.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.r})`}>
          <path d="M0 0 C 6 -6 17 -6 23 0 C 17 6 6 6 0 0 Z" stroke="#d4a857" strokeWidth="1.1" />
          <path d="M2 0 L 21 0" stroke="#d4a857" strokeWidth="0.9" />
        </g>
      ))}
    </svg>
  );
}

// Glossy 3D-style budget icons (green wallet, blue price tag, purple
// shopping bag, gold diamond) to match the luxury reference design.
function WalletIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-9 h-9 drop-shadow-[0_2px_3px_rgba(0,0,0,0.18)]" aria-hidden="true">
      <defs>
        <linearGradient id="walletBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#62B488" />
          <stop offset="100%" stopColor="#2C7A50" />
        </linearGradient>
      </defs>
      <rect x="20" y="13" width="26" height="13" rx="2.5" fill="#FBEFD3" />
      <rect x="22" y="16" width="22" height="2.4" rx="1.2" fill="#D8B873" />
      <rect x="11" y="20" width="42" height="29" rx="6.5" fill="url(#walletBody)" />
      <path d="M11 27 a6.5 6.5 0 0 1 6.5 -7 H53 v7 Z" fill="#FFFFFF" opacity="0.16" />
      <rect x="11" y="33" width="42" height="2.6" fill="#000000" opacity="0.1" />
      <circle cx="45" cy="38" r="4" fill="#FBEFD3" />
      <circle cx="45" cy="38" r="1.7" fill="#2C7A50" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-9 h-9 drop-shadow-[0_2px_3px_rgba(0,0,0,0.18)]" aria-hidden="true">
      <defs>
        <linearGradient id="tagBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5C92D4" />
          <stop offset="100%" stopColor="#2B5790" />
        </linearGradient>
      </defs>
      <path d="M15 17 Q24 11 31 19" stroke="#C9A24A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <g transform="rotate(45 33 33)">
        <rect x="21" y="21" width="24" height="24" rx="5.5" fill="url(#tagBody)" />
        <rect x="21" y="21" width="24" height="9" rx="5.5" fill="#FFFFFF" opacity="0.15" />
        <circle cx="27" cy="27" r="3" fill="#EAF1FB" />
      </g>
      <text x="33" y="41" textAnchor="middle" fontSize="17" fontWeight="700" fill="#FFFFFF" fontFamily="serif">₹</text>
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-9 h-9 drop-shadow-[0_2px_3px_rgba(0,0,0,0.18)]" aria-hidden="true">
      <defs>
        <linearGradient id="bagBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9E72E2" />
          <stop offset="100%" stopColor="#6B3CBD" />
        </linearGradient>
      </defs>
      <path d="M23 23 a9 9 0 0 1 18 0" stroke="#C9A24A" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d="M19 22 H45 L48 47 a4 4 0 0 1 -4 4 H23 a4 4 0 0 1 -4 -4 Z" fill="url(#bagBody)" />
      <path d="M19 22 H45 L45.7 28 H18.3 Z" fill="#FFFFFF" opacity="0.16" />
      <rect x="24" y="29" width="4.5" height="17" rx="2.25" fill="#FFFFFF" opacity="0.18" />
    </svg>
  );
}

function GemIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-9 h-9 drop-shadow-[0_2px_3px_rgba(0,0,0,0.18)]" aria-hidden="true">
      <defs>
        <linearGradient id="gemBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F1D079" />
          <stop offset="100%" stopColor="#C5942A" />
        </linearGradient>
      </defs>
      <path d="M15 26 L22 15 H42 L49 26 L32 52 Z" fill="url(#gemBody)" />
      <g stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="1.1">
        <path d="M15 26 H49" />
        <path d="M22 15 L27 26 L32 52" />
        <path d="M42 15 L37 26 L32 52" />
        <path d="M27 26 H37" />
      </g>
    </svg>
  );
}

export default function HomePage() {
  const trending = getSaleProducts(6);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <CartDrawer />

      {/* 1. HERO SLIDER */}
      <Hero />

      {/* 2. TRUST STRIP */}
      <section className="bg-[#3a2f24] border-y border-[rgba(184,137,58,0.18)]">
        <div className="max-w-7xl mx-auto grid grid-cols-4">
          {[
            { icon: Truck, title: 'Free Shipping', sub: 'Complimentary Above ₹1,999' },
            { icon: ShieldCheck, title: 'Certified', sub: 'BIS Hallmarked Purity' },
            { icon: RotateCw, title: 'Easy Returns', sub: '7-Day Hassle-Free' },
            { icon: Lock, title: 'Secure Pay', sub: '256-bit SSL Encrypted' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center py-5 md:py-6 px-1.5 md:px-4 border-r border-[rgba(184,137,58,0.18)] last:border-r-0"
            >
              <item.icon className="text-[#b8893a] mb-2" size={22} />
              <div className="text-[8px] md:text-[10px] font-semibold tracking-[1px] md:tracking-[1.5px] uppercase text-[#e8d49b]">
                {item.title}
              </div>
              <div className="text-[8px] md:text-[10px] text-[#e8d49b]/60 mt-1 leading-tight">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY */}
      <Categories />

      {/* 4. SIGNATURE COLLECTION VIDEO */}
      <section className="relative">
        <div className="relative h-[560px] md:h-[680px] overflow-hidden bg-[#1a1410]">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/videos/signature-collection-poster.jpg"
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/signature-collection.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/30 to-black/75" />

          <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-6 pb-12 md:pb-16">
            <p className="text-xs md:text-sm italic text-[#e8d49b] tracking-[4px] uppercase mb-3">
              Signature Collection
            </p>
            <h2 className="serif text-4xl md:text-6xl text-white leading-[1.15] mb-1">
              Timeless Jewellery
            </h2>
            <h2 className="serif text-2xl md:text-5xl text-white leading-[1.15] mb-2 whitespace-nowrap">
              Crafted For Every Celebration
            </h2>
            <div className="luxury-divider !my-4 before:bg-[#e8d49b]/40 after:bg-[#e8d49b]/40 text-[#e8d49b]">
              <Sparkles size={12} />
            </div>
            <p className="text-sm text-white/80 mb-6">
              Exquisite designs. Eternal elegance.
            </p>
            <Link
              href="/collections"
              className="inline-flex items-center px-10 py-3 bg-[#b8893a] text-[#1a1410] text-[11px] tracking-[3px] uppercase font-medium hover:bg-[#e8d49b] transition-all"
            >
              Explore Collection
            </Link>
          </div>
        </div>

        <div className="bg-[#1a1410] grid grid-cols-3 divide-x divide-[rgba(184,137,58,0.18)]">
          {[
            { icon: Diamond, line1: 'Certified', line2: 'Authentic' },
            { icon: ShieldCheck, line1: 'Lifetime', line2: 'Assurance' },
            { icon: Gift, line1: 'Premium', line2: 'Gifting' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center py-5 md:py-6 px-2">
              <item.icon className="text-[#b8893a] mb-2" size={20} />
              <div className="text-[9px] md:text-[10px] tracking-[1.5px] uppercase text-[#e8d49b] font-medium leading-snug">
                {item.line1}<br />{item.line2}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. NEW ARRIVALS / TRENDING */}
      <Trending />

      {/* 6. SHOP BY BUDGET */}
      <section className="relative overflow-hidden py-12 px-4 bg-gradient-to-br from-[#fdf6ea] via-[#fbf3e3] to-[#f5e8d3]">
        <LeafBranch className="pointer-events-none select-none absolute top-0 left-0 w-24 md:w-40 opacity-50" />
        <LeafBranch className="pointer-events-none select-none absolute top-0 right-0 w-24 md:w-40 opacity-50 -scale-x-100" />

        <div className="max-w-7xl mx-auto relative">
          <p className="section-tag-italic">Find Your Perfect Piece</p>
          <h2 className="section-heading">Shop By Budget</h2>
          <div className="luxury-divider">
            <span className="w-7 h-7 rounded-full border border-[#b8893a]/40 flex items-center justify-center">
              <ShoppingBag size={12} />
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-6">
            {[
              { label: 'Under ₹4,999', range: '999-4999', count: '120+', Icon: WalletIcon, light: '#DCEFE2', deep: '#BFE1CE', accent: '#3E9C73' },
              { label: '₹5,000 - ₹9,999', range: '5000-9999', count: '85+', Icon: TagIcon, light: '#DDEAFB', deep: '#C3D8F5', accent: '#3D6FA8' },
              { label: '₹10,000 - ₹24,999', range: '10000-24999', count: '60+', Icon: BagIcon, light: '#EAE0FA', deep: '#D7C5F3', accent: '#8856D6' },
              { label: 'Above ₹25,000', range: 'above-25000', count: '40+', Icon: GemIcon, light: '#F8EDCB', deep: '#EEDDA6', accent: '#A6790C' },
            ].map((b, i) => (
              <Link
                key={i}
                href={`/collections?price=${b.range}`}
                className="luxury-card rounded-2xl p-4 md:p-7 text-center flex flex-col items-center"
              >
                <div
                  className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-full flex items-center justify-center mb-3 md:mb-4"
                  style={{
                    background: `radial-gradient(circle at 34% 28%, ${b.light} 0%, ${b.deep} 100%)`,
                    boxShadow: `inset 0 1px 2px rgba(255,255,255,0.7), inset 0 0 0 1px ${b.accent}33, 0 6px 14px ${b.accent}26`,
                  }}
                >
                  <b.Icon />
                </div>
                <div
                  className="flex items-center gap-2 text-[9px] md:text-[10px] tracking-[2px] uppercase font-semibold mb-2"
                  style={{ color: b.accent }}
                >
                  <span className="h-px w-3 md:w-4 opacity-50" style={{ backgroundColor: b.accent }} />
                  Budget
                  <span className="h-px w-3 md:w-4 opacity-50" style={{ backgroundColor: b.accent }} />
                </div>
                <div className="serif text-lg md:text-2xl text-[#1a1410] font-normal mb-3 whitespace-nowrap">
                  {b.label}
                </div>
                <div className="flex items-center gap-2 w-full mb-3">
                  <span className="h-px flex-1 bg-[#b8893a]/25" />
                  <span className="w-1.5 h-1.5 rotate-45 bg-[#b8893a] shrink-0" />
                  <span className="h-px flex-1 bg-[#b8893a]/25" />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] md:text-sm font-medium" style={{ color: b.accent }}>
                  <Package size={14} />
                  {b.count} Products
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BESTSELLERS */}
      <Bestseller />

      {/* 8. RUDRAKSH FEATURE BLOCK (dark) */}
      <section className="px-4 md:px-8 py-12">
        <div className="max-w-7xl mx-auto bg-[#1a1410] text-[#e8d49b] py-12 px-6 md:px-12 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 flex items-center justify-center text-[280px] md:text-[400px] text-[#b8893a] opacity-[0.04] font-serif leading-none"
            aria-hidden="true"
          >
            ॐ
          </div>
          <div className="relative z-10">
            <p className="serif italic text-[#d4a857] text-sm tracking-[3px] uppercase mb-3">
              Sacred · Authentic · Blessed
            </p>
            <h2 className="serif text-4xl md:text-5xl text-white font-normal mb-4">
              Authentic <em className="text-[#d4a857]">Rudraksh</em>
            </h2>
            <p className="text-xs md:text-sm text-[#e8d49b]/70 leading-relaxed max-w-md mx-auto mb-6">
              Certified beads sourced from Nepal & Indonesia. From 1 Mukhi to 21 Mukhi —
              for prosperity, peace, and protection.
            </p>
            <Link
              href="/collections?type=rudraksh"
              className="inline-flex items-center gap-2 px-7 py-3 border border-[#b8893a] text-[#d4a857] text-[10px] tracking-[3px] uppercase font-medium hover:bg-[#b8893a] hover:text-[#1a1410] transition-all"
            >
              Explore Sacred Collection <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* 9. TRENDING NOW (sale products) */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <p className="section-tag-italic">Most Loved This Season</p>
        <h2 className="section-heading">Trending Now</h2>
        <div className="luxury-divider">
          <Sparkles size={10} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 mt-6">
          {trending.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 10 + 11. ABOUT + STATS */}
      <About />

      {/* 12. CUSTOMER REVIEWS */}
      <Testimonials />

      {/* 13. PAYMENT OPTIONS */}
      <section className="py-14 px-4 max-w-7xl mx-auto">
        <p className="section-tag-italic">Safe · Secure · Seamless</p>
        <h2 className="section-heading">Payment Options</h2>
        <div className="luxury-divider">
          <CreditCard size={10} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
          {[
            { icon: CreditCard, title: 'Cards', desc: 'Visa, Mastercard, Rupay, Amex' },
            { icon: Smartphone, title: 'UPI', desc: 'GPay, PhonePe, Paytm, BHIM' },
            { icon: Wallet, title: 'Wallets', desc: 'Paytm, Amazon Pay, Mobikwik' },
            { icon: Banknote, title: 'Net Banking & EMI', desc: 'All major banks + No-cost EMI' },
          ].map((p, i) => (
            <div key={i} className="luxury-card p-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#f8f2e6] flex items-center justify-center">
                <p.icon className="text-[#b8893a]" size={22} />
              </div>
              <div className="display text-sm tracking-[2px] uppercase text-[#1a1410] mb-2">
                {p.title}
              </div>
              <div className="text-[11px] text-[#6b5d4c] leading-relaxed">{p.desc}</div>
            </div>
          ))}
        </div>

        {/* Payment Logos Strip */}
        <div className="mt-8 bg-[#fbf8f1] border border-[rgba(184,137,58,0.18)] py-5 px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[#1a1410]">
            {['VISA', 'Mastercard', 'RuPay', 'Amex', 'UPI', 'GPay', 'PhonePe', 'Paytm', 'Razorpay'].map(
              (p, i) => (
                <div
                  key={i}
                  className="display text-xs md:text-sm tracking-[2px] text-[#3a2f24] font-semibold opacity-70"
                >
                  {p}
                </div>
              )
            )}
          </div>
          <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-[#9a8c75]">
            <Lock size={11} className="text-[#3d6b5a]" />
            <span className="tracking-[1.5px] uppercase">
              256-bit SSL Encrypted · 100% Secure Checkout
            </span>
          </div>
        </div>
      </section>

      {/* 14. INSTAGRAM GALLERY */}
      <InstagramGallery />

      {/* 15. NEWSLETTER */}
      <Newsletter />

      {/* 16. SOCIAL CONTACT STRIP */}
      <section className="bg-[#fbf8f1] py-8 px-4 border-t border-[rgba(184,137,58,0.18)]">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-10 text-center">
          {[
            { icon: FaInstagram, label: 'Instagram', href: 'https://instagram.com' },
            { icon: FaFacebook, label: 'Facebook', href: 'https://facebook.com' },
            { icon: FaYoutube, label: 'YouTube', href: 'https://youtube.com' },
            { icon: MessageCircle, label: 'WhatsApp', href: 'https://wa.me/919876543210' },
          ].map((s, i) => (
            <a
              key={i}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 group"
            >
              <s.icon
                className="text-[#1a1410] group-hover:text-[#b8893a] transition-colors"
                size={20}
              />
              <span className="text-[10px] tracking-[1.5px] uppercase text-[#6b5d4c]">
                {s.label}
              </span>
            </a>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}