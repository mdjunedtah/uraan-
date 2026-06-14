import { NextResponse } from 'next/server';
import { submitLead } from '@/lib/crm';
import { dbInsertLead } from '@/lib/leadsDb';

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

  const result = await submitLead({ name, email, phone, message, source });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || 'Something went wrong. Please try again.' },
      { status: 502 }
    );
  }

  // Also store in our own database (best-effort) so the lead shows in the
  // admin CRM even if HubSpot isn't configured.
  try {
    await dbInsertLead({ name, email, phone, message, source });
  } catch (err) {
    console.error('[lead] db insert failed:', err);
  }

  return NextResponse.json({ ok: true, configured: result.configured });
}
