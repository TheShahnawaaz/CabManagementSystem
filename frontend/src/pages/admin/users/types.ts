import type { UserWithStats } from "@/types/user.types";

export interface UserFormData {
  name: string;
  email: string;
  phone_number: string;
  is_admin: boolean;
}

export interface UserFormState extends UserFormData {}

export interface UserManagementState {
  users: UserWithStats[];
  loading: boolean;
  isSheetOpen: boolean;
  isDeleteDialogOpen: boolean;
  editingUser: UserWithStats | null;
  deletingUser: UserWithStats | null;
  submitting: boolean;
}
