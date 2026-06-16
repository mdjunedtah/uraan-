import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE, adminSessionToken } from '@/lib/adminAuth';
import { isSupabaseAuthConfigured, createMiddlewareSupabase } from '@/lib/supabase/middleware';
import { assertSameOrigin } from '@/lib/security/csrf';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── CSRF protection for API mutations (#28). External webhooks are exempt
  //    because they legitimately arrive cross-origin. ──
  if (pathname.startsWith('/api/')) {
    const method = request.method.toUpperCase();
    const isMutation = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';
    const isWebhook = pathname.startsWith('/api/whatsapp/webhook');
    if (isMutation && !isWebhook && !assertSameOrigin(request)) {
      return NextResponse.json({ ok: false, error: 'Invalid origin.' }, { status: 403 });
    }
    return NextResponse.next();
  }

  // ── /admin route protection ──
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
      const { data: admin } = await supabase
        .from('admin_users')
        .select('role,status')
        .ilike('email', user.email)
        .maybeSingle();

      if (admin && admin.status === 'active') {
        return response;
      }
    }
  }

  return NextResponse.redirect(new URL('/admin/login', request.url));
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
