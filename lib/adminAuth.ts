// Shared admin-auth helpers used by the login route and the middleware that
// guards /admin. Credentials come from environment variables so they can be
// changed in Vercel without code edits. The session cookie stores a SHA-256
// token derived from the credentials plus a secret — the password itself is
// never stored in the browser, and changing the password invalidates old
// sessions. Uses only Web Crypto + TextEncoder, so it runs in both the Node
// (route handler) and Edge (middleware) runtimes.

export const ADMIN_COOKIE = 'ogp_admin';

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@omgauriputra.com').trim();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'omgauri2024').trim();
const ADMIN_SECRET = process.env.ADMIN_SESSION_SECRET || 'om-gauri-putra-admin-secret';

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** The session token a valid login receives; recomputed by the middleware. */
export function adminSessionToken(): Promise<string> {
  return sha256Hex(`${ADMIN_EMAIL.toLowerCase()}:${ADMIN_PASSWORD}:${ADMIN_SECRET}`);
}

/** Whether the submitted credentials match the configured admin. */
export function verifyAdmin(email: string, password: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password.trim() === ADMIN_PASSWORD;
}

// ─────────────────────────────────────────────────────────────────────────
// TEMP DEBUG (remove after diagnosing login). Returns ONLY boolean status
// checks — never the actual email, password, secret, or any env-var VALUE —
// so it is always safe to print to server logs. It does NOT participate in any
// auth decision; verifyAdmin() above remains the single source of truth.
export function debugLoginChecks(email: string, password: string) {
  return {
    // (1,2) The names the operator may have set in Vercel. NOTE: the code does
    // NOT read these — it reads ADMIN_EMAIL / ADMIN_PASSWORD (below).
    secretAdminEmailEnvSet: Boolean(process.env.SECRET_ADMIN_EMAIL),
    secretAdminPasswordEnvSet: Boolean(process.env.SECRET_ADMIN_PASSWORD),
    // The names the code actually reads:
    adminEmailEnvSet: Boolean(process.env.ADMIN_EMAIL),
    adminPasswordEnvSet: Boolean(process.env.ADMIN_PASSWORD),
    adminSessionSecretEnvSet: Boolean(process.env.ADMIN_SESSION_SECRET),
    // True when no real env var was found and the built-in fallback is in use:
    usingFallbackEmail: !process.env.ADMIN_EMAIL,
    usingFallbackPassword: !process.env.ADMIN_PASSWORD,
    // (3) Did the request actually carry credentials?
    incomingEmailReceived: Boolean(email && email.trim()),
    incomingPasswordReceived: Boolean(password),
    // (4,5) Per-field comparison against the EFFECTIVE configured credentials:
    emailComparisonPassed: email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase(),
    passwordComparisonPassed: password.trim() === ADMIN_PASSWORD,
  };
}
