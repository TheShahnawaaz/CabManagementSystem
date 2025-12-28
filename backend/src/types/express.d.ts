import { Request } from 'express';

// Extend Express Request to include our custom user type
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
      phone_number?: string | null;
      profile_picture?: string;
      is_admin: boolean;
      isAdmin: boolean; // Add this for consistency
      created_at?: Date;
      updated_at?: Date;
    }
  }
}

export interface AuthRequest extends Request {
  user?: Express.User;
}
