'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gem, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, ShieldCheck, KeyRound, MailCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/browser';
import { isSupabaseAuthConfigured } from '@/lib/supabase/config';

export default function AdminLoginPage() {
  const router = useRouter();
  const supabaseReady = isSupabaseAuthConfigured();
  const [recovery, setRecovery] = useState(!supabaseReady);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [mfa, setMfa] = useState<{ factorId: string } | null>(null);
  const [code, setCode] = useState('');

  // New-device approval (email OTP) step.
  const [deviceApproval, setDeviceApproval] = useState(false);
  const [dcode, setDcode] = useState('');

  const useSupabase = supabaseReady && !recovery;

  const finish = () => {
    router.push('/admin');
    router.refresh();
  };

  // Post-login security processing (records device/location, may require a
  // new-device email code). Falls through to finish() when no approval needed.
  const postLogin = async (): Promise<void> => {
    try {
      const res = await fetch('/api/admin/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = await res.json();
      if (res.ok && data.needsApproval) {
        setDeviceApproval(true);
        return;
      }
    } catch {
      /* proceed even if post-login processing fails */
    }
    finish();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (useSupabase) {
        const supabase = createClient();
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) {
          setError(authError.message || 'Invalid email or password.');
          return;
        }
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
          const { data: list } = await supabase.auth.mfa.listFactors();
          const totp = list?.totp?.find((f) => f.status === 'verified') || list?.totp?.[0];
          if (totp) {
            setMfa({ factorId: totp.id });
            return;
          }
        }
        await postLogin();
      } else {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok && data.ok) finish();
        else setError(data.error || 'Login failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfa) return;
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: vErr } = await supabase.auth.mfa.challengeAndVerify({ factorId: mfa.factorId, code: code.trim() });
      if (vErr) setError(vErr.message || 'Invalid code. Try again.');
      else await postLogin();
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/device/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: dcode }),
      });
      const data = await res.json();
      if (res.ok && data.ok) finish();
      else setError(data.error || 'Invalid or expired code.');
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const codeInputProps = {
    inputMode: 'numeric' as const,
    autoComplete: 'one-time-code',
    maxLength: 6,
    autoFocus: true,
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

        {deviceApproval ? (
          <form onSubmit={handleDeviceApprove} className="bg-white p-6 md:p-8">
            <h1 className="serif text-2xl text-[#1a1410] mb-1 flex items-center gap-2">
              <MailCheck size={20} className="text-[#b8893a]" /> Approve this device
            </h1>
            <p className="text-sm text-[#6b5d4c] mb-6">We emailed a 6-digit code to approve this new device.</p>
            {error && <div className="mb-4 flex items-center gap-2 bg-[#7a2e2e]/10 text-[#7a2e2e] text-sm p-3"><AlertCircle size={15} /> {error}</div>}
            <input {...codeInputProps} value={dcode} onChange={(e) => setDcode(e.target.value.replace(/\D/g, ''))} className="luxury-input tracking-[8px] text-center text-2xl mb-6" placeholder="••••••" />
            <button type="submit" disabled={loading || dcode.length !== 6} className="w-full py-3 bg-[#1a1410] text-[#e8d49b] text-[11px] tracking-[2px] uppercase font-semibold hover:bg-[#b8893a] hover:text-[#1a1410] disabled:opacity-60">
              {loading ? 'Verifying…' : 'Approve device'}
            </button>
          </form>
        ) : mfa ? (
          <form onSubmit={handleMfa} className="bg-white p-6 md:p-8">
            <h1 className="serif text-2xl text-[#1a1410] mb-1 flex items-center gap-2">
              <KeyRound size={20} className="text-[#b8893a]" /> Verify it&apos;s you
            </h1>
            <p className="text-sm text-[#6b5d4c] mb-6">Enter the 6-digit code from your authenticator app.</p>
            {error && <div className="mb-4 flex items-center gap-2 bg-[#7a2e2e]/10 text-[#7a2e2e] text-sm p-3"><AlertCircle size={15} /> {error}</div>}
            <input {...codeInputProps} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className="luxury-input tracking-[8px] text-center text-2xl mb-6" placeholder="••••••" />
            <button type="submit" disabled={loading || code.length !== 6} className="w-full py-3 bg-[#1a1410] text-[#e8d49b] text-[11px] tracking-[2px] uppercase font-semibold hover:bg-[#b8893a] hover:text-[#1a1410] disabled:opacity-60">
              {loading ? 'Verifying…' : 'Verify'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8">
            <h1 className="serif text-2xl text-[#1a1410] mb-1">Sign in</h1>
            <p className="text-sm text-[#6b5d4c] mb-6 flex items-center gap-1.5">
              {useSupabase ? <><ShieldCheck size={14} className="text-[#3d6b5a]" /> Secure sign-in</> : 'Enter your admin credentials to continue.'}
            </p>

            {error && <div className="mb-4 flex items-center gap-2 bg-[#7a2e2e]/10 text-[#7a2e2e] text-sm p-3"><AlertCircle size={15} /> {error}</div>}

            <label className="luxury-label">Email</label>
            <div className="relative mb-4">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8c75]" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="luxury-input pl-9" placeholder="admin@omgauripulta.com" autoComplete="username" />
            </div>

            <label className="luxury-label">Password</label>
            <div className="relative mb-6">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8c75]" />
              <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="luxury-input pl-9 pr-10" placeholder="Password" autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a8c75] hover:text-[#b8893a]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 bg-[#1a1410] text-[#e8d49b] text-[11px] tracking-[2px] uppercase font-semibold hover:bg-[#b8893a] hover:text-[#1a1410] inline-flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
              <LogIn size={15} /> {loading ? 'Signing in…' : 'Sign In'}
            </button>

            {supabaseReady && (
              <button type="button" onClick={() => { setRecovery((r) => !r); setError(''); }} className="w-full mt-4 text-[10px] tracking-[1.5px] uppercase text-[#9a8c75] hover:text-[#b8893a]">
                {recovery ? '← Back to secure sign-in' : 'Use recovery login'}
              </button>
            )}
          </form>
        )}

        <p className="text-center text-[11px] text-[#e8d49b]/50 mt-5">Protected area · authorised staff only</p>
      </div>
    </div>
  );
}
