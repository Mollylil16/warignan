import path from 'node:path';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter, webhookLimiter } from './middleware/rateLimit.js';
import authRouter from './routes/auth.js';
import deliveriesRouter from './routes/deliveries.js';
import healthRouter from './routes/health.js';
import mediaRouter from './routes/media.js';
import ordersRouter from './routes/orders.js';
import paymentsRouter from './routes/payments.js';
import productsRouter from './routes/products.js';
import promotionsRouter from './routes/promotions.js';
import reservationsRouter from './routes/reservations.js';
import dashboardRouter from './routes/dashboard.js';
import trackingRouter from './routes/tracking.js';
import usersRouter from './routes/users.js';
import webhooksRouter from './routes/webhooks.js';

const app = express();

// Derrière Nginx (reverse proxy), on doit faire confiance aux en-têtes X-Forwarded-*,
// sinon express-rate-limit déclenche ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
// `1` = un proxy de confiance (Nginx local).
app.set('trust proxy', 1);

app.use(
  helmet({
    // Les uploads/images sont servis depuis /uploads, pas besoin de CSP strict ici (à faire côté Nginx idéalement).
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  })
);
/** Webhooks : corps brut pour vérification HMAC (avant express.json). */
app.use('/api/webhooks', webhookLimiter, webhooksRouter);
app.use(express.json({ limit: '2mb' }));

const uploadRoot = path.resolve(env.UPLOAD_DIR);
app.use('/uploads', express.static(uploadRoot));

app.use('/api', apiLimiter);
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/promotions', promotionsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/tracking', trackingRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/media', mediaRouter);
app.use('/api/deliveries', deliveriesRouter);
app.use('/api/dashboard', dashboardRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

app.use(errorHandler);

export default app;
