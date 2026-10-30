import { z } from "zod";

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // App URLs & Internal Secrets
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  APP_SECRET: z.string().min(32).default("development_secret_must_be_at_least_32_characters_long_ps_dir"),
  CRON_SECRET: z.string().min(16).default("dev_cron_secret_key_12345"),

  // PostgreSQL Database Connection
  DATABASE_URL: z
    .string()
    .url()
    .default("postgresql://postgres:postgres@localhost:5432/pimplesaudagar_dev?schema=public"),
  DIRECT_URL: z.string().url().optional(),

  // Redis Cache & Rate Limiting (Upstash or local)
  REDIS_URL: z.string().default("redis://localhost:6379"),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Storage (Cloudflare R2 or S3)
  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  STORAGE_BUCKET: z.string().default("pimple-saudagar-media"),
  NEXT_PUBLIC_STORAGE_PUBLIC_URL: z.string().url().default("http://localhost:9000/pimple-saudagar-media"),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Pimple Saudagar Directory <noreply@pimplesaudagar.local>"),

  // Payments (Razorpay & Stripe)
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Bot Challenge (Cloudflare Turnstile)
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),

  // Map Provider Switch (default: leaflet, alternative: google)
  NEXT_PUBLIC_MAP_PROVIDER: z.enum(["leaflet", "google"]).default("leaflet"),
  NEXT_PUBLIC_GOOGLE_MAPS_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables detected at startup:");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error("Invalid environment configuration. Fix the variables above in your .env file.");
  }

  return parsed.data;
}

export const env = validateEnv();
