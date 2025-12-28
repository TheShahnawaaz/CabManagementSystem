// ====================================
// USER TYPES
// ====================================

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone_number: string | null;
  profile_picture?: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UpdateUserProfilePayload {
  name?: string;
  phone_number?: string | null;
}
