// Lightweight in-memory rate limiter for public, unauthenticated write
// endpoints (review submission / helpful votes / reports). It's a sliding
// window keyed by "action:ip", held in a module-level Map.
//
// Caveat: on a serverless platform each warm instance has its own Map, so
// this is best-effort defense-in-depth, not the sole protection — it's
// layered with the spam/profanity scorer, length/size caps, same-origin
// (CSRF) check, and DB-level duplicate-review prevention. The login-attempt
// limiter (lib/security/rateLimit.ts) is DB-backed because brute-force
// protection there is security-critical; this one is not.
const buckets = new Map<string, number[]>();
const MAX_BUCKETS = 5000; // hard cap so an attacker can't grow this unboundedly

export function isRateLimited(action: string, ip: string, limit: number, windowMs: number): boolean {
  const key = `${action}:${ip}`;
  const now = Date.now();
  const since = now - windowMs;
  const hits = (buckets.get(key) || []).filter((t) => t > since);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return true;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > MAX_BUCKETS) {
    const oldestKey = buckets.keys().next().value;
    if (oldestKey) buckets.delete(oldestKey);
  }
  return false;
}
