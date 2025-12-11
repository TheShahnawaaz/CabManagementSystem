import { Router } from 'express';
import { faker } from '@faker-js/faker/locale/en';
import { loadConfig } from '../utils/config.js';

const router = Router();
const config = loadConfig();

router.post('/mock', (req, res) => {
  if (!config.payments.mockMode) {
    return res.status(403).json({ message: 'Mock payments are disabled' });
  }

  const { amount = 0, currency = 'INR' } = req.body;
  const paymentId = faker.string.alphanumeric(12);
  const receipt = faker.string.alphanumeric(8).toUpperCase();

  return res.json({
    id: paymentId,
    amount,
    currency,
    status: 'succeeded',
    receipt,
    provider: 'razorpay-mock',
  });
});

export default router;
