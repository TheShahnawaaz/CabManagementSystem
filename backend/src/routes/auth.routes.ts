import { Router } from 'express';
import passport from '../config/passport';
import { authenticateUser, AuthRequest } from '../middleware/auth.middleware';
import { generateToken } from '../utils/jwt';
import db from '../config/database';

const router = Router();

// Google OAuth login - Initiates the OAuth flow
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

// Google OAuth callback - Handles the OAuth response
router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`
  }),
  (req, res) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_user`);
      }

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        isAdmin: user.is_admin
      });

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`);
    }
  }
);

// Get current user profile
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const result = await db.query(
      'SELECT id, email, name, profile_picture, is_admin, created_at FROM users WHERE id = $1',
      [authReq.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Logout (client-side handles token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

export default router;

