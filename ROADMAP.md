# Master Implementation Roadmap: Pimple Saudagar Directory (PS)

> **Execution Directive**: Follow this roadmap in strict sequence. Each phase represents a verifiable milestone. No phase is marked complete without meeting its Empirical Verification criteria.

---

## Phase Summary & Dependencies

```
[Phase 1: Scaffold & Config] 
       │
       ▼
[Phase 2: Database & Migrations] 
       │
       ▼
[Phase 3: Auth & Roles] 
       │
       ▼
[Phase 4: Security Middleware & Headers] 
       │
       ▼
[Phase 5: Listings & Media Pipeline] ◄──┐
       │                                │
       ▼                                │
[Phase 6: Categories & Locations] ──────┤
       │                                │
       ▼                                │
[Phase 7: Search, Autocomplete & Maps] ─┤
       │                                │
       ▼                                │
[Phase 8: Reviews & Aggregates] ────────┤ (Domain Services)
       │                                │
       ▼                                │
[Phase 9: Pricing & Payments] ──────────┤
       │                                │
       ▼                                │
[Phase 10: Enquiries & Claims] ─────────┘
       │
       ▼
[Phase 11: Owner Dashboard] 
       │
       ▼
[Phase 12: Admin Back-Office & Moderation] 
       │
       ▼
[Phase 13: SEO, OpenGraph & Schema] 
       │
       ▼
[Phase 14: Notifications & Scheduled Jobs] 
       │
       ▼
[Phase 15: Accessibility & i18n Localization] 
       │
       ▼
[Phase 16: Test Suite & CI/CD Hardening] 
       │
       ▼
[Phase 17: Production Docker & Runbooks]
```

---

## Detailed Phase Breakdown

### Phase 1: Project Scaffold & Config Validation
- **Objective**: Establish the Next.js 15 App Router codebase with strict TypeScript settings, Tailwind CSS design tokens, linting, and environment schema validation.
- **Key Files**:
  - `package.json`, `tsconfig.json` (`strict: true`, `noUncheckedIndexedAccess: true`)
  - `next.config.ts` (standalone output, security headers baseline)
  - `tailwind.config.ts`, `app/globals.css`
  - `lib/config/env.ts` (Zod schema validating all required server & client environment variables at build/runtime)
  - `docker-compose.yml` (local PostgreSQL 16, Redis 7, MinIO for S3 mock)
- **Verification Gate**:
  - `npm run build` succeeds without type errors.
  - Missing environment variables in `.env` immediately throw clear descriptive errors at application startup.
  - `docker-compose up -d` successfully spins up Postgres, Redis, and MinIO.

---

### Phase 2: Database Schema & Migrations
- **Objective**: Implement the complete PostgreSQL relational schema in Prisma/Drizzle matching WordPress ListingPro functionality, apply versioned migrations, and build a seed script.
- **Key Files**:
  - `prisma/schema.prisma` (Listings, Categories, Locations, PricingPlans, Reviews, Users, Enquiries, Claims, Media, AuditLog)
  - `prisma/migrations/*` (initial migration script with GiST and GIN indexes)
  - `lib/db/client.ts` (Prisma client singleton with connection pooling)
  - `scripts/seed.ts` (generates 50 categories, 30 localities/landmarks, 200 listings, 500 reviews, default plans)
- **Verification Gate**:
  - `npx prisma migrate dev` executes cleanly on fresh database.
  - `npx prisma db seed` seeds the full dataset and verifies relational integrity.
  - Index coverage confirmed (`EXPLAIN ANALYZE` on full-text and slug queries).

---

### Phase 3: Authentication & Role-Based Access Control (RBAC)
- **Objective**: Implement secure authentication with Argon2id password hashing, session cookies, and role gating (Visitor, Owner, Moderator, Admin).
- **Key Files**:
  - `lib/auth/password.ts` (Argon2id hashing & constant-time verify)
  - `lib/auth/session.ts` (HttpOnly, Secure, SameSite cookies, session rotation)
  - `lib/auth/rbac.ts` (role hierarchy & permission matrix)
  - `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`, `app/(auth)/forgot-password/page.tsx`
  - `actions/auth.ts` (login, register, logout, verifyEmail, resetPassword)
