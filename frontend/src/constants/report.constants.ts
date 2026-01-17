/**
 * Report Constants
 * Categories and labels for the reports module
 */

import {
  Fuel,
  Milestone,
  UtensilsCrossed,
  ParkingCircle,
  Banknote,
  Car,
  Phone,
  Siren,
  RotateCcw,
  FileText,
  Wallet,
  Armchair,
  Clock,
  Gift,
  Handshake,
  type LucideIcon,
} from 'lucide-react';

// ====================================
// ADJUSTMENT CATEGORIES
// ====================================

export interface AdjustmentCategory {
  value: string;
  label: string;
  icon: LucideIcon;
}

export const EXPENSE_CATEGORIES: AdjustmentCategory[] = [
  { value: 'fuel', label: 'Fuel Reimbursement', icon: Fuel },
  { value: 'toll', label: 'Toll Charges', icon: Milestone },
  { value: 'food', label: 'Food/Refreshments', icon: UtensilsCrossed },
  { value: 'parking', label: 'Parking', icon: ParkingCircle },
  { value: 'driver_tip', label: 'Driver Tip', icon: Banknote },
  { value: 'driver_extra', label: 'Driver Extra Payment', icon: Car },
  { value: 'coordination', label: 'Coordination Cost', icon: Phone },
  { value: 'emergency', label: 'Emergency Expense', icon: Siren },
  { value: 'refund', label: 'Refund Given', icon: RotateCcw },
  { value: 'misc_expense', label: 'Other Expense', icon: FileText },
];

export const INCOME_CATEGORIES: AdjustmentCategory[] = [
  { value: 'cash_collection', label: 'Cash Collection', icon: Wallet },
  { value: 'vacant_seat', label: 'Vacant Seat Sale', icon: Armchair },
  { value: 'late_payment', label: 'Late Cash Payment', icon: Clock },
  { value: 'donation', label: 'Donation Received', icon: Gift },
  { value: 'sponsor', label: 'Sponsorship', icon: Handshake },
  { value: 'misc_income', label: 'Other Income', icon: FileText },
];

export const ADJUSTMENT_CATEGORIES = {
  expense: EXPENSE_CATEGORIES,
  income: INCOME_CATEGORIES,
} as const;

// ====================================
// HELPER FUNCTIONS
// ====================================

export function getCategoryByValue(
  type: 'income' | 'expense',
  value: string
): AdjustmentCategory | undefined {
  return ADJUSTMENT_CATEGORIES[type].find((cat) => cat.value === value);
}

export function getCategoryLabel(
  type: 'income' | 'expense',
  value: string
): string {
  const category = getCategoryByValue(type, value);
  return category?.label || value;
}

export function getCategoryIcon(
  type: 'income' | 'expense',
  value: string
): LucideIcon {
  const category = getCategoryByValue(type, value);
  return category?.icon || FileText;
}

// ====================================
// HISTORY ACTION LABELS
// ====================================

export const HISTORY_ACTION_LABELS: Record<string, string> = {
  report_created: 'Created report',
  report_updated: 'Updated report',
  adjustment_added: 'Added adjustment',
  adjustment_updated: 'Updated adjustment',
  adjustment_removed: 'Removed adjustment',
};

// ====================================
// FORMATTING HELPERS
// ====================================

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num || 0);
}

export function formatPercentage(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  const safeNum = num || 0;
  const sign = safeNum >= 0 ? '+' : '';
  return `${sign}${safeNum.toFixed(1)}%`;
}

export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-IN').format(num || 0);
}
