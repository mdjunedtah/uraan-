'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/Footer';
import { Mail, Lock, Eye, EyeOff, ChevronRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { loginUser, getCurrentUser } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getCurrentUser()) router.replace('/profile');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await loginUser(form.email, form.password);
    setLoading(false);
    if (res.ok) {
      router.push('/profile');
    } else {
      setError(res.error);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-3 text-[11px] text-[#9a8c75]">
        <Link href="/" className="text-[#b8893a] font-medium">Home</Link>
        <span className="mx-2 opacity-50">›</span>
        <span>Login</span>
      </div>

      <section className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <p className="text-[#b8893a] serif italic text-sm tracking-[2px] mb-1">Welcome Back</p>
          <h1 className="serif text-4xl text-[#1a1410]">Login</h1>
          <p className="text-sm text-[#6b5d4c] mt-2">
            Sign in to access your account, orders, and wishlist.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-[rgba(184,137,58,0.18)] p-6 md:p-8 space-y-5">
          <div>
            <label className="luxury-label">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8c75]" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="luxury-input pl-9"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="luxury-label">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8c75]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="luxury-input pl-9 pr-10"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a8c75] hover:text-[#1a1410]"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-[#b8893a]" />
              <span className="text-[#6b5d4c]">Remember me</span>
            </label>
            <a href="#" className="text-[#b8893a] hover:underline">Forgot password?</a>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-[#b91c1c]/10 border border-[#b91c1c]/30 text-[#b91c1c] text-xs p-3 rounded">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1410] text-[#e8d49b] py-3 text-[11px] tracking-[3px] uppercase font-semibold hover:bg-[#b8893a] hover:text-[#1a1410] flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            {loading ? 'Signing In…' : 'Sign In'} <ChevronRight size={14} />
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#9a8c75]">
            <ShieldCheck size={12} className="text-[#3d6b5a]" />
            <span className="tracking-[1px] uppercase">Secure login · Password encrypted, never stored as text</span>
          </div>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(184,137,58,0.18)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-[10px] tracking-[2px] uppercase text-[#9a8c75]">Or</span>
            </div>
          </div>

          <div className="space-y-2">
            <button type="button" className="w-full py-3 border border-[rgba(184,137,58,0.32)] text-[11px] tracking-[1.5px] uppercase font-semibold hover:bg-[#f8f2e6]">
              Continue with Google
            </button>
            <button type="button" className="w-full py-3 border border-[rgba(184,137,58,0.32)] text-[11px] tracking-[1.5px] uppercase font-semibold hover:bg-[#f8f2e6]">
              Continue with Facebook
            </button>
          </div>
        </form>

        <p className="text-center mt-6 text-sm text-[#6b5d4c]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#b8893a] font-semibold hover:underline">
            Register Here
          </Link>
        </p>
      </section>

      <Footer />
    </main>
  );
}