# Technical Stack & Dependency Matrix: Pimple Saudagar Directory (PS)

**Project Name**: Pimple Saudagar Local Business Directory  
**Package/Slug**: `pimplesaudagar-slug`  
**Internal Prefix**: `PS`  
**Architecture**: Next.js App Router (RSC by default) + PostgreSQL + Redis

---

## 1. Runtime & Core Framework

| Layer | Technology | Selection Rationale & Version Pinning |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | React Server Components for zero-bundle rendering, server actions for mutations, streaming Suspense. |
| **Runtime UI** | React 19 | Built-in actions, async transitions, optimistic UI, server components. |
| **Language** | TypeScript 5.x | Strict mode (`strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`). |
| **Styling** | Tailwind CSS v3.4+ | Utility-first with design tokens for consistent spacing, colors, and typography. |
| **Component Primitives** | Radix UI / shadcn/ui | Unstyled, fully accessible (WAI-ARIA compliant) headless primitives. |
| **Icons** | Lucide React | Clean, tree-shakeable SVG icon collection. |

---

## 2. Data Layer & State

| Layer | Technology | Specification |
| :--- | :--- | :--- |
| **Primary Database** | PostgreSQL 16 (Neon Serverless / Supabase / Local Docker) | Relational data integrity, ACID transactions, native full-text search (`tsvector`), connection pooling via PgBouncer / Neon pooler. 100% Free tier compatible. |
| **ORM / Migration** | Prisma ORM 5.x/6.x | Type-safe schema definition, declarative migrations, connection pooling. |
| **Geospatial Queries** | PostGIS or Haversine SQL | Bounding box spatial index (`GiST`) with Haversine formula fallback for radius calculations. |
| **Caching & Rate Limit** | Redis (Upstash / Redis 7 Docker) | Sliding-window rate limiting, search autocomplete caching, session revocation cache, in-memory fallback for local dev. Free tier on Upstash (10k cmd/day). |
| **File Storage** | Cloudflare R2 / AWS S3 | Object storage for business photos, claim proofs, and category icons via pre-signed URLs. 10 GB free + $0 egress on Cloudflare R2. |

---

## 3. Security, Authentication & Validation

| Domain | Technology | Implementation Details |
| :--- | :--- | :--- |
| **Authentication** | Auth.js v5 / Custom Session | Argon2id password hashing, HTTP-only Secure SameSite cookies, session rotation, TOTP MFA for admins. |
| **Schema Validation** | Zod 3.x | End-to-end type validation shared across forms, server actions, and route handlers. Strict objects (`.strict()`). |
| **Sanitization** | sanitize-html / DOMPurify | Strict server-side allowlist for rich text (`p`, `br`, `strong`, `em`, `ul`, `ol`, `li`, `a[rel="nofollow noopener noreferrer"][href^="https://"]`). |
| **Security Headers** | Custom Next.js Middleware | Nonce-based CSP, HSTS (`preload`), X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin. |
| **Bot Protection** | Cloudflare Turnstile / Honeypot | Cryptographic bot challenge on public review, claim, and enquiry forms with time-trap fields. |

---

## 4. Maps, Media & Communications

| Component | Provider / Tool | Integration Details |
| :--- | :--- | :--- |
| **Maps** | Leaflet + OpenStreetMap | Client-side map with `leaflet.markercluster`. Pluggable adapter to swap to Google Maps via environment switch. |
| **Image Processing** | Sharp | Server-side EXIF GPS metadata stripping, re-encoding to WebP/AVIF, dimension throttling. |
| **Transactional Email**| Resend | Transactional email delivery behind adapter interface (`IEmailService`), React Email templates. |
| **Payments** | Razorpay (Primary INR) + Stripe | Hosted checkout / tokenized payments, webhook signature verification with event replay protection. |

---

## 5. Background Jobs & Observability

| Service | Mechanism | Details |
| :--- | :--- | :--- |
| **Scheduled Tasks** | Route Handlers (`/api/cron/*`) | Protected via `CRON_SECRET` header; executed via external cron/Vercel Cron (plan expiry, review repair, sitemap sync). |
| **Structured Logging** | Pino | JSON structured logging, omitting sensitive PII, capturing request IDs and audit actor IDs. |
| **Error Monitoring** | Sentry SDK / OpenTelemetry | Error boundary and uncaught rejection tracking with release and environment tags. |
| **Testing** | Vitest, Playwright, axe-core | Vitest for unit & DAL tests; Playwright for E2E flows; axe-core for WCAG 2.2 AA accessibility verification. |

