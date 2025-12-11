import { Router } from 'express';
import { loadConfig } from '../utils/config.js';

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
  const demand = [
    { hall: 'LBS Hall', confirmedStudents: 50 },
    { hall: 'MMM Hall', confirmedStudents: 20 },
    { hall: 'VS Hall', confirmedStudents: 12 },
  ];

  res.json({ demand });
});

export default router;
