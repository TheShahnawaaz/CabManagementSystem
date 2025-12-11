import { Router } from 'express';
import { faker } from '@faker-js/faker/locale/en';

const router = Router();

const halls = ['LBS Hall', 'MMM Hall', 'VS Hall'];

router.get('/halls', (_req, res) => {
  res.json({ halls });
});

router.post('/', (req, res) => {
  const { userId, hall, paymentMethod = 'mock' } = req.body;

  if (!userId || !hall) {
    return res.status(400).json({ message: 'userId and hall are required' });
  }

  const hallExists = halls.includes(hall);
  if (!hallExists) {
    return res.status(422).json({ message: 'Unknown hall selection' });
  }

  const bookingId = faker.string.alphanumeric(10).toUpperCase();

  const response = {
    bookingId,
    userId,
    hall,
    paymentMethod,
    status: 'confirmed',
    message: 'Booking confirmed, awaiting cab allocation',
  };

  return res.status(201).json(response);
});

export default router;