- **Verification Gate**:
  - Passwords hashed with Argon2id verify correctly.
  - Account lockout triggers after 5 failed login attempts with exponential backoff.
  - Timing attack test: login responses take uniform time whether email exists or not.

---

### Phase 4: Security Middleware & Security Headers
- **Objective**: Secure the transport layer, enforce nonce-based CSP, origin checks on Server Actions, and Redis sliding-window rate limiting.
- **Key Files**:
  - `middleware.ts` (generates CSP nonce, injects headers, gates `/admin` and `/dashboard` routes)
  - `lib/security/rate-limit.ts` (sliding window rate limiter via Redis with in-memory fallback)
  - `lib/security/sanitize.ts` (strict HTML sanitizer for rich text descriptions)
  - `lib/security/headers.ts` (HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Permissions-Policy)
- **Verification Gate**:
  - SecurityHeaders.com score A+ simulation.
  - Nonce dynamically changes per HTTP request and permits only whitelisted scripts.
  - Rate limiter blocks requests exceeding threshold (HTTP 429).

---

### Phase 5: Listings & Media Pipeline
- **Objective**: Implement listing CRUD, media uploads via pre-signed S3/R2 URLs, Sharp image processing, and listing detail pages.
- **Key Files**:
  - `lib/services/listing.service.ts` (listing queries & mutations with DAL owner isolation)
  - `lib/services/media.service.ts` (pre-signed URL generation, Sharp EXIF stripping & WebP conversion)
  - `app/(public)/listing/[slug]/page.tsx` (RSC business profile, hero gallery, opening hours, amenities)
  - `components/listing/listing-gallery.tsx`, `components/listing/opening-hours-card.tsx`
  - `actions/listing.ts` (create, update, delete listing actions)
- **Verification Gate**:
  - Listing profile renders with sub-100ms TTFB via RSC.
  - Uploaded image has EXIF GPS tags stripped and is compressed to WebP/AVIF format.
  - Direct IDOR test: User A cannot edit or delete User B's listing.

---

### Phase 6: Categories & Locations (Taxonomy)
- **Objective**: Build hierarchical category and locality trees, archive pages, and cached listing counts.
- **Key Files**:
  - `lib/services/taxonomy.service.ts` (nested tree traversal, count aggregation)
  - `app/(public)/category/[...slug]/page.tsx` (category archive, subcategory grid, breadcrumbs)
  - `app/(public)/location/[...slug]/page.tsx` (locality archive, landmark badges)
  - `components/taxonomy/category-card.tsx`, `components/taxonomy/breadcrumbs.tsx`
- **Verification Gate**:
  - Deep nested slugs (e.g. `/category/services/home-repair/plumber`) resolve hierarchy correctly.
  - Category count updates atomically when listings are published.

---

### Phase 7: Search, Autocomplete & Interactive Maps
- **Objective**: Implement high-performance PostgreSQL full-text search, locality filtering, autocomplete endpoint, and Leaflet map with clustering.
- **Key Files**:
  - `lib/services/search.service.ts` (tsvector search query builder, ranking, filter chaining)
  - `app/(public)/search/page.tsx` (server-rendered search with URL parameter state)
  - `app/api/search/autocomplete/route.ts` (cached, rate-limited suggestion endpoint)
  - `components/map/leaflet-map.tsx` (dynamic client component with `react-leaflet` and marker clustering)
  - `components/map/map-adapter.ts` (abstraction layer supporting Leaflet and Google Maps switch)
- **Verification Gate**:
  - Search executes without JavaScript (pure HTML form GET submission works).
  - Autocomplete responds in <30ms from Redis cache.
  - Leaflet map clusters 500+ pins without dropping frames.

---

### Phase 8: Reviews & Aggregations Engine
- **Objective**: Build review submission, spam heuristics, moderation workflow, single owner reply, and atomic transactional rating recalculation.
- **Key Files**:
  - `lib/services/review.service.ts` (recalculateAggregates transaction, spam scoring)
  - `components/reviews/review-list.tsx`, `components/reviews/review-form.tsx`
  - `actions/review.ts` (submitReview, voteHelpful, ownerReply, reportReview)
  - `app/(public)/reviews/new/page.tsx` (accessible standalone form)
