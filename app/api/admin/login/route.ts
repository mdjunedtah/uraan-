import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminSessionToken, verifyAdmin, debugLoginChecks } from '@/lib/adminAuth';
import { getClientIp, parseUserAgent, deviceFingerprint } from '@/lib/security/request';
import { checkLockout, recordAttempt } from '@/lib/security/rateLimit';
import { logAudit, logSecurityEvent } from '@/lib/audit';
import { getGeo, geoLabel } from '@/lib/security/geo';
import { upsertDevice } from '@/lib/security/devices';
import { sendEmail, isEmailConfigured } from '@/lib/email';
import { loginAlertEmail } from '@/lib/security/emails';

// ───────────────────────── TEMP DEBUG (remove after diagnosing login) ──────
// Module-scoped so it survives across requests within ONE warm serverless
// instance — this lets us compare the FIRST vs a SECOND login attempt (#10).
// Resets to 0 on a cold start, which is itself useful signal in the logs.
let __debugAttempt = 0;
let __debugLastOutcome: 'success' | 'fail' | null = null;
// ────────────────────────────────────────────────────────────────────────────

// This route runs on the Node.js runtime (default for route handlers) so the
// Supabase service-role client used by the security helpers works. Every helper
// fails open, so login behaves exactly as before when the DB is unavailable.
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || '';

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const email = String(body.email || '').trim();
  const password = String(body.password || '');

  // ───────────────────────── TEMP DEBUG (remove later) ─────────────────────
  // Logs ONLY boolean status — never the email, password, secret, token, or any
  // env-var VALUE. Tag "[ADMIN-LOGIN-DEBUG]" makes it greppable in Vercel logs.
  __debugAttempt += 1;
  const debugOutcome = (outcome: 'success' | 'fail') => {
    console.log('[ADMIN-LOGIN-DEBUG] outcome', {
      attemptNumberThisInstance: __debugAttempt,
      isFirstAttemptThisInstance: __debugAttempt === 1,
      outcome,
      previousOutcome: __debugLastOutcome,
      behavesDifferentlyFromPreviousAttempt:
        __debugLastOutcome !== null && __debugLastOutcome !== outcome,
    });
    __debugLastOutcome = outcome;
  };
  console.log('[ADMIN-LOGIN-DEBUG] env+input', {
    attemptNumberThisInstance: __debugAttempt,
    ...debugLoginChecks(email, password),
  });
  // ──────────────────────────────────────────────────────────────────────────

  // Brute-force protection: refuse while the account is locked.
  const lock = await checkLockout(email);
  console.log('[ADMIN-LOGIN-DEBUG] lockout', {
    accountLocked: lock.locked,
    permanentLock: Boolean(lock.permanent),
  });
  if (lock.locked) {
    debugOutcome('fail');
    await logSecurityEvent({
      type: 'login_blocked',
      severity: 'warning',
      email,
      ip,
      userAgent,
      metadata: { permanent: Boolean(lock.permanent) },
    });
    const error = lock.permanent
      ? 'Account locked. Contact an administrator.'
      : 'Too many attempts. Please try again later.';
    return NextResponse.json({ ok: false, error }, { status: 429 });
  }

  const verifyPassed = verifyAdmin(email, password);
  console.log('[ADMIN-LOGIN-DEBUG] verify', { verifyAdminPassed: verifyPassed });
  if (!verifyPassed) {
    debugOutcome('fail');
    const { lockedNow, permanent } = await recordAttempt({
      email,
      ip,
      userAgent,
      success: false,
      reason: 'bad_credentials',
    });
    await logSecurityEvent({
      type: lockedNow ? 'account_locked' : 'login_failed',
      severity: lockedNow ? 'critical' : 'warning',
      email,
      ip,
      userAgent,
      metadata: { permanent },
    });
    // Generic message — never reveal whether the email or the password was wrong.
    return NextResponse.json({ ok: false, error: 'Invalid email or password.' }, { status: 401 });
  }

  await recordAttempt({ email, ip, userAgent, success: true });
  await logAudit({ actorEmail: email, action: 'admin_login', ip, userAgent, metadata: { via: 'legacy' } });

  // Recovery login is always trusted (break-glass); record the device and send
  // a login alert when email is configured.
  const dev = parseUserAgent(userAgent);
  await upsertDevice({ email, fingerprint: deviceFingerprint(userAgent, ip), browser: dev.browser, os: dev.os, ip, approved: true });
  if (isEmailConfigured()) {
    const { subject, html } = loginAlertEmail({
      device: `${dev.browser} · ${dev.os} · ${dev.deviceType}`,
      location: geoLabel(getGeo(request)),
      ip,
      time: new Date().toLocaleString('en-IN'),
    });
    await sendEmail(email, subject, html);
  }

  const res = NextResponse.json({ ok: true });
  const sessionToken = await adminSessionToken();
  res.cookies.set(ADMIN_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  console.log('[ADMIN-LOGIN-DEBUG] session', {
    sessionTokenGenerated: Boolean(sessionToken),
    sessionCookieSet: Boolean(res.cookies.get(ADMIN_COOKIE)),
  });
  debugOutcome('success');
  return res;
}
