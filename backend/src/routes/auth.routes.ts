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
  email_notifications: user.email_notifications ?? true, // Default true
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
      'SELECT id, email, name, phone_number, profile_picture, is_admin, email_notifications, created_at, updated_at FROM users WHERE id = $1',
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

// Update current user profile (name, phone number, email_notifications)
router.put('/me', authenticateUser, validateProfileUpdate, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { name, phone_number, email_notifications } = req.body;

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

    // Handle email notifications preference
    if (email_notifications !== undefined) {
      updates.push(`email_notifications = $${paramIndex++}`);
      values.push(Boolean(email_notifications));
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
        RETURNING id, email, name, phone_number, profile_picture, is_admin, email_notifications, created_at, updated_at
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

// ============================================
// TEMPORARY: Razorpay Verification Login
// This endpoint is only enabled when ENABLE_VERIFY_LOGIN=true
// Remove this after Razorpay verification is complete
// ============================================
router.post('/verify-login', async (req, res) => {
  try {
    // Check if verification login is enabled
    if (process.env.ENABLE_VERIFY_LOGIN !== 'true') {
      return res.status(404).json({ error: 'Not found' });
    }

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check against environment variables
    const verifyEmail = process.env.VERIFY_EMAIL;
    const verifyPassword = process.env.VERIFY_PASSWORD;

    if (!verifyEmail || !verifyPassword) {
      console.error('VERIFY_EMAIL or VERIFY_PASSWORD not configured');
      return res.status(500).json({ error: 'Verification login not configured' });
    }

    // Validate credentials
    if (email !== verifyEmail || password !== verifyPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Find user in database
    const result = await db.query(
      'SELECT id, email, name, phone_number, profile_picture, is_admin FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'User not found. Please ensure the test user exists in the database.' 
      });
    }

    const user = result.rows[0];

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      isAdmin: user.is_admin
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Verify login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Check if verify login is enabled (for frontend to show/hide the option)
router.get('/verify-login/status', (req, res) => {
  res.json({ 
    enabled: process.env.ENABLE_VERIFY_LOGIN === 'true' 
  });
});

export default router;
