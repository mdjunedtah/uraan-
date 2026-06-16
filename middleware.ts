import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE, adminSessionToken } from '@/lib/adminAuth';
import { isSupabaseAuthConfigured, createMiddlewareSupabase } from '@/lib/supabase/middleware';

// Protects every /admin route. Two ways to be authorised, checked in order:
//   1) Legacy admin cookie (always honoured — break-glass recovery login).
//   2) A valid Supabase Auth session whose email is an active row in
//      admin_users (the new, primary path once Supabase Auth is configured).
// The login page itself is always left open.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // 1) Legacy break-glass cookie.
  const legacyToken = request.cookies.get(ADMIN_COOKIE)?.value;
  if (legacyToken && legacyToken === (await adminSessionToken())) {
    return NextResponse.next();
  }

  // 2) Supabase Auth admin session (only when configured).
  if (isSupabaseAuthConfigured()) {
    const { supabase, response } = createMiddlewareSupabase(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) {
      // RLS lets an authenticated admin read only their own row.
      const { data: admin } = await supabase
        .from('admin_users')
        .select('role,status')
        .ilike('email', user.email)
        .maybeSingle();

      if (admin && admin.status === 'active') {
        return response; // carries any refreshed auth cookies
      }
    }
  }

  const loginUrl = new URL('/admin/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
