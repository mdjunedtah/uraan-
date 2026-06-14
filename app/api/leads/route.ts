import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { dbGetLeads, dbInsertLead } from '@/lib/leadsDb';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET → list leads from the database (admin CRM).
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, configured: false, leads: [] });
  }
  const leads = await dbGetLeads();
  return NextResponse.json({ ok: true, configured: true, leads: leads || [] });
}

// POST → create a lead (manual add from the CRM).
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();

  if (!name) return NextResponse.json({ ok: false, error: 'Name is required.' }, { status: 400 });
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Valid email is required.' }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, configured: false });
  }

  const lead = await dbInsertLead({
    name,
    email,
    phone: String(body.phone || '').trim() || undefined,
    message: String(body.message || '').trim() || undefined,
    source: String(body.source || 'Website').trim(),
  });

  if (!lead) {
    return NextResponse.json({ ok: false, error: 'Could not save lead.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, configured: true, lead });
}
