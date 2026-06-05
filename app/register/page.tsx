'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/Footer';
import { User, Mail, Lock, Phone, Eye, EyeOff, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!agree) {
      alert('Please agree to terms');
      return;
    }
    alert('Registration — connect to your backend.');
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-3 text-[11px] text-[#9a8c75]">
        <Link href="/" className="text-[#b8893a] font-medium">Home</Link>
        <span className="mx-2 opacity-50">›</span>
        <span>Register</span>
      </div>

      <section className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <p className="text-[#b8893a] serif italic text-sm tracking-[2px] mb-1">Join Our Family</p>
          <h1 className="serif text-4xl text-[#1a1410]">Create Account</h1>
          <p className="text-sm text-[#6b5d4c] mt-2">
            Get 10% off your first order + exclusive previews.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-[rgba(184,137,58,0.18)] p-6 md:p-8 space-y-4">
          <div>
            <label className="luxury-label">Full Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8c75]" />
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="luxury-input pl-9" placeholder="Your name" />
            </div>
          </div>

          <div>
            <label className="luxury-label">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8c75]" />
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="luxury-input pl-9" placeholder="your@email.com" />
            </div>
          </div>

          <div>
            <label className="luxury-label">Phone</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8c75]" />
              <input type="tel" required pattern="[0-9]{10}" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="luxury-input pl-9" placeholder="10 digit mobile" />
            </div>
          </div>

          <div>
            <label className="luxury-label">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8c75]" />
              <input type={showPassword ? 'text' : 'password'} required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="luxury-input pl-9 pr-10" placeholder="Min 6 characters" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a8c75]">
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="luxury-label">Confirm Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8c75]" />
              <input type={showPassword ? 'text' : 'password'} required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="luxury-input pl-9" placeholder="Re-enter password" />
            </div>
          </div>

          <label className="flex items-start gap-2 cursor-pointer text-xs">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="accent-[#b8893a] mt-1" />
            <span className="text-[#6b5d4c]">
              I agree to the <a href="#" className="text-[#b8893a] underline">Terms of Service</a> and <a href="#" className="text-[#b8893a] underline">Privacy Policy</a>
            </span>
          </label>

          <button type="submit" className="w-full bg-[#1a1410] text-[#e8d49b] py-3 text-[11px] tracking-[3px] uppercase font-semibold hover:bg-[#b8893a] hover:text-[#1a1410] flex items-center justify-center gap-2">
            Create Account <ChevronRight size={14} />
          </button>

          <div className="bg-[#f8f2e6] p-3 text-xs text-[#6b5d4c] text-center">
            <CheckCircle2 size={14} className="text-[#3d6b5a] inline mr-1" />
            Get 10% off your first order!
          </div>
        </form>

        <p className="text-center mt-6 text-sm text-[#6b5d4c]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#b8893a] font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </section>

      <Footer />
    </main>
  );
}