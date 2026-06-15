// Audit + security-event logging (Supabase). Every function is fail-safe: it
// never throws, so logging can never break the request it is recording. When
// the DB is not configured the calls are silent no-ops.
import { getSupabase } from './supabase';

export type SecuritySeverity = 'info' | 'warning' | 'critical';

export type AuditEntry = {
  actorEmail?: string;
  actorRole?: string;
  action: string;
  target?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
};

export async function logAudit(entry: AuditEntry): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from('audit_logs').insert({
      actor_email: entry.actorEmail?.toLowerCase() || null,
      actor_role: entry.actorRole || null,
      action: entry.action,
      target: entry.target || null,
      ip: entry.ip || null,
      user_agent: entry.userAgent || null,
      metadata: entry.metadata || {},
    });
  } catch {
    /* logging must never break the caller */
  }
}

export type SecurityEvent = {
  type: string; // login_failed, login_blocked, account_locked, new_device, suspicious, ...
  severity?: SecuritySeverity;
  email?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
};

export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from('security_events').insert({
      type: event.type,
      severity: event.severity || 'info',
      email: event.email?.toLowerCase() || null,
      ip: event.ip || null,
      user_agent: event.userAgent || null,
      metadata: event.metadata || {},
    });
  } catch {
    /* never throw */
  }
}
