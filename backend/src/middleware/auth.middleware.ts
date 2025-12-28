import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import db from '../config/database';
import { AuthRequest } from '../types/express';

export { AuthRequest };

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch user details from database to ensure user still exists
    const result = await db.query(
      'SELECT id, email, name, phone_number, is_admin FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = result.rows[0];

    req.user = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      phone_number: userData.phone_number,
      is_admin: userData.is_admin,
      isAdmin: userData.is_admin // Set both for compatibility
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
