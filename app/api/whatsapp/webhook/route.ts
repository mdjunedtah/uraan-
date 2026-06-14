import { NextResponse } from 'next/server';
import { submitLead } from '@/lib/crm';

// Meta verifies the webhook with a GET handshake: echo back hub.challenge
// when hub.verify_token matches WHATSAPP_VERIFY_TOKEN.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  const expected = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && expected && token === expected) {
    return new Response(challenge || '', { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

// Inbound WhatsApp messages POST here. We turn the sender into a CRM lead so
// every chat lands in the pipeline alongside website enquiries.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const value = body?.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];
    const contact = value?.contacts?.[0];

    if (message) {
      const from = String(message.from || '').replace(/[^0-9]/g, '');
      const name = contact?.profile?.name || (from ? `WhatsApp ${from}` : 'WhatsApp Lead');
      const text =
        message.text?.body ||
        message.button?.text ||
        `[${message.type || 'message'}]`;

      await submitLead({
        name,
        // Placeholder address keyed by number so the CRM de-dupes by sender;
        // map to the real contact email once you collect it.
        email: from ? `wa-${from}@whatsapp.lead` : 'unknown@whatsapp.lead',
        phone: from,
        message: text,
        source: 'WhatsApp',
      });
    }
  } catch (err) {
    console.error('[WhatsApp] webhook error:', err);
  }

  // Always 200 so Meta does not retry-storm the endpoint.
  return NextResponse.json({ received: true });
}
