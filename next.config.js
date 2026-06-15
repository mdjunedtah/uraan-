/** @type {import('next').NextConfig} */

// Content-Security-Policy is shipped in REPORT-ONLY mode first: it surfaces
// violations (in the browser console / report endpoint) without breaking the
// live store, so we can tighten it to enforcing once the report is clean.
const cspReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.razorpay.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://*.razorpay.com https://api.razorpay.com",
  "frame-src 'self' https://*.razorpay.com https://api.razorpay.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  // Force HTTPS for two years, including subdomains (HSTS preload-ready).
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Clickjacking protection.
  { key: 'X-Frame-Options', value: 'DENY' },
  // MIME-sniffing protection.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Don't leak full URLs to other origins.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable powerful features the storefront doesn't use.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // hide the X-Powered-By: Next.js fingerprint
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
