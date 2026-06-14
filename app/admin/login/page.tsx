'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gem, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1410] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Gem className="text-[#b8893a]" size={26} />
            <span className="display text-xl tracking-[3px] font-semibold text-white">OM GAURI</span>
          </div>
          <p className="text-[10px] tracking-[3px] text-[#b8893a] uppercase">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8">
          <h1 className="serif text-2xl text-[#1a1410] mb-1">Sign in</h1>
          <p className="text-sm text-[#6b5d4c] mb-6">Enter your admin credentials to continue.</p>

          {error && (
            <div className="mb-4 flex items-center gap-2 bg-[#7a2e2e]/10 text-[#7a2e2e] text-sm p-3">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <label className="luxury-label">Email</label>
          <div className="relative mb-4">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8c75]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="luxury-input pl-9"
              placeholder="admin@omgauripulta.com"
              autoComplete="username"
            />
          </div>

          <label className="luxury-label">Password</label>
          <div className="relative mb-6">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8c75]" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="luxury-input pl-9 pr-10"
              placeholder="Password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a8c75] hover:text-[#b8893a]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1a1410] text-[#e8d49b] text-[11px] tracking-[2px] uppercase font-semibold hover:bg-[#b8893a] hover:text-[#1a1410] inline-flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
          >
            <LogIn size={15} /> {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[11px] text-[#e8d49b]/50 mt-5">
          Protected area · authorised staff only
        </p>
      </div>
    </div>
  );
}
