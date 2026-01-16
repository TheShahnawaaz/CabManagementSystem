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
// BASE ENTITIES
// ====================================

export interface Report {
  id: string;
  trip_id: string;
  cab_cost: number;
  notes: string | null;
  created_by: string;
  created_at: Date;
  last_edited_by: string | null;
  updated_at: Date;
}

export interface ReportAdjustment {
  id: string;
  report_id: string;
  adjustment_type: AdjustmentType;
  category: string;
  description: string | null;
  amount: number;
  created_by: string;
  created_at: Date;
}

export interface ReportHistory {
  id: string;
  report_id: string;
  edited_by: string;
  edited_at: Date;
  action: ReportHistoryAction;
  changes: Record<string, any>;
  adjustment_id: string | null;
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
  created_at: Date;
  last_edited_by: string | null;
  updated_at: Date;
  
  // Trip info
  trip_title: string;
  trip_date: Date;
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
  trip_date: Date;
  amount_per_person: number;
  total_students: number;
  total_cabs: number;
  gross_revenue: number;
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
  notes?: string;
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
// RESPONSE TYPES
// ====================================

export interface ReportWithAdjustments extends ReportFinancials {
  adjustments: ReportAdjustment[];
  created_by_user: { id: string; name: string; email: string } | null;
  last_edited_by_user: { id: string; name: string; email: string } | null;
}

export interface ReportHistoryWithUser extends ReportHistory {
  edited_by_user: { id: string; name: string; email: string };
}

export interface ReportListItem {
  report_id: string;
  trip_id: string;
  trip_title: string;
  trip_date: Date;
  total_students: number;
  total_cabs: number;
  gross_revenue: number;
  net_profit: number;
  profit_margin: number;
  created_at: Date;
  updated_at: Date;
  created_by_user: { id: string; name: string } | null;
  last_edited_by_user: { id: string; name: string } | null;
}

// ====================================
// HISTORY CHANGE TYPES
// ====================================

export interface FieldChange<T = any> {
  old: T | null;
  new: T;
}

export interface ReportCreatedChanges {
  cab_cost: FieldChange<number>;
  notes?: FieldChange<string>;
}

export interface ReportUpdatedChanges {
  cab_cost?: FieldChange<number>;
  notes?: FieldChange<string>;
}

export interface AdjustmentAddedChanges {
  adjustment: {
    id: string;
    type: AdjustmentType;
    category: string;
    description: string | null;
    amount: number;
  };
}

export interface AdjustmentUpdatedChanges {
  adjustment_id: string;
  changes: {
    category?: FieldChange<string>;
    description?: FieldChange<string | null>;
    amount?: FieldChange<number>;
  };
}

export interface AdjustmentRemovedChanges {
  adjustment: {
    id: string;
    type: AdjustmentType;
    category: string;
    description: string | null;
    amount: number;
  };
}
