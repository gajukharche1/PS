This prompt assumes Next.js (App Router) with its own PostgreSQL database in place of WordPress, since WordPress's CPTs and meta tables don't carry over directly. If you want WordPress kept as the content backend, tell me and I'll revise the data layer section.

```text
ROLE
You are a senior full-stack engineer specialising in Next.js, TypeScript, PostgreSQL and web security. Build a complete, production-ready local business directory website (Justdial-style) for a single area with up to 5,000 listings. Mirror the feature set of the WordPress listing pro theme brief, re-implemented idiomatically in Next.js. Use TypeScript strict mode, follow the OWASP Top 10 and OWASP ASVS Level 2 guidance, and make the code pass linting, type-checking and tests in CI.

PROJECT GOAL
Visitors search, browse by category and location, view business profiles with maps, read and submit reviews, and contact businesses. Business owners claim and manage listings from a dashboard and choose pricing plans. Admins moderate content and manage the whole directory.

PROJECT NAME & CONVENTIONS
Name: [Pimple Saudagar ]   Package/slug: [pimplesaudagar-slug]   Internal prefix: [PS]
Stack pinned to current stable releases at build time.

=====================================================
1. TECH STACK
=====================================================
- Framework: Next.js (App Router), React Server Components by default, Client Components only where interactivity requires it.
- Language: TypeScript (strict, noUncheckedIndexedAccess).
- Database: PostgreSQL with Prisma (or Drizzle). Migrations versioned in repo. PostGIS extension optional for radius queries; otherwise Haversine with a bounding-box index.
- Auth: Auth.js (NextAuth) or a custom session system with Argon2id password hashing, HTTP-only Secure SameSite cookies, email verification, password reset, optional Google/Facebook OAuth.
- Validation: Zod schemas shared between server actions, route handlers, and forms.
- Forms & mutations: Server Actions for form submissions; Route Handlers for public API and webhooks.
- Styling: Tailwind CSS with design tokens; accessible component primitives (Radix UI or equivalent).
- Maps: Leaflet + OpenStreetMap by default, with a provider switch to Google Maps via env config. Marker clustering.
- Rich text: sanitized with a strict allowlist (sanitize-html or DOMPurify on server).
- Storage: S3-compatible object storage (or Cloudflare R2) for images via pre-signed upload URLs; image optimisation through next/image with a configured loader.
- Email: transactional provider (Resend, Postmark or SES) behind an adapter interface.
- Payments: adapter interface with a Razorpay or Stripe implementation; webhooks verified by signature.
- Cache & rate limiting: Redis (Upstash or self-hosted) for rate limits and cached queries; in-memory fallback in development.
- Background jobs: scheduled job runner (cron route protected by a secret, or a worker) for plan expiry, review aggregation repair, and sitemap refresh.
- Testing: Vitest for units, Playwright for end-to-end, axe for accessibility checks.
- Observability: structured logging (pino), error tracking hook (Sentry adapter), health endpoint.

=====================================================
2. DATA MODEL (mirrors the WordPress CPT design)
=====================================================

2.1 Listing (table: listings)
- id, slug (unique, indexed), title, description (sanitized rich text), status (draft | pending_review | published | rejected | expired | archived), ownerId (nullable for unclaimed), claimStatus (unclaimed | claim_pending | claimed | verified), featured (bool), priority (int), planId, planStartedAt, planExpiresAt, viewCount, averageRating (cached), reviewCount (cached), createdAt, updatedAt, publishedAt.
- Contact: phone, whatsapp, email (private, never rendered publicly unless set public), website, address, locality, landmark, latitude, longitude, googlePlaceId, serviceArea, yearEstablished, priceRange (1–4), openingHours (JSON per weekday with ranges and closed flag, timezone Asia/Kolkata), amenities (text[]), socialLinks (JSON with allowlisted keys).
- Relations: categories (many-to-many), locations (many-to-many, primary location), images (ordered), reviews, enquiries.
- Full-text search index on title, description, categories, locality.

2.2 ListingCategory (table: categories, hierarchical via parentId)
- id, slug, name, description, icon (SVG asset key), coverImage, featuredOnHome (bool), sortOrder, seoTitle, seoDescription, timestamps.
- Derived count of published listings (cached, refreshed on change).

2.3 Location (table: locations, hierarchical: Area > Locality > Landmark)
- id, parentId, slug, name, description, latitude, longitude, coverImage, featured, sortOrder, SEO fields.

2.4 PricingPlan (table: pricing_plans, admin-managed, not publicly queryable)
- id, name (Free / Standard / Premium), slug, priceMinor (integer paise), currency (INR), billingPeriodDays, maxPhotos, maxCategories, maxLocations, featuredAllowed, badgeVisible, callButtonAllowed, whatsappAllowed, searchPriority (int), displayOrder, isActive, description.
- Plan changes are logged in plan_audit_log (who, when, old/new values, note).

2.5 Review (table: reviews)
- id, listingId, authorId (nullable), reviewerName, reviewerEmailHash (SHA-256 with server pepper; raw email stored only if needed for verification, encrypted at rest), rating (1–5), title, body (plain text, max length), photos (attachment ids), status (pending | approved | spam | trashed), verifiedVisit (bool), ownerReply (sanitized text), ownerReplyAt, helpfulCount, ipHash, userAgentHash, createdAt, moderatedBy, moderatedAt.
- Unique constraint: one approved/pending review per (listingId, reviewerEmailHash) or per authorId.
- Rating aggregates recalculated in a transaction on any status change, updating listings.averageRating and reviewCount.

2.6 Supporting tables
- users (id, email unique, emailVerifiedAt, passwordHash, name, phone, role, status, lastLoginAt, failedLoginCount, lockedUntil, createdAt, deletedAt)
- roles & permissions: visitor, owner, moderator, admin (owner can only mutate own listings; enforced in data-access layer, not just UI)
- sessions, password_reset_tokens, email_verification_tokens (hashed tokens, expiry, single-use)
- enquiries (id, listingId, name, email, phone, message, ipHash, createdAt, handledAt)
- claim_requests (id, listingId, userId, proofFileId, status, reviewedBy, reviewedAt, note)
- favourites (userId, listingId)
- media (id, ownerId, key, mimeType, bytes, width, height, altText, variants, createdAt, scanStatus)
- audit_log (generic actor/action/entity/diff)
- personal_data_requests (export/erase workflow)

=====================================================
3. PUBLIC PAGES & ROUTES
=====================================================
Route map (App Router):
- /                         Home: hero search, featured categories, featured listings, top-rated, popular locations, pricing CTA.
- /search                   Search results (q, category, location, openNow, minRating, priceRange, sort, page, geo). Server-rendered; filters update URL params. Works without JS.
- /listing/[slug]           Business profile: hero, gallery, about, hours with "open now" state, map, contact card (call, WhatsApp, enquiry form), amenities, social links, embedded reviews section, related listings, badges per plan.
- /category/[...slug]       Category archive with subcategory grid; supports nested slugs.
- /location/[...slug]       Location archive with map and listing grid.
- /pricing                  Plans comparison table with CTA to sign up or upgrade.
- /submit                   Add a business (auth required). Multi-step wizard: business info, categories, location, contact, hours, photos, plan selection, review and submit.
- /claim/[slug]             Claim an existing listing with proof upload.
- /reviews/new?listing=...  Dedicated review form (also available inline on listing page).
- /about, /contact, /privacy, /terms, /cookies, /accessibility-statement
- /sitemap.xml, /robots.txt, /manifest.webmanifest, /opengraph-image (dynamic)

Auth & account routes:
- /login, /register, /verify-email, /forgot-password, /reset-password, /logout
- /account (profile, password change, email preferences, delete account)

Owner dashboard (/dashboard):
- Overview: listing status, views, rating trend, pending review count, plan expiry countdown.
- Listings: create/edit/archive, photo management, hours editor, categories/locations picker respecting plan limits.
- Reviews: list, reply, flag for moderation.
- Enquiries: inbox with status.
- Plan & billing: current plan, upgrade, invoices, renewal status.
- Favourites.

Admin (/admin, role-gated, separate layout):
- Moderation queue: reviews, listings pending review, claim requests (approve/reject with note), flagged content.
- Listings table with filters (status, plan, claim, expiry), bulk actions, inline quick edit.
- Categories and locations tree editor with drag-to-reorder and SEO fields.
- Pricing plans editor and plan audit log.
- Users management (role change, suspend, reset, export).
- Site settings: branding, contact, map provider, social links, review rules, feature flags.
- Import/export: CSV import with validation, dry-run preview, row-level error report; CSV and JSON export.
- Dashboard widgets: new listings this week, pending items, expiring plans, revenue summary.

=====================================================
4. FEATURE DETAILS
=====================================================

4.1 Listing lifecycle
- Owner submits listing -> status pending_review (unless auto-approve setting on) -> admin approves -> published.
- Plan assignment at submission; free plan default. Plan limits enforced in the service layer (photo count, category count, location count, featured allowed) and mirrored in the UI.
- Expiry: scheduled job moves listings past planExpiresAt to Free plan (or to expired if configured), sends email 7 days and 1 day before expiry.
- Claim flow: unclaimed listings show "Claim this business". Claim request with proof file; admin verifies; claimed user becomes owner.

4.2 Categories & locations
- Hierarchical navigation with breadcrumbs (BreadcrumbList schema).
- Category and location pages show listings sorted by plan priority, then rating, then recency.
- Category pages render subcategory tiles and a "popular in this area" block linked to locations.

4.3 Search
- Postgres full-text search with ranking (title weighted highest), plus category and location filters.
- Radius search with latitude/longitude when user grants geolocation (rounded to 2 decimals for privacy). Fallback to locality filter.
- Autocomplete suggestions from category names, locality names and top listing titles (cached endpoint, rate-limited).
- Sorting: relevance, distance, rating, newest, featured-first (plan priority honoured).
- Pagination via cursor or page param; results cached per query key for 60–300 seconds, invalidated on listing publish.

4.4 Map
- Client-side Leaflet map with clustering on search and location pages; single marker on listing page.
- Map data from a lightweight JSON endpoint limited to visible bounds.
- Google Maps provider swap via adapter; API key restricted by HTTP referrer in docs.

4.5 Reviews (embedded in listing)
- Reviews section on each listing page: rating distribution bar, average, count, sort (newest, highest, lowest, most helpful), filter by star rating, paginated with "load more" via Server Action or Route Handler.
- Submit review: requires login or verified email + name; rating, title, body (min/max length), up to N photos.
- All new reviews land in moderation (pending) by default; auto-approve option for verified visitors.
- One review per user per listing; enforced by DB unique constraint and checked in the action.
- Owner can reply once per review (sanitized plain text).
- Helpful votes limited to logged-in users, one per review.
- Report review action; reports create a moderation item.
- JSON-LD AggregateRating and Review rendered only when approved reviews exist.
- Average rating recalculated in the same transaction as moderation changes.

4.6 Pricing & plans
- /pricing page driven by database plans; highlights recommended plan.
- Upgrade flow: choose plan -> checkout (payment adapter) -> webhook confirms payment -> plan activated, planExpiresAt set, invoice stored.
- Webhooks verified by signature, idempotent by event ID.
- Plan benefits (featured badge, priority, call/WhatsApp buttons) enforced at render time and in queries.

4.7 Enquiries & contact
- Contact form on listing page: name, email, phone (optional), message. Honeypot, time-trap, Turnstile/reCAPTCHA, rate limit per IP and per listing.
- Enquiry emailed to listing owner (or admin if unclaimed) and stored in inbox.
- Contact details shown as tel:, wa.me and mailto: links; email hidden behind a form unless the owner enables public email.

4.8 Accounts
- Registration with email verification; password policy (min 12 characters, breached-password check via HIBP k-anonymity API optional).
- Login rate limiting and account lockout after repeated failures with exponential backoff.
- Session rotation on login and privilege change; sessions revocable from account page.
- Password reset tokens hashed, single-use, 30-minute expiry.

4.9 Favourites
- Save listings to favourites (logged-in users), shown on /dashboard and account page.

4.10 Notifications
- Emails: welcome, verify email, password reset, review approved/rejected, new review on your listing, new enquiry, claim approved/rejected, plan expiring, payment receipt.
- Email templates as React Email components, with unsubscribe link for non-transactional mail.

=====================================================
5. SECURITY REQUIREMENTS (MANDATORY)
=====================================================

Input & output
- Validate every input on the server with Zod before any DB or business logic; never trust client validation.
- Sanitize rich text with an allowlist (p, br, strong, em, ul, ol, li, a with rel="nofollow noopener noreferrer" and https-only href). Plain text fields have HTML stripped.
- React escapes by default; never use dangerouslySetInnerHTML except with server-sanitized content, and document each usage.
- All database access through Prisma/Drizzle parameterised queries; raw SQL only via tagged templates with bound parameters.
- Reject unknown fields in server actions and route handlers (strict Zod objects).
- Limit request body sizes and JSON depth.

Authentication & authorisation
- Authorise in the data-access layer: every query for owner-scoped data includes an ownerId check; never rely on hidden UI.
- Admin routes protected by middleware AND a server-side role check in each action.
- CSRF: Server Actions are origin-checked by Next.js; additionally verify Origin header on Route Handlers that mutate state; SameSite=Lax or Strict cookies.
- Session cookies: HttpOnly, Secure, SameSite, short idle timeout with rolling refresh.
- Re-authenticate for sensitive actions (change password, change email, delete account, change payout details).
- MFA (TOTP) optional for owners, required for admins.
- Passwords hashed with Argon2id; tokens stored hashed (SHA-256) and compared in constant time.
- Never reveal whether an email exists on login, register, or reset (generic responses and timing-safe paths).

Uploads & media
- Pre-signed upload URLs with short expiry, content-type and max-size constraints.
- Server re-validates file type by magic bytes; strip EXIF GPS data; re-encode images via sharp; reject SVG uploads (except admin-curated icons).
- Malware scanning hook (ClamAV or provider) before media becomes public; status scanStatus gates display.
- Serve media from a separate domain or bucket with no script execution.

Transport, headers & config
- next.config.ts security headers: Strict-Transport-Security, Content-Security-Policy (nonce-based for scripts, allowlist for map tiles, payment and analytics domains), X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy (geolocation only for search page), frame-ancestors 'none'.
- CSP nonce generated in middleware and passed to layout.
- Disable the X-Powered-By header.
- Secrets only in environment variables validated at boot with a schema (fail fast); no secrets in client bundles (enforce NEXT_PUBLIC_ prefix review).
- Separate environment files per stage; .env.example documents every variable.

Abuse prevention
- Rate limiting (sliding window in Redis) on login, register, password reset, review submit, enquiry submit, autocomplete, and upload endpoints; per IP and per account.
- Bot protection on public forms (Turnstile or reCAPTCHA v3 plus honeypot).
- Review spam heuristics: link count limit, duplicate body detection, new-account throttling.
- Enumeration protection: consistent response times and generic errors.

Payments
- Never store card data; use hosted checkout or tokenised SDK.
- Webhook signature verification, replay protection by event ID, amounts re-checked server-side against plan price.

Privacy & compliance
- India: DPDP Act 2023 aligned notices, consent for marketing emails, data retention schedule, deletion workflow, grievance contact on /privacy.
- Store reviewer emails hashed where possible; raw email only when verification requires it and encrypted at rest.
- Data export and erasure endpoints for logged-in users and admin-initiated requests, with audit log entries.
- Cookie consent banner; analytics only after consent.
- Admin actions produce audit_log entries (immutable, append-only).

Dependency & supply chain
- Lockfile committed; dependency audit (npm audit / pnpm audit) in CI; Dependabot or Renovate enabled.
- Pin GitHub Actions to commit SHAs; minimal CI token permissions.
- Generate SBOM in CI.
- No dynamic code evaluation (no eval, new Function, or dynamic imports from user input).

Operational
- Automated backups for PostgreSQL with restore test documented.
- Structured security logs (failed logins, lockouts, permission denials) without PII.
- Error pages never leak stack traces in production.
- Health and readiness endpoints without sensitive info.

=====================================================
6. SEO, SCHEMA & PERFORMANCE
=====================================================
- generateMetadata per route with title/description templates, canonical URLs, Open Graph and Twitter cards; dynamic OG images via next/og.
- JSON-LD: LocalBusiness (or subtype by primary category), PostalAddress, GeoCoordinates, OpeningHoursSpecification, AggregateRating (only with real reviews), Review (approved only), BreadcrumbList, Organization, WebSite with SearchAction.
- sitemap.ts generated from database with chunked sitemap index for 5,000+ listings; lastmod from updatedAt.
- robots.ts disallows /dashboard, /admin, /account, /api, search result pages with extensive filters (noindex, follow).
- Static generation with revalidate for listing, category and location pages; on-demand revalidation via revalidateTag/revalidatePath on publish and review approval.
- Images via next/image with responsive sizes, AVIF/WebP, lazy loading except hero.
- Fonts via next/font with display swap.
- Core Web Vitals targets: LCP < 2.5s, INP < 200ms, CLS < 0.1. Map loaded dynamically (ssr: false) below the fold.
- Streaming with Suspense for reviews and related listings.

=====================================================
7. ACCESSIBILITY & INTERNATIONALISATION
=====================================================
- WCAG 2.2 AA: semantic landmarks, skip link, visible focus, keyboard-operable filters and map alternatives (list view always available), colour contrast checks, reduced-motion support.
- Forms with associated labels, error summaries, aria-describedby for hints.
- i18n-ready with next-intl or similar; English default, Hindi and Marathi locales scaffolded (URLs /hi, /mr).
- Currency in INR with Indian number formatting; dates in Asia/Kolkata.
- Phone numbers normalised to E.164 with +91 default.

=====================================================
8. ADMIN & OPERATIONS FEATURES
=====================================================
- Role-based admin UI with audit trail viewer.
- Feature flags for map provider, auto-approve reviews, payments, and review photos.
- Import/export CSV with schema, dry run, and rollback of an import batch.
- Scheduled jobs: plan expiry, expiry reminders, review aggregate repair, sitemap regeneration, orphaned media cleanup, session purge.
- Seed script to generate 50 categories, 30 locations, 200 listings, 500 reviews for staging.
- Analytics: view counts (de-duplicated per session via hashed IP per day), search query logging (anonymised), top searches report.

=====================================================
9. PROJECT STRUCTURE
=====================================================
[directory-slug]/
  app/
    (public)/           page.tsx, search/, listing/[slug]/, category/[...slug]/, location/[...slug]/, pricing/, submit/, claim/, about/, contact/, legal pages
    (auth)/             login/, register/, verify-email/, forgot-password/, reset-password/
    (account)/          account/, dashboard/ (owner)
    (admin)/admin/      moderation/, listings/, categories/, locations/, plans/, users/, settings/, imports/, audit/
    api/                webhooks/payments, cron/[job], health, search/autocomplete, map/markers
    sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx, not-found.tsx, error.tsx
    layout.tsx, middleware.ts
  components/          ui/ (primitives), listing/, search/, reviews/, map/, forms/, dashboard/, admin/
  lib/
    db/ (schema, client, migrations, queries), auth/, security/ (rate-limit, sanitize, csp, headers), validation/ (zod schemas),
    services/ (listings, reviews, plans, enquiries, claims, media, payments, email, search, seo),
    jobs/, config/ (env schema), logger/, i18n/
  actions/              server actions grouped by domain
  emails/               React Email templates
  styles/, public/, tests/ (unit, integration, e2e, a11y), scripts/ (seed, import, export), docs/ (architecture, security, deployment, runbook)
  .env.example, next.config.ts, middleware.ts, docker-compose.yml, Dockerfile, README.md, SECURITY.md

Business logic lives in lib/services; route handlers and server actions are thin adapters that validate, authorise, call a service, and return typed results.

=====================================================
10. TESTING & QUALITY GATES
=====================================================
- Unit tests: plan limit enforcement, rating recalculation, slug generation, hours "open now" logic, sanitizer allowlist, permission matrix (visitor / owner / moderator / admin against each action).
- Integration tests: review submission flow, claim approval, payment webhook idempotency, expiry job, rate limiter.
- E2E (Playwright): search with filters, listing view, submit listing wizard, review submit and moderation, login/lockout, checkout webhook simulation.
- Accessibility: axe checks on every public template.
- Security tests: IDOR attempts on owner routes, XSS payloads in rich text, CSRF origin checks, upload type spoofing, rate-limit verification.
- CI pipeline: install, lint, typecheck, unit, integration, build, e2e, audit, SBOM; fail on any high/critical vulnerability.

=====================================================
11. DELIVERABLES
=====================================================
1. Complete source code, every file fully written (no placeholders or "rest of code" comments).
2. Prisma/Drizzle schema, initial migration, and seed script.
3. .env.example with every variable described.
4. docker-compose for local Postgres, Redis, and MinIO; Dockerfile for production (multi-stage, non-root user, standalone output).
5. Deployment guide (Vercel or self-hosted), backup and restore runbook, cron setup.
6. Security hardening checklist and threat model summary (STRIDE for auth, reviews, uploads, payments).
7. Test suite and CI workflow file.
8. Admin user guide and owner onboarding guide.

Build in this order and state the stage you are on: project scaffold and config validation → database schema and migrations → auth and roles → security middleware and headers → listings and media → categories and locations → search and map → reviews → pricing and payments → enquiries and claims → dashboard → admin → SEO and schema → notifications and jobs → accessibility and i18n pass → tests and CI → documentation.
```
