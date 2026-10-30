# 100% Free-Tier Production Deployment Guide

This guide details step-by-step instructions to deploy the Pimple Saudagar Local Business Directory to production at **$0 monthly cloud infrastructure cost** while supporting up to 5,000 businesses and 100,000 monthly visits.

---

## Architecture & Free-Tier Limits Overview

| Component | Provider | Free Tier Allocation | Overage Safeguard |
| :--- | :--- | :--- | :--- |
| **Compute & Edge** | Vercel Hobby | 100 GB bandwidth, unlimited serverless invocations | Standalone Next.js Docker alternative if traffic surges |
| **Relational Database** | Neon PostgreSQL / Supabase | 0.5 GB storage, autosuspend after 5 min inactivity, pooled connections | Connection pooling via PgBouncer singleton in `lib/db/client.ts` |
| **Key-Value & Rate Limiting** | Upstash Redis | 10,000 commands / day | In-memory token bucket fallback implemented in `lib/security/rate-limit.ts` |
| **Object Media Storage** | Cloudflare R2 | 10 GB storage, **$0 egress fees**, 1M Class A operations / month | Direct browser-to-bucket pre-signed URL uploads |
| **Maps & Geocoding** | Leaflet + OpenStreetMap | 100% free open-source map tiles | Client-side lazy loading with zero API key dependencies |

---

## Step 1: PostgreSQL Setup (Neon / Supabase)

1. Create a free account at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com).
2. Create a project named `pimplesaudagar-directory` in the `ap-south-1` (Mumbai) region for lowest latency to Pune/PCMC.
3. Copy the pooled connection string:
   ```env
   DATABASE_URL="postgresql://user:password@ep-xyz-pooler.ap-south-1.aws.neon.tech/directory?sslmode=require&pgbouncer=true"
   DIRECT_URL="postgresql://user:password@ep-xyz.ap-south-1.aws.neon.tech/directory?sslmode=require"
   ```
4. Push migrations and seed data:
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```

---

## Step 2: Cloudflare R2 Media Storage Setup

1. Log into Cloudflare Dashboard -> **R2 Object Storage**.
2. Create a bucket named `pimplesaudagar-media`.
3. Configure Bucket CORS under Settings:
   ```json
   [
     {
       "AllowedOrigins": ["https://pimplesaudagar.org", "http://localhost:3000"],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
4. Create an API Token with **Object Read & Write** permissions and note the `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_ACCOUNT_ID`.
5. Connect your custom domain or enable public R2 dev URL for media delivery.

---

## Step 3: Upstash Redis Setup

1. Create a free database at [console.upstash.com](https://console.upstash.com) in `ap-south-1` (Mumbai).
2. Copy the REST URL and token:
   ```env
   UPSTASH_REDIS_REST_URL="https://xyz.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="AXYZ..."
   ```

---

## Step 4: Vercel Deployment

1. Push your repository to GitHub / GitLab.
2. In Vercel, click **Add New Project** and select the repository.
3. Add the following production environment variables:
   - `DATABASE_URL`
   - `AUTH_SECRET` (generate with `openssl rand -hex 32`)
   - `ENCRYPTION_KEY` (generate with `openssl rand -hex 32`)
   - `CRON_SECRET` (generate with `openssl rand -hex 16`)
   - `NEXT_PUBLIC_APP_URL` (`https://pimplesaudagar.org`)
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `NEXT_PUBLIC_R2_PUBLIC_URL`
   - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
   - `RESEND_API_KEY` (free tier: 3,000 emails / month)
4. Deploy! Vercel automatically deploys edge middleware and serverless routes.

---

## Step 5: Background Cron Setup

In Vercel or GitHub Actions, configure daily scheduled pings to:
- `https://pimplesaudagar.org/api/cron/plan-expiry`
- `https://pimplesaudagar.org/api/cron/repair-aggregates`
- `https://pimplesaudagar.org/api/cron/cleanup-sessions`

Headers:
`Authorization: Bearer <CRON_SECRET>`
