# Pimple Saudagar Local Business Directory

> A production-ready, enterprise-grade local business directory platform specifically tailored for **Pimple Saudagar (PCMC, Pune, Maharashtra, India)**, capable of supporting up to 5,000 businesses on a **100% Free-Tier cloud stack** ($0 monthly hosting fees).

[![CI Pipeline](https://github.com/pimplesaudagar/directory/actions/workflows/ci.yml/badge.svg)](https://github.com/pimplesaudagar/directory/actions)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5.28-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0_Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4.1-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![WCAG](https://img.shields.io/badge/WCAG-2.2_AA_Compliant-success)](#)
[![OWASP](https://img.shields.io/badge/OWASP-ASVS_Level_2-brightgreen)](#)

---

## 🌟 Key Platform Features

### 1. Public Directory Experience
- **Interactive Multi-Criteria Search**: Full-text keyword search across 5,000+ businesses, filtered by category, neighborhood locality, rating, and open status.
- **Dual View Mode**: Seamless toggle between responsive listing grid view and interactive Leaflet / OpenStreetMap map view with custom business pins.
- **Rich Business Profiles**: Operating hours with real-time `Asia/Kolkata` open/closed detection, high-resolution photo gallery, direct WhatsApp click-to-chat, verified badges, and interactive enquiry modal.
- **SEO & Structured Data**: Dynamic Schema.org `LocalBusiness`, `BreadcrumbList`, and `AggregateRating` JSON-LD tags, dynamic `sitemap.xml`, `robots.txt`, and automated OpenGraph image generation via `next/og`.

### 2. Business Monetization & Payments
- **3-Tier Subscription Plans**: Free Directory, Standard Growth (₹4,999/yr), and Premium Spotlight (₹9,999/yr) with feature gating (photo quotas, search priority, verified badges, WhatsApp click-to-chat).
- **Payment Gateway Webhooks**: Atomic activation supporting Razorpay and Stripe with HMAC SHA-256 signature verification.

### 3. Business Owner & Merchant Dashboard
- **Analytics KPIs**: Real-time listing view counters, enquiry lead inbox, and customer review metrics.
- **Lead Management**: Real-time notification inbox with one-click direct telephone and email callback buttons.
- **Review Response**: Business owners can publicly reply to verified customer feedback.
- **Claim Workflow**: Verified ownership verification flow with business registration document upload and review.

### 4. Admin Back-Office & Moderation
- **Moderation Queue**: Review approvals/rejections and claim request verification with audit logging.
- **Listings Directory Manager**: Full status control (Published, Pending Review, Draft, Rejected, Archived).
- **Bulk CSV Batch Importer**: Client-side CSV parser with schema validation, dry-run preview, and batch database seeding.

### 5. Enterprise Security & DPDP Compliance
- **OWASP ASVS Level 2**: Argon2id password hashing, edge middleware with dynamic per-request cryptographic CSP nonces, sliding-window rate limiting, and HTML sanitization.
- **India DPDP Act 2023 Compliant**: Peppered HMAC SHA-256 reviewer email hashing, consent notices, and automated personal data erasure workflows.
- **Multi-Language Support**: Complete localization in English (`en`), Marathi (`mr`), and Hindi (`hi`).

---

## 🏗️ 100% Free-Tier Architecture ($0/Month)

```
                       [ Cloudflare DNS & CDN ]
                                  │
                                  ▼
                      [ Vercel Edge Middleware ]
                 (Dynamic CSP Nonce & Edge Protection)
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
       [ Next.js 15 App Router ]        [ Cloudflare R2 ]
         (React Server Components)      (10GB Media Bucket, $0 Egress)
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
[ Neon PostgreSQL ]   [ Upstash Redis ]
 (0.5GB Free DB)       (Rate Limiting & Cache)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 20+ installed
- PostgreSQL 16 database running (or Docker)
- Redis (optional, local in-memory fallback included)

### 1. Clone & Install
```bash
git clone https://github.com/pimplesaudagar/directory.git
cd directory
npm install
```

### 2. Configure Environment
Copy `.env.example` or populate `.env.local`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/directory?schema=public"
AUTH_SECRET="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
CRON_SECRET="dev_cron_secret_key_12345"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Generate Prisma & Seed Database
```bash
npm run prisma:generate
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the directory.

---

## 🧪 Automated Testing & Quality Gates

Run the test suite:
```bash
# Execute Vitest unit tests
npm test

# Run TypeScript static type checking in strict mode
npm run typecheck

# Build standalone production Next.js bundle
npm run build
```

---

## 🐳 Docker Deployment

Build and run the production container:
```bash
docker build -t pimplesaudagar-directory:latest .
docker run -p 3000:3000 --env-file .env.local pimplesaudagar-directory:latest
```

---

## 📄 License & Credits
Engineered for the Pimple Saudagar (PCMC, Pune) community. Released under the MIT License.
