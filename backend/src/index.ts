import app from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';
import { startGeniusPayReconcileCron } from './services/reconcileCron.js';

// Sur Vercel (Serverless), on ne lance pas app.listen. On exporte l'app Express.
if (process.env.VERCEL) {
  logger.info('Running as Vercel Serverless Function');
  // Note : les crons réguliers en tâche de fond ne tournent pas de manière continue sur Vercel Serverless.
} else {
  const server = app.listen(env.PORT, () => {
    logger.info(`Warignan API → http://localhost:${env.PORT}`);
    logger.info(`Health       → http://localhost:${env.PORT}/api/health`);
    startGeniusPayReconcileCron();
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Signal reçu, arrêt en cours…');
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Serveur arrêté proprement.');
      process.exit(0);
    });
    // Force exit si le serveur tarde à fermer
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

export default app;

