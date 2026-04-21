import app from './app.js';
import { env } from './config/env.js';
import { startGeniusPayReconcileCron } from './services/reconcileCron.js';

app.listen(env.PORT, () => {
  console.log(`Warignan API → http://localhost:${env.PORT}`);
  console.log(`Health       → http://localhost:${env.PORT}/api/health`);
  startGeniusPayReconcileCron();
});
