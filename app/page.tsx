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
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube, } from "react-icons/fa";

export default function HomePage() {
  const trending = getSaleProducts(6);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <CartDrawer />

      {/* 1. HERO SLIDER */}
      <Hero />

      {/* 2. TRUST STRIP */}
      <section className="bg-[#fbf8f1] border-y border-[rgba(184,137,58,0.18)]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            { icon: Truck, title: 'Free Shipping', sub: 'On orders above ₹1999' },
            { icon: ShieldCheck, title: 'Certified', sub: '100% Hallmarked' },
            { icon: RotateCw, title: 'Easy Returns', sub: '7 days policy' },
            { icon: Lock, title: 'Secure Pay', sub: '100% Safe Checkout' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center py-6 px-4 border-r border-[rgba(184,137,58,0.18)] last:border-r-0"
            >
              <item.icon className="text-[#b8893a] mb-2" size={22} />
              <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-[#1a1410]">
                {item.title}
              </div>
              <div className="text-[10px] text-[#9a8c75] mt-1">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY */}
      <Categories />

      {/* 4. SIGNATURE COLLECTIONS BANNER */}
      <section className="px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/collections?type=bridal"
            className="relative h-64 md:h-80 overflow-hidden group bg-[#f8f2e6]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10" />
            <div
              className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
              style={{ backgroundImage: 'url(/images/bridal-set.jpg)' }}
            />
            <div className="absolute inset-0 flex flex-col justify-center px-8 z-20 text-white">
              <p className="text-xs italic text-[#e8d49b] tracking-[3px] mb-2">SIGNATURE</p>
              <h3 className="serif text-4xl md:text-5xl mb-3">Bridal Collection</h3>
              <p className="text-xs opacity-80 max-w-[220px] mb-4">
                Heirloom pieces for your sacred day
              </p>
              <span className="text-[10px] tracking-[3px] border-b border-[#e8d49b] inline-block pb-1 w-fit">
                EXPLORE NOW
              </span>
            </div>
          </Link>
          <Link
            href="/collections?type=rudraksh"
            className="relative h-64 md:h-80 overflow-hidden group bg-[#f8f2e6]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10" />
            <div
              className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
              style={{ backgroundImage: 'url(/images/luxury-bg.jpg)' }}
            />
            <div className="absolute inset-0 flex flex-col justify-center px-8 z-20 text-white">
              <p className="text-xs italic text-[#e8d49b] tracking-[3px] mb-2">SACRED</p>
              <h3 className="serif text-4xl md:text-5xl mb-3">Rudraksh</h3>
              <p className="text-xs opacity-80 max-w-[220px] mb-4">
                Authentic, certified spiritual treasures
              </p>
              <span className="text-[10px] tracking-[3px] border-b border-[#e8d49b] inline-block pb-1 w-fit">
                DISCOVER
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. NEW ARRIVALS / TRENDING */}
      <Trending />

      {/* 6. SHOP BY BUDGET */}
      <section className="py-12 px-4 bg-[#fbf8f1]">
        <div className="max-w-7xl mx-auto">
          <p className="section-tag-italic">Find Your Perfect Piece</p>
          <h2 className="section-heading">Shop By Budget</h2>
          <div className="luxury-divider">
            <Wallet size={10} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
            {[
              { label: 'Under ₹4,999', range: '999-4999', count: '120+' },
              { label: '₹5,000 - ₹9,999', range: '5000-9999', count: '85+' },
              { label: '₹10,000 - ₹24,999', range: '10000-24999', count: '60+' },
              { label: 'Above ₹25,000', range: 'above-25000', count: '40+' },
            ].map((b, i) => (
              <Link
                key={i}
                href={`/collections?price=${b.range}`}
                className="luxury-card p-5 md:p-6 text-center"
              >
                <div className="text-[10px] tracking-[2px] uppercase text-[#9a8c75] mb-2">
                  Budget
                </div>
                <div className="serif text-lg md:text-xl text-[#1a1410] font-semibold mb-1">
                  {b.label}
                </div>
                <div className="text-[10px] text-[#b8893a] tracking-[1px]">
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