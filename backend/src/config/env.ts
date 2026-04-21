import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  /** Aligné avec `vite.config.ts` (frontend sur 3000, API sur 4000 en local). */
  PORT: Number(process.env.PORT) || 4000,
  DATABASE_URL: process.env.DATABASE_URL ?? 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  UPLOAD_DIR: process.env.UPLOAD_DIR ?? './uploads',
  WAVE_WEBHOOK_SECRET: process.env.WAVE_WEBHOOK_SECRET ?? '',
  ORANGE_MONEY_WEBHOOK_SECRET: process.env.ORANGE_MONEY_WEBHOOK_SECRET ?? '',
  GENIUSPAY_WEBHOOK_SECRET: process.env.GENIUSPAY_WEBHOOK_SECRET ?? '',
  GENIUSPAY_WEBHOOK_SECRET_OLD: process.env.GENIUSPAY_WEBHOOK_SECRET_OLD ?? '',
  /** Clés API Marchand GeniusPay (X-API-Key / X-API-Secret). */
  GENIUSPAY_API_KEY: process.env.GENIUSPAY_API_KEY ?? '',
  GENIUSPAY_API_SECRET: process.env.GENIUSPAY_API_SECRET ?? '',
  GENIUSPAY_API_BASE_URL: process.env.GENIUSPAY_API_BASE_URL ?? 'https://pay.genius.ci/api/v1/merchant',
  /** Cron réconciliation (backup webhooks) */
  GENIUSPAY_RECONCILE_CRON_ENABLED: process.env.GENIUSPAY_RECONCILE_CRON_ENABLED ?? 'false',
  GENIUSPAY_RECONCILE_CRON_INTERVAL_MINUTES: Number(process.env.GENIUSPAY_RECONCILE_CRON_INTERVAL_MINUTES) || 10,
  GENIUSPAY_RECONCILE_CRON_DAYS: Number(process.env.GENIUSPAY_RECONCILE_CRON_DAYS) || 3,
};

if (env.NODE_ENV === 'production' && env.JWT_SECRET === 'dev-secret-change-in-production') {
  throw new Error('JWT_SECRET doit être défini en production.');
}
