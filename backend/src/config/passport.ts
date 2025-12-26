import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import db from './database';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback'
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const profilePicture = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error('No email found in Google profile'), undefined);
        }

        // Check if user exists
        const existingUserResult = await db.query(
          'SELECT * FROM users WHERE email = $1',
          [email]
        );

        let user;

        if (existingUserResult.rows.length > 0) {
          // User exists, update profile picture if changed
          user = existingUserResult.rows[0];
          
          if (user.profile_picture !== profilePicture) {
            const updateResult = await db.query(
              'UPDATE users SET profile_picture = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
              [profilePicture, user.id]
            );
            user = updateResult.rows[0];
          }
        } else {
          // Create new user
          const insertResult = await db.query(
            `INSERT INTO users (email, name, profile_picture, is_admin, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, NOW(), NOW()) 
             RETURNING *`,
            [email, name, profilePicture, false]
          );
          user = insertResult.rows[0];
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

