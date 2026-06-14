// Guard for admin-only API routes. The middleware protects /admin pages, but
// API routes live under /api, so mutating product routes check the same admin
// session cookie here.
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, adminSessionToken } from './adminAuth';

export async function isAdminRequest(): Promise<boolean> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return token === (await adminSessionToken());
}
