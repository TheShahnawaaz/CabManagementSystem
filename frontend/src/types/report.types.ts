/**
 * Report Types
 * Type definitions for the reports module
 */

// ====================================
// ENUMS
// ====================================

export type AdjustmentType = 'income' | 'expense';

export type ReportHistoryAction =
  | 'report_created'
  | 'report_updated'
  | 'adjustment_added'
  | 'adjustment_updated'
  | 'adjustment_removed';

// ====================================
// USER TYPE
// ====================================

export interface ReportUser {
  id: string;
  name: string;
  email?: string;
  phone_number?: string;
  profile_picture?: string;
}

// ====================================
// BASE ENTITIES
// ====================================

export interface ReportAdjustment {
  id: string;
  report_id: string;
  adjustment_type: AdjustmentType;
  category: string;
  description: string | null;
  amount: number;
  created_by: string;
  created_at: string;
  created_by_user?: ReportUser;
}

export interface ReportHistory {
  id: string;
  report_id: string;
  edited_by: string;
  edited_at: string;
  action: ReportHistoryAction;
  changes: Record<string, unknown>;
  adjustment_id: string | null;
  edited_by_user: ReportUser;
}

// ====================================
// VIEW TYPES (from report_financials)
// ====================================

export interface ReportFinancials {
  // Report base
  report_id: string;
  trip_id: string;
  cab_cost: number;
  notes: string | null;
  created_by: string;
  created_at: string;
  last_edited_by: string | null;
  updated_at: string;

  // Trip info
  trip_title: string;
  trip_date: string;
  amount_per_person: number;

  // Trip stats
  total_students: number;
  total_cabs: number;

  // Journey stats
  pickup_count: number;
  dropoff_count: number;
  no_show_pickup: number;
  no_show_dropoff: number;
  seat_utilization: number;

  // Payment stats
  confirmed_payments: number;
  pending_payments: number;
  failed_payments: number;
  gross_revenue: number;
  gateway_fees: number;
  gateway_tax: number;
  net_revenue: number;

  // Cab expenses
  total_cab_expense: number;

  // Adjustments
  adjustment_income_count: number;
  adjustment_expense_count: number;
  additional_income: number;
  additional_expense: number;

  // Totals
  total_income: number;
  total_expense: number;
  net_profit: number;
  profit_margin: number;

  // Users
  created_by_user: ReportUser | null;
  last_edited_by_user: ReportUser | null;
}

export interface ReportsSummary {
  total_reports: number;
  total_students: number;
  total_cabs: number;
  total_gross_revenue: number;
  total_gateway_deductions: number;
  total_net_revenue: number;
  total_cab_expense: number;
  total_additional_expense: number;
  total_additional_income: number;
  total_expense: number;
  total_income: number;
  total_net_profit: number;
  overall_profit_margin: number;
  avg_profit_per_trip: number;
  avg_students_per_trip: number;
}

export interface TripWithoutReport {
  trip_id: string;
  trip_title: string;
  trip_date: string;
  amount_per_person: number;
  total_students: number;
  total_cabs: number;
  gross_revenue: number;
}

// ====================================
// FULL REPORT WITH ADJUSTMENTS
// ====================================

export interface ReportWithAdjustments extends ReportFinancials {
  adjustments: ReportAdjustment[];
}

// ====================================
// DTO TYPES
// ====================================

export interface CreateReportDTO {
  trip_id: string;
  cab_cost: number;
  notes?: string;
}

export interface UpdateReportDTO {
  cab_cost?: number;
  notes?: string | null; // null to clear, undefined to skip
}

export interface CreateAdjustmentDTO {
  adjustment_type: AdjustmentType;
  category: string;
  description?: string;
  amount: number;
}

export interface UpdateAdjustmentDTO {
  category?: string;
  description?: string;
  amount?: number;
}

// ====================================
// API RESPONSE TYPES
// ====================================

export interface ReportCheckResponse {
  has_report: boolean;
  report_id: string | null;
}
