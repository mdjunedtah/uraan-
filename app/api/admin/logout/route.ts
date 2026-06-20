import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/adminAuth';
import { createServerSupabase, isSupabaseAuthConfigured } from '@/lib/supabase/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });

  // Clear the legacy break-glass cookie.
  res.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  const legacyCookieCleared = res.cookies.get(ADMIN_COOKIE)?.value === '';

  // End the Supabase Auth session too (clears its auth cookies), if configured.
  const supabaseConfigured = isSupabaseAuthConfigured();
  let supabaseSignedOut = false;
  if (supabaseConfigured) {
    try {
      const supabase = createServerSupabase();
      await supabase.auth.signOut();
      supabaseSignedOut = true;
    } catch {
      /* nothing to sign out / not configured */
      supabaseSignedOut = false;
    }
  }

  // TEMP DEBUG (#8, #9): only booleans — confirms the session was destroyed and
  // the cookie cleared. Remove after diagnosing login.
  console.log('[ADMIN-LOGIN-DEBUG] logout', {
    legacyCookieCleared,
    supabaseConfigured,
    supabaseSessionDestroyed: supabaseSignedOut,
    sessionDestroyed: legacyCookieCleared && (!supabaseConfigured || supabaseSignedOut),
  });

  return res;
}
