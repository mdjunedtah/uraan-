'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUp, HelpCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed right-4 bottom-20 md:bottom-8 z-[150] flex flex-col items-center gap-3">
      <Link
        href="/contact"
        aria-label="Help & Support"
        className="w-11 h-11 rounded-full bg-[#b8893a] text-white grid place-items-center shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
      >
        <HelpCircle size={22} />
      </Link>
      <a
        href="https://wa.me/918851911653"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="w-14 h-14 rounded-full bg-[#16796F] text-white grid place-items-center shadow-[0_6px_18px_rgba(0,0,0,0.3)]"
      >
        <FaWhatsapp size={30} />
      </a>
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="w-12 h-12 rounded-full bg-[#232f63] text-white grid place-items-center shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
        >
          <ArrowUp size={22} />
        </button>
      )}
    </div>
  );
}
