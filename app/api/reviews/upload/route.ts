import { NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { assertSameOrigin } from '@/lib/security/csrf';
import { getClientIp } from '@/lib/security/request';
import { isRateLimited } from '@/lib/security/publicRateLimit';
import { isBodyTooLarge } from '@/lib/security/validate';

const BUCKET = 'review-media';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_BYTES = 25 * 1024 * 1024; // 25 MB
// This is public (unlike the admin-only /api/upload), so reject an oversized
// body by its declared Content-Length before formData() buffers it in memory.
const MAX_UPLOAD_BODY_BYTES = MAX_VIDEO_BYTES + 1024 * 1024; // + multipart overhead
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

// POST (multipart form-data, fields "file" + "kind": image|video) → uploads
// customer review media to Supabase Storage. Public but rate-limited; the
// actual review submission is still gated on a verified purchase.
export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'Invalid request origin.' }, { status: 403 });
  }
  if (isBodyTooLarge(request, MAX_UPLOAD_BODY_BYTES)) {
    return NextResponse.json({ ok: false, error: 'File is too large.' }, { status: 413 });
  }
  const ip = getClientIp(request);
  if (isRateLimited('review-upload', ip, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: 'Too many uploads. Please try again later.' }, { status: 429 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Connect Supabase (and create a public "review-media" bucket) to upload photos/videos.' },
      { status: 400 }
    );
  }

  let file: File | null = null;
  let kind = 'image';
  try {
    const form = await request.formData();
    const f = form.get('file');
    if (f instanceof File) file = f;
    const k = form.get('kind');
    if (k === 'video') kind = 'video';
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid upload.' }, { status: 400 });
  }
  if (!file) {
    return NextResponse.json({ ok: false, error: 'No file provided.' }, { status: 400 });
  }

  const allowed = kind === 'video' ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
  const maxBytes = kind === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  const ext = allowed[file.type];
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: kind === 'video' ? 'Unsupported video type. Use MP4, WebM, or MOV.' : 'Unsupported image type. Use JPEG, PNG, WebP, or GIF.' },
      { status: 400 }
    );
  }
  if (file.size > maxBytes) {
    return NextResponse.json({ ok: false, error: `File is too large (max ${Math.round(maxBytes / 1024 / 1024)} MB).` }, { status: 400 });
  }

  const sb = getSupabase()!;
  const path = `reviews/${kind}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    console.error('[reviews/upload]', error.message);
    return NextResponse.json(
      { ok: false, error: `Upload failed: ${error.message}. Is the "${BUCKET}" bucket created and public?` },
      { status: 502 }
    );
  }

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl, kind });
}
