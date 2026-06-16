// Server-side WhatsApp Business Cloud API (Meta) sender. Runs only inside API
// routes, so the access token never reaches the browser. Mirrors lib/crm.ts:
// it fails gracefully when credentials are not configured, so the site keeps
// working before the integration is wired up.
//
// Required env vars (set in Vercel → Project → Settings → Environment Variables):
//   WHATSAPP_TOKEN            — permanent/long-lived access token for the app
//   WHATSAPP_PHONE_NUMBER_ID  — the Cloud API phone number id (NOT the number)
//   WHATSAPP_VERIFY_TOKEN     — any secret string; matched during webhook setup
//
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api

export interface WhatsAppResult {
  ok: boolean;
  configured: boolean;
  error?: string;
}

const GRAPH_VERSION = 'v20.0';

export async function sendWhatsAppText(
  to: string,
  message: string
): Promise<WhatsAppResult> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipient = to.replace(/[^0-9]/g, '');

  if (!recipient) {
    return { ok: false, configured: !!(token && phoneNumberId), error: 'Missing recipient number.' };
  }

  // Not wired up yet: log and report unconfigured so callers can degrade
  // gracefully to a wa.me click-to-chat link instead.
  if (!token || !phoneNumberId) {
    console.warn('[WhatsApp] Cloud API not configured — message not sent to', recipient);
    return { ok: true, configured: false };
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipient,
          type: 'text',
          text: { preview_url: false, body: message },
        }),
      }
    );

    if (res.ok) return { ok: true, configured: true };

    const detail = await res.text();
    console.error('[WhatsApp] send failed:', res.status, detail);
    return { ok: false, configured: true, error: `WhatsApp error (${res.status})` };
  } catch (err) {
    console.error('[WhatsApp] request error:', err);
    return { ok: false, configured: true, error: 'Could not reach WhatsApp API.' };
  }
}

// ── Admin lead notifications ────────────────────────────────────────────────
// Recipient for new-lead WhatsApp alerts. Override per-environment with
// ADMIN_WHATSAPP_NUMBER (digits only, international format, e.g. 91XXXXXXXXXX);
// falls back to the public store number, then to the configured default.
// Server-only — never shipped to the browser.
export const ADMIN_WHATSAPP_NUMBER = (
  process.env.ADMIN_WHATSAPP_NUMBER ||
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
  '919128596443'
).replace(/[^0-9]/g, '');

export interface LeadNotification {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source?: string;
}

// Sends the admin a WhatsApp alert for a newly captured lead. Best-effort and
// fail-safe: returns the underlying WhatsAppResult (configured:false when the
// Cloud API keys are absent) so callers can log without ever failing the form.
export async function notifyAdminNewLead(lead: LeadNotification): Promise<WhatsAppResult> {
  const lines = [
    '🔔 New lead — Om Gauri Pulta',
    '',
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    ...(lead.phone ? [`Phone: ${lead.phone}`] : []),
    `Source: ${lead.source || 'Website'}`,
    ...(lead.message ? ['', 'Message:', lead.message] : []),
  ];
  return sendWhatsAppText(ADMIN_WHATSAPP_NUMBER, lines.join('\n'));
}
