import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: process.env.DATABASE_URL ?? 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  UPLOAD_DIR: process.env.UPLOAD_DIR ?? './uploads',
  WAVE_WEBHOOK_SECRET: process.env.WAVE_WEBHOOK_SECRET ?? '',
  ORANGE_MONEY_WEBHOOK_SECRET: process.env.ORANGE_MONEY_WEBHOOK_SECRET ?? '',
};
