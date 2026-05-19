import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { reconcileGeniusPay } from './geniusPayReconcile.js';

function asBool(v: string): boolean {
  return ['1', 'true', 'yes', 'y', 'on'].includes((v ?? '').trim().toLowerCase());
}

export function startGeniusPayReconcileCron() {
  if (!asBool(env.GENIUSPAY_RECONCILE_CRON_ENABLED)) return;

  const minutes = Math.max(2, Math.min(60, env.GENIUSPAY_RECONCILE_CRON_INTERVAL_MINUTES));
  const days = Math.max(1, Math.min(30, env.GENIUSPAY_RECONCILE_CRON_DAYS));

  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const res = await reconcileGeniusPay(days);
      logger.info(
        { scanned: res.scanned, intents: res.updatedIntents, skipped: res.skipped, from: res.from, to: res.to },
        '[geniuspay] reconcile OK'
      );
    } catch (e) {
      logger.error({ err: e }, '[geniuspay] reconcile FAILED');
    } finally {
      running = false;
    }
  };

  // run once at boot, then interval
  void tick();
  const t = setInterval(() => void tick(), minutes * 60_000);
  t.unref?.();
  logger.info({ minutes, days }, '[geniuspay] reconcile cron activé');
}

