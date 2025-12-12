import { Router } from 'express';
import { faker } from '@faker-js/faker/locale/en';
import { loadConfig } from '../utils/config.js';
import { recordPayment } from '../data/store.js';

const router = Router();
const config = loadConfig();

router.post('/mock', (req, res) => {
  if (!config.payments.mockMode) {
    return res.status(403).json({ message: 'Mock payments are disabled' });
  }

  const { amount = 0, currency = 'INR', bookingId = null } = req.body;
  const payment = recordPayment({ bookingId, amount, currency });

  return res.json({
    ...payment,
    receipt: faker.string.alphanumeric(8).toUpperCase(),
  });
});

export default router;
