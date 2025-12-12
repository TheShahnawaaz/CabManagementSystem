import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createClient } from '@supabase/supabase-js';
import healthRouter from './src/routes/health.js';
import bookingRouter from './src/routes/bookings.js';
import paymentsRouter from './src/routes/payments.js';
import adminRouter from './src/routes/admin.js';
import scansRouter from './src/routes/scans.js';
import { loadConfig } from './src/utils/config.js';

dotenv.config();

const app = express();
const config = loadConfig();

const supabaseClient = config.supabase.url && config.supabase.key
  ? createClient(config.supabase.url, config.supabase.key)
  : null;

app.set('supabase', supabaseClient);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/health', healthRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/scans', scansRouter);

app.get('/api/config/public', (_req, res) => {
  res.json({
    supabaseUrl: config.supabase.url,
    googleClientId: config.googleClientId,
    mockPayment: config.payments.mockMode,
  });
});

const port = config.port;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${port}`);
});
