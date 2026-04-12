import path from 'node:path';
import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './routes/auth.js';
import deliveriesRouter from './routes/deliveries.js';
import healthRouter from './routes/health.js';
import mediaRouter from './routes/media.js';
import ordersRouter from './routes/orders.js';
import paymentsRouter from './routes/payments.js';
import productsRouter from './routes/products.js';
import reservationsRouter from './routes/reservations.js';
import trackingRouter from './routes/tracking.js';
import webhooksRouter from './routes/webhooks.js';

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

const uploadRoot = path.resolve(env.UPLOAD_DIR);
app.use('/uploads', express.static(uploadRoot));

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/tracking', trackingRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/media', mediaRouter);
app.use('/api/deliveries', deliveriesRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

app.use(errorHandler);

export default app;
