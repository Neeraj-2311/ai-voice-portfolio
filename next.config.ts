import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const withMDX = createMDX();

const isProd = process.env.NODE_ENV === 'production';

const ContentSecurityPolicy = [
  "default-src 'self'",
  isProd
    ? "script-src 'self' 'unsafe-inline' https://plausible.io https://app.cal.com https://cal.com"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://app.cal.com https://cal.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://plausible.io https://app.cal.com https://cal.com https://*.resend.com https://*.livekit.cloud wss://*.livekit.cloud",
  "frame-src https://app.cal.com https://cal.com",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isProd ? ['upgrade-insecure-requests'] : []),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(self), geolocation=(), interest-cohort=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  ...(isProd
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withMDX(nextConfig);