- **Verification Gate**:
  - One review per user/email constraint verified at database level.
  - Updating review status to `approved` instantly updates `listings.averageRating` and `reviewCount` in the same transaction.
  - Zero rating drift confirmed across concurrent test reviews.

---

### Phase 9: Pricing Plans & Payment Gateway Integration
- **Objective**: Implement subscription plans (Free/Standard/Premium), plan limit enforcement in the service layer, and Razorpay/Stripe checkout with webhook verification.
- **Key Files**:
  - `lib/services/plan.service.ts` (plan limits check: photos, categories, priority)
  - `lib/services/payment.service.ts` (Razorpay/Stripe client adapter)
  - `app/(public)/pricing/page.tsx` (pricing comparison matrix)
  - `app/api/webhooks/payments/route.ts` (webhook signature validation & idempotent event processing)
  - `actions/payment.ts` (initiateCheckout, cancelSubscription)
- **Verification Gate**:
  - Webhook simulation with invalid signature returns HTTP 400.
  - Valid webhook activates plan, sets `planExpiresAt`, and logs transaction idempotently.
  - Free plan users are strictly blocked by the backend from uploading more than allowed photos.

---

### Phase 10: Enquiries, Claim Workflow & Lead Routing
- **Objective**: Implement lead enquiry routing to business owners and ownership claim flow with verification proof uploads.
- **Key Files**:
  - `lib/services/enquiry.service.ts` (honeypot check, lead dispatch, inbox storage)
  - `lib/services/claim.service.ts` (claim submission, document attachment, status management)
  - `components/forms/enquiry-modal.tsx`, `app/(public)/claim/[slug]/page.tsx`
  - `actions/enquiry.ts`, `actions/claim.ts`
- **Verification Gate**:
  - Honeypot form field filled -> enquiry silently dropped without sending email.
  - Claim request creates pending claim item and notifies admin; claimed listing displays badge once approved.

---

### Phase 11: Business Owner Dashboard
- **Objective**: Dedicated dashboard for business owners to track listing performance, edit profile/hours, manage reviews, and review enquiries.
- **Key Files**:
  - `app/(account)/dashboard/page.tsx` (overview analytics: views, ratings trend, lead counts)
  - `app/(account)/dashboard/listings/page.tsx` (listing editor with live preview)
  - `app/(account)/dashboard/enquiries/page.tsx` (lead inbox with read/unread flags)
  - `app/(account)/dashboard/reviews/page.tsx` (review manager with owner reply action)
  - `app/(account)/dashboard/billing/page.tsx` (current plan, invoice history, upgrade button)
- **Verification Gate**:
  - Owner dashboard routes redirect unauthenticated users to `/login`.
  - Non-owner users cannot view or mutate another business's leads or reviews.

---

### Phase 12: Admin Back-Office & Moderation Portal
- **Objective**: Full back-office for administrators and moderators: review moderation queue, claim review, category/location tree manager, plan editor, user management, and CSV import/export.
- **Key Files**:
  - `app/(admin)/admin/page.tsx` (system health, pending queue metrics)
  - `app/(admin)/admin/moderation/page.tsx` (bulk approve/reject for reviews & claims)
  - `app/(admin)/admin/listings/page.tsx` (advanced data table with filters and bulk actions)
  - `app/(admin)/admin/categories/page.tsx`, `app/(admin)/admin/locations/page.tsx`
  - `app/(admin)/admin/plans/page.tsx` (plan pricing and benefits editor with audit log)
  - `app/(admin)/admin/imports/page.tsx` (CSV batch importer with dry-run preview and error reporting)
  - `actions/admin.ts` (moderation and administrative actions)
- **Verification Gate**:
  - Only users with `role: admin` or `role: moderator` can access `/admin`.
  - CSV import dry-run flags malformed rows before committing to database.

---

