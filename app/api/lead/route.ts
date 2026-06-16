import { NextResponse } from 'next/server';
import { submitLead } from '@/lib/crm';
import { dbInsertLead } from '@/lib/leadsDb';
import { notifyAdminNewLead } from '@/lib/whatsappServer';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();
  const message = String(body.message || '').trim();
  const source = String(body.source || 'Website').trim();

  if (!name || name.length < 2) {
    return NextResponse.json({ ok: false, error: 'Please enter your name.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (phone && !/^[0-9+\-\s]{7,15}$/.test(phone)) {
    return NextResponse.json({ ok: false, error: 'Please enter a valid phone number.' }, { status: 400 });
  }

  // Save to our own database first (primary store, so nothing is ever lost).
  try {
    await dbInsertLead({ name, email, phone, message, source });
  } catch (err) {
    console.error('[lead] db insert failed:', err);
  }

  // Push to HubSpot (best-effort): a CRM hiccup must not fail the visitor's
  // form — the lead is already saved above and any error is logged server-side.
  const result = await submitLead({ name, email, phone, message, source });
  if (!result.ok) {
    console.error('[lead] HubSpot push failed:', result.error);
  }

  // Notify the admin on WhatsApp (best-effort): a new lead just came in. This
  // must never block or fail the visitor's submission — the lead is already
  // saved above. Requires WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID to actually
  // deliver; otherwise it is logged and skipped.
  try {
    const notify = await notifyAdminNewLead({ name, email, phone, message, source });
    if (!notify.ok) {
      console.error('[lead] WhatsApp admin notify failed:', notify.error);
    } else if (!notify.configured) {
      console.warn(
        '[lead] WhatsApp admin notify skipped — Cloud API not configured ' +
          '(set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID in Vercel).'
      );
    }
  } catch (err) {
    console.error('[lead] WhatsApp admin notify error:', err);
  }

  return NextResponse.json({ ok: true, configured: result.configured });
}
