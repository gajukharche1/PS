# Project Specification: Pimple Saudagar Directory (PS)

**Document Version**: 1.0.0  
**Status**: APPROVED & LOCKED  
**Application Type**: Hyperlocal Business Directory (Justdial / WordPress ListingPro equivalent)  
**Target Locale**: Pimple Saudagar, PCMC/Pune, Maharashtra, India (5,000 listings capacity)

---

## 1. System Vision & Objectives

The Pimple Saudagar Directory provides a lightning-fast, production-grade local discovery engine for residents and businesses of Pimple Saudagar. It replaces traditional WordPress/PHP directory themes with a modern, high-performance Next.js App Router application backed by PostgreSQL, adhering to strict OWASP ASVS Level 2 standards and India's Digital Personal Data Protection (DPDP) Act 2023.

### Core User Personas
1. **Public Visitor**: Searches services, browses categorized directories, checks live "Open Now" status, views Leaflet maps, reads verified reviews, and submits enquiries.
2. **Business Owner**: Registers/logs in, claims existing listings with verification proof or creates new listings, selects pricing tiers (Free/Standard/Premium), manages hours, galleries, and responds to reviews.
3. **Moderator**: Reviews submissions, approves/rejects reviews with spam heuristics, verifies ownership claim proofs.
4. **Administrator**: Full system governance, taxonomy management (categories/locations hierarchy), pricing plans editor, CSV bulk import/export, user role allocation, and audit log inspection.

---

## 2. Domain Data Models & Schema Design

### 2.1 Listings (`listings`)
| Column | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | UUID / CUID | Primary Key |
| `slug` | VARCHAR(255) | Unique, Indexed, URL slug |
| `title` | VARCHAR(255) | Indexed, Full-Text indexed |
| `description` | TEXT | Server-sanitized HTML |
| `status` | ENUM | `draft`, `pending_review`, `published`, `rejected`, `expired`, `archived` |
| `ownerId` | UUID | Foreign key to `users.id` (nullable for unclaimed listings) |
| `claimStatus`| ENUM | `unclaimed`, `claim_pending`, `claimed`, `verified` |
| `featured` | BOOLEAN | Controlled by plan or admin override |
| `priority` | INTEGER | Search display priority order (derived from Plan) |
| `planId` | UUID | Foreign key to `pricing_plans.id` |
| `planStartedAt` | TIMESTAMP | Current plan activation timestamp |
| `planExpiresAt` | TIMESTAMP | Expiry timestamp (downgrades to Free on expiry) |
| `viewCount` | BIGINT | De-duplicated view counter |
| `averageRating` | DECIMAL(3,2) | Cached aggregate rating (1.00 to 5.00) |
| `reviewCount` | INTEGER | Cached approved review count |
| `phone` | VARCHAR(20) | Business telephone (+91 format) |
| `whatsapp` | VARCHAR(20) | WhatsApp click-to-chat target |
| `email` | VARCHAR(255) | Private contact email (hidden behind form by default) |
| `website` | VARCHAR(255) | Verified HTTPS URL |
| `address` | TEXT | Street address |
| `locality` | VARCHAR(100) | Primary neighborhood/locality in Pimple Saudagar |
| `landmark` | VARCHAR(100) | Prominent landmark |
| `latitude` | DECIMAL(10,8) | Spatial coordinate (WGS84) |
| `longitude`| DECIMAL(11,8) | Spatial coordinate (WGS84) |
| `openingHours` | JSONB | Weekly opening hours (`{ monday: { open: "09:00", close: "20:00", closed: false } }`) |
| `amenities` | TEXT[] | Tagged features (e.g. `["WiFi", "Parking", "AC", "Cards Accepted"]`) |
| `socialLinks`| JSONB | Allowlisted keys (`facebook`, `instagram`, `linkedin`, `youtube`, `x`) |

### 2.2 Categories (`categories`) & Locations (`locations`)
- **Hierarchical Self-Relation**: `parentId` allows infinite nesting (e.g., *Automotive > Car Repair > Denting & Painting* or *Pimple Saudagar > Kunal Icon Road > Roseland Residency*).
- **Listing Relations**: Many-to-Many junction tables (`listing_categories`, `listing_locations`).
- **Cached Counts**: Real-time published listing counts cached on category and location records.

