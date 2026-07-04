'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, X, Loader2, ImagePlus, Video as VideoIcon } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { MAX_REVIEW_IMAGES, MAX_REVIEW_VIDEOS, MIN_REVIEW_TEXT } from '@/lib/reviews';
import type { SubmitOutcome, SubmitPayload } from '@/hooks/useProductReviews';

type MediaItem = { url: string; uploading: boolean };

export default function ReviewForm({
  productId,
  productName,
  onSubmit,
  onDone,
}: {
  productId: string;
  productName: string;
  onSubmit: (payload: SubmitPayload) => Promise<SubmitOutcome>;
  onDone: () => void;
}) {
  const user = getCurrentUser();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [variant, setVariant] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [images, setImages] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) {
    return (
      <div className="bg-[#f8f2e6] border border-[rgba(184,137,58,0.18)] p-6 text-center">
        <p className="text-sm text-[#6b5d4c] mb-3">Please sign in to write a review — only verified purchasers can review this product.</p>
        <Link
          href="/login"
          className="inline-block text-[11px] tracking-[2px] uppercase font-semibold bg-[#1a1410] text-[#e8d49b] px-5 py-3 hover:bg-[#b8893a] hover:text-[#1a1410]"
        >
          Sign In
        </Link>
      </div>
    );
  }
  const userName = user.name;
  const userEmail = user.email;

  async function uploadFile(file: File, kind: 'image' | 'video'): Promise<string> {
    const form = new FormData();
    form.append('file', file);
    form.append('kind', kind);
    const res = await fetch('/api/reviews/upload', { method: 'POST', body: form });
    const data = await res.json();
    if (res.ok && data.ok) return data.url as string;
    if (kind === 'image' && file.size < 1024 * 1024) {
      // Demo-mode fallback when Supabase Storage isn't configured: small
      // images are inlined as a data URL so the flow still works end to end.
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Could not read file.'));
        reader.readAsDataURL(file);
      });
    }
    throw new Error(data.error || 'Upload failed.');
  }

  async function handleFiles(fileList: FileList | null, kind: 'image' | 'video') {
    if (!fileList || !fileList.length) return;
    const setState = kind === 'image' ? setImages : setVideos;
    const max = kind === 'image' ? MAX_REVIEW_IMAGES : MAX_REVIEW_VIDEOS;
    const files = Array.from(fileList);
    for (const file of files) {
      // The updater runs synchronously against the latest queued state, so
      // this captures the true slot index even across a fast multi-file loop
      // (reading the `images`/`videos` closures directly would be stale).
      let slot = -1;
      setState((prev) => {
        if (prev.length >= max) return prev;
        slot = prev.length;
        return [...prev, { url: '', uploading: true }];
      });
      if (slot === -1) continue;
      try {
        const url = await uploadFile(file, kind);
        setState((prev) => prev.map((m, i) => (i === slot ? { url, uploading: false } : m)));
      } catch (err) {
        setState((prev) => prev.filter((_, i) => i !== slot));
        setError(err instanceof Error ? err.message : 'Upload failed.');
      }
    }
  }

  function removeMedia(kind: 'image' | 'video', index: number) {
    const setState = kind === 'image' ? setImages : setVideos;
    setState((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (rating < 1) return setError('Please choose a star rating.');
    if (!title.trim()) return setError('Please add a short title.');
    if (text.trim().length < MIN_REVIEW_TEXT) return setError(`Please write at least ${MIN_REVIEW_TEXT} characters.`);
    if (images.some((m) => m.uploading) || videos.some((m) => m.uploading)) return setError('Please wait for uploads to finish.');

    setSubmitting(true);
    const result = await onSubmit({
      productId,
      productName,
      rating,
      title: title.trim(),
      text: text.trim(),
      variant: variant.trim() || undefined,
      images: images.map((m) => m.url).filter(Boolean),
      videos: videos.map((m) => m.url).filter(Boolean),
      anonymous,
      name: userName,
      email: userEmail,
    });
    setSubmitting(false);

    if (!result.ok) return setError(result.error);
    setSuccess(result.message || 'Thank you for your review!');
    setTitle('');
    setText('');
    setVariant('');
    setImages([]);
    setVideos([]);
    setRating(0);
    setTimeout(onDone, 1400);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#f8f2e6] border border-[rgba(184,137,58,0.18)] p-5 space-y-4">
      <div>
        <label className="block text-[11px] tracking-[1.5px] uppercase text-[#6b5d4c] mb-1.5">Your Rating *</label>
        <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              className="p-0.5"
            >
              <Star size={26} className={n <= (hoverRating || rating) ? 'text-[#b8893a] fill-[#b8893a]' : 'text-[#d4cfc5]'} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="review-title" className="block text-[11px] tracking-[1.5px] uppercase text-[#6b5d4c] mb-1.5">
          Review Title *
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          className="w-full border border-[rgba(184,137,58,0.32)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#b8893a]"
          placeholder="Sum up your experience"
        />
      </div>

      <div>
        <label htmlFor="review-text" className="block text-[11px] tracking-[1.5px] uppercase text-[#6b5d4c] mb-1.5">
          Detailed Review *
        </label>
        <textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={5000}
          rows={5}
          className="w-full border border-[rgba(184,137,58,0.32)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#b8893a]"
          placeholder="What did you like or dislike? How does it look/feel/fit?"
        />
      </div>

      <div>
        <label htmlFor="review-variant" className="block text-[11px] tracking-[1.5px] uppercase text-[#6b5d4c] mb-1.5">
          Variant Purchased (optional)
        </label>
        <input
          id="review-variant"
          type="text"
          value={variant}
          onChange={(e) => setVariant(e.target.value)}
          maxLength={120}
          className="w-full border border-[rgba(184,137,58,0.32)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#b8893a]"
          placeholder="e.g. Size, colour, metal"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="block text-[11px] tracking-[1.5px] uppercase text-[#6b5d4c] mb-1.5">Photos (optional)</span>
          <MediaPicker kind="image" items={images} max={MAX_REVIEW_IMAGES} onPick={(f) => handleFiles(f, 'image')} onRemove={(i) => removeMedia('image', i)} />
        </div>
        <div>
          <span className="block text-[11px] tracking-[1.5px] uppercase text-[#6b5d4c] mb-1.5">Video (optional)</span>
          <MediaPicker kind="video" items={videos} max={MAX_REVIEW_VIDEOS} onPick={(f) => handleFiles(f, 'video')} onRemove={(i) => removeMedia('video', i)} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-[#6b5d4c]">
        <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="accent-[#b8893a]" />
        Post as anonymous
      </label>

      {error && <p role="alert" className="text-xs text-[#7a2e2e]">{error}</p>}
      {success && <p role="status" className="text-xs text-[#3d6b5a]">{success}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="h-11 px-6 bg-[#1a1410] text-[#e8d49b] text-[11px] tracking-[3px] uppercase font-semibold hover:bg-[#b8893a] hover:text-[#1a1410] disabled:opacity-50 flex items-center gap-2"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          Submit Review
        </button>
        <button type="button" onClick={onDone} className="text-[11px] tracking-[1.5px] uppercase text-[#6b5d4c] hover:text-[#7a2e2e]">
          Cancel
        </button>
      </div>
    </form>
  );
}

function MediaPicker({
  kind,
  items,
  max,
  onPick,
  onRemove,
}: {
  kind: 'image' | 'video';
  items: MediaItem[];
  max: number;
  onPick: (files: FileList | null) => void;
  onRemove: (index: number) => void;
}) {
  const inputId = `review-${kind}-input`;
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((m, i) => (
          <div key={i} className="relative w-14 h-14 border border-[rgba(184,137,58,0.32)] bg-white overflow-hidden">
            {m.uploading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 size={16} className="animate-spin text-[#b8893a]" />
              </div>
            ) : kind === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <video src={m.url} className="w-full h-full object-cover" muted />
            )}
            {!m.uploading && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label="Remove"
                className="absolute top-0 right-0 bg-black/60 text-white p-0.5"
              >
                <X size={10} />
              </button>
            )}
          </div>
        ))}
      </div>
      {items.length < max && (
        <label
          htmlFor={inputId}
          className="inline-flex items-center gap-1.5 text-[11px] text-[#6b5d4c] border border-dashed border-[rgba(184,137,58,0.4)] px-3 py-2 cursor-pointer hover:border-[#b8893a]"
        >
          {kind === 'image' ? <ImagePlus size={13} /> : <VideoIcon size={13} />}
          Add {kind}
          <input
            id={inputId}
            type="file"
            accept={kind === 'image' ? 'image/*' : 'video/*'}
            multiple={kind === 'image'}
            className="sr-only"
            onChange={(e) => {
              onPick(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
      )}
    </div>
  );
}
