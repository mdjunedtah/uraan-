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
      // TEMP DEBUG: a same-origin failure here blocks the login POST with 403
      // BEFORE it ever reaches the login route. Only booleans are logged.
      if (pathname.startsWith('/api/admin')) {
        console.log('[ADMIN-LOGIN-DEBUG] middleware/csrf', { pathname, sameOriginPassed: false, allowedToRoute: false });
      }
      return NextResponse.json({ ok: false, error: 'Invalid origin.' }, { status: 403 });
    }
    // TEMP DEBUG: confirms admin API mutations (incl. /api/admin/login) cleared CSRF.
    if (isMutation && pathname.startsWith('/api/admin')) {
      console.log('[ADMIN-LOGIN-DEBUG] middleware/csrf', { pathname, sameOriginPassed: true, allowedToRoute: true });
    }
    return NextResponse.next();
  }

  // ── /admin route protection ──
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // 1) Legacy break-glass cookie.
  const legacyToken = request.cookies.get(ADMIN_COOKIE)?.value;
  const legacyAllowed = Boolean(legacyToken) && legacyToken === (await adminSessionToken());
  if (legacyAllowed) {
    // TEMP DEBUG (#7): middleware allowed access via the legacy cookie.
    console.log('[ADMIN-LOGIN-DEBUG] middleware/admin', { pathname, allowedVia: 'legacy', allowed: true });
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
        // TEMP DEBUG (#7): middleware allowed access via the Supabase session.
        console.log('[ADMIN-LOGIN-DEBUG] middleware/admin', { pathname, allowedVia: 'supabase', allowed: true });
        return response;
      }
    }
  }

  // TEMP DEBUG (#7): middleware denied access — redirecting to /admin/login.
  console.log('[ADMIN-LOGIN-DEBUG] middleware/admin', {
    pathname,
    legacyCookiePresent: Boolean(legacyToken),
    supabaseConfigured: isSupabaseAuthConfigured(),
    allowed: false,
    action: 'redirect_to_login',
  });
  return NextResponse.redirect(new URL('/admin/login', request.url));
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
