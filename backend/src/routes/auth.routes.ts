import { Router } from 'express';
import passport from '../config/passport';
import { authenticateUser, AuthRequest } from '../middleware/auth.middleware';
import { generateToken } from '../utils/jwt';
import db from '../config/database';
import { validateProfileUpdate } from '../middleware/validation.middleware';

const router = Router();

const formatUserResponse = (user: any) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  phone_number: user.phone_number,
  profile_picture: user.profile_picture,
  is_admin: user.is_admin,
  created_at: user.created_at,
  updated_at: user.updated_at
});

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
      res.redirect(`${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`);
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
      'SELECT id, email, name, phone_number, profile_picture, is_admin, created_at, updated_at FROM users WHERE id = $1',
      [authReq.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(formatUserResponse(result.rows[0]));
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update current user profile (name + phone number)
router.put('/me', authenticateUser, validateProfileUpdate, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { name, phone_number } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }

    if (phone_number !== undefined) {
      const normalizedPhone =
        phone_number === null || phone_number === ''
          ? null
          : String(phone_number).replace(/[^0-9]/g, '');

      // Safety net: validator should guarantee 10 digits when provided
      if (normalizedPhone && normalizedPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          error: 'Phone number must be exactly 10 digits'
        });
      }

      updates.push(`phone_number = $${paramIndex++}`);
      values.push(normalizedPhone);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No profile fields to update'
      });
    }

    values.push(authReq.user!.id);

    const updateResult = await db.query(
      `
        UPDATE users
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING id, email, name, phone_number, profile_picture, is_admin, created_at, updated_at
      `,
      values
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: formatUserResponse(updateResult.rows[0])
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Logout (client-side handles token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

export default router;
