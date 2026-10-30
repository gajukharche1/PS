export function generateCspHeader(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";

  // In development, Next.js hot module reloading requires eval and websocket connections
  const scriptSrc = isDev
    ? `'self' 'unsafe-eval' 'unsafe-inline' https:`
    : `'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'`;

  const connectSrc = isDev
    ? `'self' https: ws: wss:`
    : `'self' https:`;

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https://*.r2.cloudflarestorage.com https://images.unsplash.com https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://*.basemaps.cartocdn.com`,
    `font-src 'self' data:`,
    `connect-src ${connectSrc}`,
    `media-src 'self' blob: https://*.r2.cloudflarestorage.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

export const staticSecurityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
];