### 2.3 Pricing Plans (`pricing_plans`)
- Free, Standard, Premium plans.
- Parameters: `priceMinor` (in paise, integer), `currency` (INR), `billingPeriodDays`, `maxPhotos`, `maxCategories`, `maxLocations`, `featuredAllowed`, `badgeVisible`, `callButtonAllowed`, `whatsappAllowed`, `searchPriority`.
- `plan_audit_log` records all pricing or entitlement modifications.

### 2.4 Reviews (`reviews`)
- Statuses: `pending`, `approved`, `spam`, `trashed`.
- Reviewer identity: `reviewerEmailHash` (SHA-256 with secret salt/pepper); optional raw email encrypted with AES-256-GCM.
- Constraint: Unique `(listingId, reviewerEmailHash)` or `(listingId, authorId)` prevents duplicate spam.
- Recalculation: Atomic transaction recalculating `averageRating` and `reviewCount` on `listings` table upon review approval or deletion.

### 2.5 Security & Supporting Tables
- `users`: id, email, passwordHash (Argon2id), phone, role (`visitor`, `owner`, `moderator`, `admin`), status, failedLoginCount, lockedUntil, lastLoginAt.
- `sessions`: HttpOnly session tokens with rolling expiration.
- `enquiries`: Lead inquiries sent to business owners with honeypot and rate limiting.
- `claim_requests`: Verification requests with document uploads for business ownership.
- `media`: Uploaded assets tracking owner, S3 key, dimensions, MIME type, `scanStatus`.
- `audit_log`: Immutable append-only audit trail (`actorId`, `action`, `entity`, `entityId`, `diff`, `ipAddress`, `createdAt`).

---

## 3. Public Routes & Information Architecture

```
/                                 -> Home: Hero search, category grid, featured listings, locations
/search                           -> Dynamic search & filter (q, category, locality, openNow, minRating, sort, page)
/listing/[slug]                   -> Business profile with live status, Leaflet map, gallery, reviews, contact modal
/category/[...slug]               -> Hierarchical category archive & subcategory tiles
/location/[...slug]               -> Locality archive with clustered map and listing cards
/pricing                          -> Transparent tier comparison & subscription onboarding
/submit                           -> Multi-step business submission wizard (auth required)
/claim/[slug]                     -> Ownership claim verification flow
/reviews/new?listing=[slug]       -> Standalone accessible review form
/dashboard/*                      -> Business owner management console
/admin/*                          -> Role-gated admin back-office and moderation hub
/api/webhooks/payments            -> Razorpay/Stripe signature-verified webhook handler
/api/cron/[job]                   -> Secret-gated scheduled maintenance tasks
```

---

## 4. Mandatory Security Compliance (ASVS Level 2 & DPDP Act)

1. **Authentication**: Argon2id password hashing (memory cost 64MB, time cost 3 iterations, parallelism 1 thread). Zero timing attack vectors via constant-time verification.
2. **Authorization (DAL)**: All service layer queries for owner-scoped assets mandate `where: { id: listingId, ownerId: session.userId }`. Admin routes verified via middleware + server action token checks.
3. **CSP & Headers**: Nonce-based Content Security Policy generated per-request in middleware. Strict frame-ancestors `'none'`, nosniff, HSTS 2-year preload.
4. **Data Privacy (India DPDP Act 2023)**:
   - Clear consent notices on lead capture and reviews.
   - Self-service data export (`/account/export`) and erasure request (`/account/delete`).
   - Hash reviewer email with internal server pepper to prevent PII harvesting while enforcing one-review-per-person integrity.
5. **Upload Protection**: Direct-to-bucket pre-signed URLs with size and MIME allowlists. Server validates magic bytes via Sharp, strips EXIF GPS tags, re-encodes to WebP/AVIF.

---

## 5. Performance & SEO Baselines

- **Core Web Vitals**: LCP < 2.5s, INP < 200ms, CLS < 0.1.
- **Dynamic Leaflet Loading**: Lazy-load maps dynamically with `next/dynamic` and `ssr: false` below the initial viewport fold.
- **Structured JSON-LD**:
  - `LocalBusiness` (or category-specific subtype such as `Restaurant`, `MedicalBusiness`, `AutoRepair`).
  - `OpeningHoursSpecification` mapped from the JSON opening hours.
  - `AggregateRating` and `Review` schema rendered exclusively for approved reviews.
  - `BreadcrumbList` for category and locality trees.
- **Chunked Sitemaps**: `sitemap.ts` implementing sitemap index split by category and 1,000-listing chunks.

