// ====================================
// COMMON API TYPES
// ====================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string | string[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface ApiError {
  error: string;
  details?: string | string[];
  statusCode?: number;
}
