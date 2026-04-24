import db from '../config/database';

export interface GoogleUserProfile {
  email: string;
  name?: string | null;
  profilePicture?: string | null;
}

export const findOrCreateGoogleUser = async ({
  email,
  name,
  profilePicture
}: GoogleUserProfile) => {
  const existingUserResult = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (existingUserResult.rows.length > 0) {
    let user = existingUserResult.rows[0];

    if (user.profile_picture !== profilePicture) {
      const updateResult = await db.query(
        'UPDATE users SET profile_picture = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [profilePicture, user.id]
      );
      user = updateResult.rows[0];
    }

    return user;
  }

  const insertResult = await db.query(
    `INSERT INTO users (email, name, profile_picture, is_admin, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING *`,
    [email, name, profilePicture, false]
  );

  return insertResult.rows[0];
};
