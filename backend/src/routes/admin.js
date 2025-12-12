import { Router } from 'express';
import { loadConfig } from '../utils/config.js';
import { summarizeDemand, runAllocation, listAllocations, listBookings, listPayments } from '../data/store.js';

const router = Router();
const config = loadConfig();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === config.admin.email && password === config.admin.password) {
    return res.json({ message: 'Authenticated', role: 'admin' });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

router.get('/demand', (_req, res) => {
  const demand = summarizeDemand().map((item) => ({
    hall: item.hall,
    tripId: item.tripId,
    confirmedStudents: item.students,
  }));

  res.json({ demand });
});

router.post('/allocations', (_req, res) => {
  const allocations = runAllocation();
  res.json({ allocations });
});

router.get('/allocations', (_req, res) => {
  res.json({ allocations: listAllocations() });
});

router.get('/overview', (_req, res) => {
  res.json({
    bookings: listBookings(),
    payments: listPayments(),
    allocations: listAllocations(),
  });
});

export default router;
