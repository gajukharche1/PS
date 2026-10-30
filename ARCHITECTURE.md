# System Architecture: Pimple Saudagar Directory (PS)

```
+---------------------------------------------------------------------------------------+
|                                    Edge & Clients                                     |
|  [Desktop / Mobile Browsers] <---> [Next.js Edge Middleware] (CSP Nonce, Auth Gate)  |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                               Next.js 15 App Router                                   |
|                                                                                       |
|  +---------------------------+   +----------------------------+                       |
|  | Server Components (RSC)   |   | Client Components (Leaflet,|                       |
|  | - Listing Profiles        |   | Interactive Filter Bar,    |                       |
|  | - Category/Location Hubs  |   | Gallery Lightbox, Modals)  |                       |
|  +---------------------------+   +----------------------------+                       |
|                |                               |                                      |
|                v                               v                                      |
|  +------------------------------------------------------------+                       |
|  | Server Actions (Mutations) & Route Handlers (APIs / Crons) |                       |
|  | - Zod Input Schema Validation (.strict())                  |                       |
|  | - Origin Header Verification & CSRF Guard                  |                       |
|  | - Upstash / Redis Sliding Window Rate Limiter              |                       |
|  +------------------------------------------------------------+                       |
|                                |                                                      |
|                                v                                                      |
|  +------------------------------------------------------------+                       |
|  | Domain Service Layer (lib/services/*)                      |                       |
|  | - ListingService, ReviewService, PlanService, MediaService |                       |
|  | - Data Access Layer (DAL) Enforcing Owner/Role Boundaries  |                       |
|  +------------------------------------------------------------+                       |
+---------------------------------------------------------------------------------------+
                 |                       |                       |
                 v                       v                       v
+--------------------------------+ +----------------+ +--------------------------------+
|      PostgreSQL 16 Engine      | |  Redis (Upstash| | Cloudflare R2 / AWS S3         |
| - Full-Text Search (tsvector)  | |  / Docker)     | | - Pre-signed uploads           |
| - Spatial GiST Bounding Boxes  | | - Rate limits  | | - Sharp processed images       |
| - ACID Recalculation Txns      | | - Cache tags   | | - Public WebP/AVIF CDN         |
+--------------------------------+ +----------------+ +--------------------------------+
                 |
                 v
+---------------------------------------------------------------------------------------+
|                            External Service Adapters                                  |
|  [Resend / React Email]       [Razorpay / Stripe Payments]     [Turnstile Bot Guard]  |
+---------------------------------------------------------------------------------------+
```

---

## 1. Architectural Decision Records (ADRs)

### ADR-01: Next.js App Router with Server Actions vs API-only SPA
- **Decision**: Adopt Next.js 15 App Router with React Server Components (RSC) and Server Actions.
- **Rationale**: A business directory lives and dies by SEO and Time-to-First-Byte (TTFB). Server-rendering listing pages guarantees indexability and sub-second paint times. Server Actions eliminate the need to maintain redundant REST API routes for internal form mutations while providing automatic CSRF protection.

### ADR-02: PostgreSQL Native Full-Text Search vs Elasticsearch / Algolia
- **Decision**: Leverage PostgreSQL built-in `tsvector`, `tsquery`, GIN indexes, and `pg_trgm` similarity queries instead of spinning up Algolia or Elasticsearch.
- **Rationale**: For a hyperlocal directory capped at 5,000 to 10,000 listings, PostgreSQL FTS provides sub-10ms response times without cross-service network latency, data synchronization lag, or additional SaaS operational costs. Architectural reduction principle: keep primitives minimal until scale mandates external engines.

### ADR-03: Data Access Layer (DAL) Ownership Isolation
- **Decision**: Reject relying on UI checks for permissions. Enforce tenant and ownership isolation directly in `lib/services/` and database repository functions.
- **Rationale**: Mitigates Insecure Direct Object References (IDOR, OWASP Top 10 A01:2021). Every listing update, image deletion, or reply submission explicitly verifies `where: { id, ownerId: session.userId }` at the SQL query level.

### ADR-04: Atomic Recalculation for Ratings & Review Aggregates
- **Decision**: When reviews transition state (e.g. `pending` -> `approved` or `approved` -> `trashed`), ratings are recalculated inside an atomic PostgreSQL interactive transaction (`prisma.$transaction`).
- **Rationale**: Eliminates rating drift, stale averages, and concurrency race conditions. Background cron repairs exist as a secondary failsafe.

---

## 2. Security Architecture & Threat Model (STRIDE)

| Threat | Target Subsystem | Mitigation Architecture |
| :--- | :--- | :--- |
| **Spoofing** | User & Owner Auth | Argon2id password hashing, hashed single-use tokens, session rotation upon privilege elevation, TOTP MFA for admins. |
| **Tampering** | Listings & Reviews | Server-side HTML sanitization with strict element allowlist, strict Zod schema validation, parameterised queries. |
| **Repudiation** | Moderation & Admin | Append-only `audit_log` recording `actorId`, `action`, `entity`, `ipAddress`, and diff snapshots. |
| **Information Disclosure** | PII & Reviewers | Reviewer emails hashed with server-side pepper; raw business emails hidden behind server action contact proxies. |
| **Denial of Service** | Search & Form Spam | Sliding-window Redis rate limits (e.g. 5 reviews/hr/IP, 60 search queries/min/IP), Turnstile bot challenges, honeypot traps. |
| **Elevation of Privilege** | Admin & Owner Routes | Dual-layer defense: Edge middleware route protection + Server Action role validation. |

---

## 3. Data Flow Pipeline: The 5-Stage Pattern

In accordance with the Context Engineering & Project Development methodology, non-deterministic or complex mutations follow the canonical pipeline:

1. **Acquire**: Ingest raw inputs from Server Actions, webhooks, or file uploads.
2. **Prepare**: Validate against Zod schemas, normalize casing, sanitize HTML, extract coordinates, hash credentials.
3. **Process**: Execute primary business logic (e.g., payment capture, sharp image transcoding, database mutation).
4. **Parse**: Extract status flags, format domain responses, handle payment provider event IDs.
5. **Render**: Invalidate Next.js cache tags (`revalidateTag`), update UI state, dispatch transactional notification emails.

