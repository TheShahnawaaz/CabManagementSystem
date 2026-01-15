import type { UserWithStats } from "@/types/user.types";

export interface UserFormData {
  name: string;
  email: string;
  phone_number: string;
  is_admin: boolean;
}

export type UserFormState = UserFormData;

export type UserRoleFilter = "all" | "admin" | "user";

export interface UsersQueryState {
  search: string;
  role: UserRoleFilter;
  sort: "asc" | "desc";
  pageIndex: number;
  pageSize: number;
}

export interface UsersPaginationState {
  total: number;
  limit: number;
  offset: number;
}

export interface UserStatsData {
  totalUsers: number;
  adminCount: number;
  totalBookings: number;
  confirmedPayments: number;
}

export interface UserManagementState {
  users: UserWithStats[];
  loading: boolean;
  statsLoading: boolean;
  stats: UserStatsData | null;
  isSheetOpen: boolean;
  isDeleteDialogOpen: boolean;
  editingUser: UserWithStats | null;
  deletingUser: UserWithStats | null;
  submitting: boolean;
  query: UsersQueryState;
  pagination: UsersPaginationState;
}
