import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminApi';
import { currentApiAdmin } from '@/lib/security/guard';
import { sendWhatsAppText } from '@/lib/whatsappServer';
import { sendEmail } from '@/lib/email';
import { dbInsertCampaignLog } from '@/lib/campaignsDb';
import { personalize, htmlWrap, type CampaignChannel, type CampaignRecipient } from '@/lib/campaigns';
import { logAudit } from '@/lib/audit';
import { checkLengths, isBodyTooLarge, MAX_LEN } from '@/lib/security/validate';

const MAX_RECIPIENTS = 500;

// POST → send a WhatsApp or Email campaign to a list of recipients (admin
// only). Loops sequentially — message volumes here are small/SMB-scale, so no
// concurrency control is needed.
export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }
  if (isBodyTooLarge(request)) {
    return NextResponse.json({ ok: false, error: 'Request too large.' }, { status: 413 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const channel: CampaignChannel = String(body.channel) === 'email' ? 'email' : 'whatsapp';
  const subject = String(body.subject || '').trim();
  const message = String(body.message || '').trim();
  const recipients = Array.isArray(body.recipients) ? (body.recipients as CampaignRecipient[]) : [];

  if (!message) {
    return NextResponse.json({ ok: false, error: 'Message is required.' }, { status: 400 });
  }
  if (channel === 'email' && !subject) {
    return NextResponse.json({ ok: false, error: 'Subject is required for email campaigns.' }, { status: 400 });
  }
  if (!recipients.length) {
    return NextResponse.json({ ok: false, error: 'At least one recipient is required.' }, { status: 400 });
  }
  if (recipients.length > MAX_RECIPIENTS) {
    return NextResponse.json(
      { ok: false, error: `Campaigns are limited to ${MAX_RECIPIENTS} recipients.` },
      { status: 400 }
    );
  }
  const lengthError = checkLengths({
    Subject: { value: subject, max: MAX_LEN.short },
    Message: { value: message, max: MAX_LEN.text },
  });
  if (lengthError) {
    return NextResponse.json({ ok: false, error: lengthError }, { status: 400 });
  }

  let sentCount = 0;
  let failedCount = 0;

  if (channel === 'whatsapp') {
    for (const r of recipients) {
      const phone = String(r.phone || '').trim();
      if (!phone) {
        failedCount++;
        continue;
      }
      try {
        const result = await sendWhatsAppText(phone, personalize(message, r.name));
        if (result.ok) sentCount++;
        else failedCount++;
      } catch {
        failedCount++;
      }
    }
  } else {
    for (const r of recipients) {
      const email = String(r.email || '').trim();
      if (!email) {
        failedCount++;
        continue;
      }
      try {
        const ok = await sendEmail(email, subject, htmlWrap(personalize(message, r.name)));
        if (ok) sentCount++;
        else failedCount++;
      } catch {
        failedCount++;
      }
    }
  }

  const admin = await currentApiAdmin();
  await dbInsertCampaignLog({
    channel,
    subject: channel === 'email' ? subject : undefined,
    message,
    recipientCount: recipients.length,
    sentCount,
    failedCount,
    createdBy: admin?.email,
  });

  await logAudit({
    actorEmail: admin?.email,
    actorRole: admin?.role,
    action: 'campaign_sent',
    metadata: { channel, recipientCount: recipients.length, sentCount, failedCount },
  });

  return NextResponse.json({ ok: true, sentCount, failedCount });
}
