// Heuristic spam + profanity screening for review submissions.
//
// This is a deterministic, rule-based classifier (pattern/keyword scoring) —
// there is no hosted ML model wired in, since that would need a third-party
// API key this project doesn't have configured. It runs synchronously on
// every submission and is cheap enough to not need a queue.
//
// Score 0-100. Anything >= REJECT_THRESHOLD is auto-rejected (never shown,
// admin can still see it in the moderation queue). >= HOLD_THRESHOLD is
// queued for manual approval instead of publishing immediately.

const PROFANITY = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'piss',
  'slut', 'whore', 'nigger', 'faggot', 'retard',
];

const SPAM_PHRASES = [
  'click here', 'buy now at', 'discount code', 'promo code', 'whatsapp me',
  'call me at', 'visit my website', 'check out my', 'follow me on',
  'work from home', 'make money fast', 'free gift card', 'crypto', 'forex',
  'loan approved', 'bitcoin', 'casino', 'viagra',
];

const URL_RE = /(https?:\/\/|www\.)\S+/gi;
const PHONE_RE = /(\+?\d[\d\s-]{8,}\d)/g;
const REPEATED_CHAR_RE = /(.)\1{4,}/gi; // aaaaa, !!!!!
const REPEATED_WORD_RE = /\b(\w+)\b(?:\s+\1\b){3,}/gi;

export type SpamCheckInput = {
  title: string;
  text: string;
  rating: number;
  name: string;
};

export type SpamCheckResult = {
  score: number; // 0-100, higher = more likely spam
  reasons: string[];
  hasProfanity: boolean;
  hasLinks: boolean;
};

function countMatches(haystack: string, needles: string[]): string[] {
  const lower = haystack.toLowerCase();
  return needles.filter((n) => lower.includes(n));
}

export function checkReviewForSpam(input: SpamCheckInput): SpamCheckResult {
  const text = `${input.title} ${input.text}`;
  const reasons: string[] = [];
  let score = 0;

  const profanityHits = countMatches(text, PROFANITY);
  if (profanityHits.length) {
    score += 40 + Math.min(20, profanityHits.length * 10);
    reasons.push('profanity');
  }

  const spamHits = countMatches(text, SPAM_PHRASES);
  if (spamHits.length) {
    score += 35 + Math.min(25, spamHits.length * 10);
    reasons.push('promotional/spam phrase');
  }

  const urlMatches = text.match(URL_RE);
  if (urlMatches && urlMatches.length) {
    score += 30 + Math.min(20, (urlMatches.length - 1) * 10);
    reasons.push('contains a link');
  }

  const phoneMatches = input.text.match(PHONE_RE);
  if (phoneMatches && phoneMatches.length) {
    score += 20;
    reasons.push('contains a phone number');
  }

  if (REPEATED_CHAR_RE.test(text)) {
    score += 10;
    reasons.push('repeated characters');
  }
  if (REPEATED_WORD_RE.test(text)) {
    score += 15;
    reasons.push('repeated words');
  }

  const letters = input.text.replace(/[^a-zA-Z]/g, '');
  if (letters.length >= 12) {
    const upper = letters.replace(/[^A-Z]/g, '');
    if (upper.length / letters.length > 0.7) {
      score += 15;
      reasons.push('excessive capitalisation');
    }
  }

  const trimmed = input.text.trim();
  if (trimmed.length > 0 && trimmed.length < 8) {
    score += 15;
    reasons.push('very short / low-effort text');
  }

  // A 1-star review gushing with superlatives (or a 5-star review full of
  // complaints) is a soft signal of a mismatched/fake review — not scored
  // heavily on its own, just nudges the score.
  const negativeWords = ['worst', 'terrible', 'horrible', 'awful', 'scam', 'broken', 'defective'];
  const positiveWords = ['amazing', 'perfect', 'excellent', 'best', 'love it', 'flawless'];
  const negHits = countMatches(text, negativeWords).length;
  const posHits = countMatches(text, positiveWords).length;
  if (input.rating >= 4 && negHits >= 2 && posHits === 0) {
    score += 10;
    reasons.push('rating/text sentiment mismatch');
  }
  if (input.rating <= 2 && posHits >= 2 && negHits === 0) {
    score += 10;
    reasons.push('rating/text sentiment mismatch');
  }

  return {
    score: Math.min(100, score),
    reasons,
    hasProfanity: profanityHits.length > 0,
    hasLinks: Boolean(urlMatches && urlMatches.length),
  };
}

export const SPAM_REJECT_THRESHOLD = 60;
export const SPAM_HOLD_THRESHOLD = 30;

export function statusForSpamScore(score: number): 'approved' | 'pending' | 'rejected' {
  if (score >= SPAM_REJECT_THRESHOLD) return 'rejected';
  if (score >= SPAM_HOLD_THRESHOLD) return 'pending';
  return 'approved';
}

// Cheap near-duplicate detection: normalise whitespace/case/punctuation and
// compare, so "Great product!!" and "great product" collide.
export function normalizeForDupeCheck(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