### Phase 13: SEO, Dynamic OpenGraph & Schema
- **Objective**: Implement comprehensive JSON-LD schemas, dynamic `@vercel/og` image generation, chunked sitemaps, and robots.txt.
- **Key Files**:
  - `app/sitemap.ts` (chunked sitemap index for 5,000+ listings, categories, locations)
  - `app/robots.ts` (disallow private routes, allow crawlers on listings/categories)
  - `app/(public)/listing/[slug]/opengraph-image.tsx` (dynamic branded banner with rating & locality)
  - `lib/services/seo.service.ts` (JSON-LD generator for LocalBusiness, Breadcrumbs, AggregateRating)
- **Verification Gate**:
  - Google Rich Results Test validation passes without warnings for LocalBusiness and AggregateRating.
  - Sitemaps validate against XML schema standard and index all published listings.

---

### Phase 14: Transactional Notifications & Background Cron Jobs
- **Objective**: Build React Email templates for all transactional events and secret-gated cron jobs for plan expiry, sitemap refresh, and review repair.
- **Key Files**:
  - `emails/welcome.tsx`, `emails/enquiry-notification.tsx`, `emails/review-approved.tsx`, `emails/plan-expiry-reminder.tsx`
  - `app/api/cron/plan-expiry/route.ts` (daily job downgrading expired plans and sending reminders 7d/1d before)
  - `app/api/cron/repair-aggregates/route.ts` (nightly audit repairing any rating drift)
  - `app/api/cron/cleanup-sessions/route.ts` (purges expired tokens and unverified users)
- **Verification Gate**:
  - Cron routes reject requests lacking valid `Authorization: Bearer <CRON_SECRET>`.
  - Expiry job successfully identifies and downgrades listings past `planExpiresAt`.

---

### Phase 15: Accessibility (WCAG 2.2 AA) & i18n Localization
- **Objective**: Ensure full accessibility compliance across all public flows and scaffold multilingual support (English, Hindi, Marathi).
- **Key Files**:
  - `lib/i18n/config.ts`, `messages/en.json`, `messages/hi.json`, `messages/mr.json`
  - `components/ui/skip-link.tsx`, `components/ui/language-switcher.tsx`
  - Accessible focus rings, ARIA labels, contrast verification across components.
- **Verification Gate**:
  - Automated `axe-core` scan reports 0 violations on home, search, listing, and submission pages.
  - Full keyboard navigability (Tab, Shift-Tab, Enter, Escape) on all modals, search filters, and menus.

---

### Phase 16: Automated Test Suite & CI/CD Hardening
- **Objective**: Comprehensive Vitest unit tests, Playwright E2E tests, and GitHub Actions CI workflow with security audits.
- **Key Files**:
  - `tests/unit/plan-limits.test.ts`, `tests/unit/rating-recalc.test.ts`, `tests/unit/open-now.test.ts`
  - `tests/integration/review-flow.test.ts`, `tests/integration/webhook-idempotency.test.ts`
  - `tests/e2e/search-and-filter.spec.ts`, `tests/e2e/submit-listing.spec.ts`, `tests/e2e/auth-lockout.spec.ts`
  - `.github/workflows/ci.yml` (lint, typecheck, test, build, audit, SBOM generation)
- **Verification Gate**:
  - All test suites execute and pass in CI pipeline.
  - Zero high or critical vulnerabilities in `npm audit`.

---

### Phase 17: Production Docker & Runbooks
- **Objective**: Multi-stage production Dockerfile, database backup/restore runbooks, and admin/owner onboarding documentation.
- **Key Files**:
  - `Dockerfile` (multi-stage Next.js standalone build running as non-root user)
  - `docs/deployment.md` (Vercel and self-hosted Docker deployment guides)
  - `docs/runbooks/backup-restore.md` (PostgreSQL point-in-time recovery procedure)
  - `docs/guides/admin-handbook.md`, `docs/guides/owner-onboarding.md`
  - `README.md`, `SECURITY.md`
- **Verification Gate**:
  - Production Docker container builds and boots to healthy status (`/api/health` returns 200).
  - Point-in-time database restore test succeeds in local simulation.

