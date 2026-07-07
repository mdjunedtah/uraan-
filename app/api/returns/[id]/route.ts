import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminApi';
import { dbUpdateReturnStatus } from '@/lib/returnsDb';
import type { ReturnStatus } from '@/lib/returns';
import { currentApiAdmin } from '@/lib/security/guard';
import { logAudit } from '@/lib/audit';
import { checkLengths, MAX_LEN } from '@/lib/security/validate';

const STATUSES: ReturnStatus[] = ['requested', 'approved', 'rejected', 'refunded', 'replaced'];

// PATCH → update a return's status and/or admin notes (admin only).
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const hasStatus = body.status !== undefined;
  const hasNotes = body.adminNotes !== undefined;
  if (!hasStatus && !hasNotes) {
    return NextResponse.json({ ok: false, error: 'Nothing to update.' }, { status: 400 });
  }

  let status: ReturnStatus | undefined;
  if (hasStatus) {
    status = String(body.status || '') as ReturnStatus;
    if (!STATUSES.includes(status)) {
      return NextResponse.json({ ok: false, error: 'Invalid status.' }, { status: 400 });
    }
  }

  const adminNotes = hasNotes ? String(body.adminNotes ?? '') : undefined;
  const lengthError = checkLengths({
    ...(adminNotes !== undefined ? { 'Admin notes': { value: adminNotes, max: MAX_LEN.text } } : {}),
  });
  if (lengthError) {
    return NextResponse.json({ ok: false, error: lengthError }, { status: 400 });
  }

  const ok = await dbUpdateReturnStatus(params.id, status, adminNotes);
  if (!ok) {
    return NextResponse.json({ ok: false, error: 'Could not update return.' }, { status: 502 });
  }

  const admin = await currentApiAdmin();
  await logAudit({
    actorEmail: admin?.email,
    actorRole: admin?.role,
    action: 'return_status_changed',
    target: params.id,
    metadata: { status, notesUpdated: hasNotes },
  });

  return NextResponse.json({ ok: true });
}
