-- Friday Cab Project - Database Migration
-- Migration: 021_create_reports_module
-- Description: Create reports module for financial tracking and trip analytics
-- Date: 2026-01-17

-- ====================================
-- 1. CREATE ENUM TYPE
-- ====================================

DO $$ BEGIN
  CREATE TYPE adjustment_type_enum AS ENUM ('income', 'expense');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ====================================
-- 2. CREATE REPORTS TABLE
-- ====================================

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
  
  -- Core financial data (manually entered)
  cab_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Notes
  notes TEXT,
  
  -- Audit fields
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_edited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_report_cab_cost_non_negative CHECK (cab_cost >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reports_trip ON reports(trip_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS reports_updated_at ON reports;
CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE reports IS 'Financial reports for trips. One report per trip.';
COMMENT ON COLUMN reports.cab_cost IS 'Cost per cab in INR. Same for all cabs in trip.';
COMMENT ON COLUMN reports.notes IS 'Admin notes about the trip (observations, issues, etc.)';
COMMENT ON COLUMN reports.created_by IS 'User who created this report';
COMMENT ON COLUMN reports.last_edited_by IS 'User who last edited this report';

-- ====================================
-- 3. CREATE REPORT ADJUSTMENTS TABLE
-- ====================================

CREATE TABLE IF NOT EXISTS report_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  
  -- Adjustment details
  adjustment_type adjustment_type_enum NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  
  -- Audit
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_adjustment_amount_positive CHECK (amount > 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_report_adjustments_report ON report_adjustments(report_id);
CREATE INDEX IF NOT EXISTS idx_report_adjustments_type ON report_adjustments(adjustment_type);

-- Comments
COMMENT ON TABLE report_adjustments IS 'Additional income or expense items for a report.';
COMMENT ON COLUMN report_adjustments.adjustment_type IS 'Type: income (adds to revenue) or expense (adds to costs)';
COMMENT ON COLUMN report_adjustments.category IS 'Category: fuel, toll, cash_collection, vacant_seat, etc.';
COMMENT ON COLUMN report_adjustments.description IS 'Optional description of the adjustment';
COMMENT ON COLUMN report_adjustments.amount IS 'Amount in INR. Always positive; type determines +/-';

-- ====================================
-- 4. CREATE REPORT HISTORY TABLE
-- ====================================

CREATE TABLE IF NOT EXISTS report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  
  -- Who and when
  edited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  edited_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- What action
  action VARCHAR(50) NOT NULL,
  -- Actions: 'report_created', 'report_updated', 
  --          'adjustment_added', 'adjustment_updated', 'adjustment_removed'
  
  -- Complete change record as JSONB
  changes JSONB NOT NULL,
  
  -- Optional link to specific adjustment
  adjustment_id UUID REFERENCES report_adjustments(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_report_history_report ON report_history(report_id);
CREATE INDEX IF NOT EXISTS idx_report_history_edited_at ON report_history(report_id, edited_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_history_adjustment ON report_history(adjustment_id) WHERE adjustment_id IS NOT NULL;

-- Comments
COMMENT ON TABLE report_history IS 'Complete audit trail of all changes to reports and adjustments.';
COMMENT ON COLUMN report_history.action IS 'Type of change: report_created, report_updated, adjustment_added/updated/removed';
COMMENT ON COLUMN report_history.changes IS 'JSONB containing old/new values for changed fields';
COMMENT ON COLUMN report_history.adjustment_id IS 'Reference to specific adjustment if action is adjustment-related';

-- ====================================
-- 5. CREATE REPORT FINANCIALS VIEW
-- ====================================

CREATE OR REPLACE VIEW report_financials AS
SELECT 
  r.id as report_id,
  r.trip_id,
  r.cab_cost,
  r.notes,
  r.created_by,
  r.created_at,
  r.last_edited_by,
  r.updated_at,
  
  -- Trip info
  t.trip_title,
  t.trip_date,
  t.amount_per_person,
  
  -- Trip stats
  COALESCE(tu_stats.student_count, 0) as total_students,
  COALESCE(cab_stats.cab_count, 0) as total_cabs,
  
  -- Journey stats
  COALESCE(journey_stats.pickup_count, 0) as pickup_count,
  COALESCE(journey_stats.dropoff_count, 0) as dropoff_count,
  
  -- No-show counts (separate for pickup and dropoff)
  COALESCE(tu_stats.student_count, 0) - COALESCE(journey_stats.pickup_count, 0) as no_show_pickup,
  COALESCE(tu_stats.student_count, 0) - COALESCE(journey_stats.dropoff_count, 0) as no_show_dropoff,
  
  -- Seat utilization (percentage)
  CASE 
    WHEN COALESCE(cab_stats.cab_count, 0) > 0 
    THEN ROUND((COALESCE(tu_stats.student_count, 0)::numeric / (cab_stats.cab_count * 7)) * 100, 1)
    ELSE 0 
  END as seat_utilization,
  
  -- Revenue from payments (confirmed only)
  COALESCE(payment_stats.confirmed_count, 0) as confirmed_payments,
  COALESCE(payment_stats.pending_count, 0) as pending_payments,
  COALESCE(payment_stats.failed_count, 0) as failed_payments,
  COALESCE(payment_stats.gross_revenue, 0) as gross_revenue,
  COALESCE(payment_stats.gateway_fees, 0) as gateway_fees,
  COALESCE(payment_stats.gateway_tax, 0) as gateway_tax,
  COALESCE(payment_stats.net_revenue, 0) as net_revenue,
  
  -- Cab expenses
  r.cab_cost * COALESCE(cab_stats.cab_count, 0) as total_cab_expense,
  
  -- Adjustments
  COALESCE(adj_stats.income_count, 0) as adjustment_income_count,
  COALESCE(adj_stats.expense_count, 0) as adjustment_expense_count,
  COALESCE(adj_stats.total_income, 0) as additional_income,
  COALESCE(adj_stats.total_expense, 0) as additional_expense,
  
  -- Final calculations
  COALESCE(payment_stats.net_revenue, 0) + COALESCE(adj_stats.total_income, 0) as total_income,
  (r.cab_cost * COALESCE(cab_stats.cab_count, 0)) + COALESCE(adj_stats.total_expense, 0) as total_expense,
  
  -- Net profit
  (COALESCE(payment_stats.net_revenue, 0) + COALESCE(adj_stats.total_income, 0)) 
    - ((r.cab_cost * COALESCE(cab_stats.cab_count, 0)) + COALESCE(adj_stats.total_expense, 0)) as net_profit,
  
  -- Profit margin (percentage of gross revenue)
  CASE 
    WHEN COALESCE(payment_stats.gross_revenue, 0) > 0 
    THEN ROUND(
      (((COALESCE(payment_stats.net_revenue, 0) + COALESCE(adj_stats.total_income, 0)) 
        - ((r.cab_cost * COALESCE(cab_stats.cab_count, 0)) + COALESCE(adj_stats.total_expense, 0)))
       / payment_stats.gross_revenue) * 100, 1)
    ELSE 0 
  END as profit_margin

FROM reports r
JOIN trips t ON r.trip_id = t.id

-- Student count
LEFT JOIN (
  SELECT trip_id, COUNT(*) as student_count 
  FROM trip_users 
  GROUP BY trip_id
) tu_stats ON r.trip_id = tu_stats.trip_id

-- Cab count
LEFT JOIN (
  SELECT trip_id, COUNT(*) as cab_count 
  FROM cabs 
  GROUP BY trip_id
) cab_stats ON r.trip_id = cab_stats.trip_id

-- Journey stats
LEFT JOIN (
  SELECT 
    trip_id,
    COUNT(*) FILTER (WHERE journey_type = 'pickup') as pickup_count,
    COUNT(*) FILTER (WHERE journey_type = 'dropoff') as dropoff_count
  FROM journeys 
  GROUP BY trip_id
) journey_stats ON r.trip_id = journey_stats.trip_id

-- Payment stats
LEFT JOIN (
  SELECT 
    trip_id,
    COUNT(*) FILTER (WHERE payment_status = 'confirmed') as confirmed_count,
    COUNT(*) FILTER (WHERE payment_status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE payment_status = 'failed') as failed_count,
    COALESCE(SUM(payment_amount) FILTER (WHERE payment_status = 'confirmed'), 0) as gross_revenue,
    COALESCE(SUM(COALESCE(gateway_fee, 0)) FILTER (WHERE payment_status = 'confirmed'), 0) / 100.0 as gateway_fees,
    COALESCE(SUM(COALESCE(gateway_tax, 0)) FILTER (WHERE payment_status = 'confirmed'), 0) / 100.0 as gateway_tax,
    COALESCE(SUM(
      CASE 
        WHEN net_amount IS NOT NULL THEN net_amount / 100.0
        ELSE payment_amount - ((COALESCE(gateway_fee, 0) + COALESCE(gateway_tax, 0)) / 100.0)
      END
    ) FILTER (WHERE payment_status = 'confirmed'), 0) as net_revenue
  FROM payments 
  GROUP BY trip_id
) payment_stats ON r.trip_id = payment_stats.trip_id

-- Adjustment stats
LEFT JOIN (
  SELECT 
    report_id,
    COUNT(*) FILTER (WHERE adjustment_type = 'income') as income_count,
    COUNT(*) FILTER (WHERE adjustment_type = 'expense') as expense_count,
    COALESCE(SUM(amount) FILTER (WHERE adjustment_type = 'income'), 0) as total_income,
    COALESCE(SUM(amount) FILTER (WHERE adjustment_type = 'expense'), 0) as total_expense
  FROM report_adjustments 
  GROUP BY report_id
) adj_stats ON r.id = adj_stats.report_id;

COMMENT ON VIEW report_financials IS 'Complete financial view for reports with all computed values from related tables.';

-- ====================================
-- 6. CREATE REPORTS SUMMARY VIEW
-- ====================================

CREATE OR REPLACE VIEW reports_summary AS
SELECT 
  COUNT(*) as total_reports,
  COALESCE(SUM(total_students), 0) as total_students,
  COALESCE(SUM(total_cabs), 0) as total_cabs,
  COALESCE(SUM(gross_revenue), 0) as total_gross_revenue,
  COALESCE(SUM(gateway_fees + gateway_tax), 0) as total_gateway_deductions,
  COALESCE(SUM(net_revenue), 0) as total_net_revenue,
  COALESCE(SUM(total_cab_expense), 0) as total_cab_expense,
  COALESCE(SUM(additional_expense), 0) as total_additional_expense,
  COALESCE(SUM(additional_income), 0) as total_additional_income,
  COALESCE(SUM(total_expense), 0) as total_expense,
  COALESCE(SUM(total_income), 0) as total_income,
  COALESCE(SUM(net_profit), 0) as total_net_profit,
  CASE 
    WHEN SUM(gross_revenue) > 0 
    THEN ROUND((SUM(net_profit) / SUM(gross_revenue)) * 100, 1)
    ELSE 0 
  END as overall_profit_margin,
  CASE 
    WHEN COUNT(*) > 0 
    THEN ROUND(SUM(net_profit) / COUNT(*), 2)
    ELSE 0 
  END as avg_profit_per_trip,
  CASE 
    WHEN COUNT(*) > 0 
    THEN ROUND(SUM(total_students)::numeric / COUNT(*), 1)
    ELSE 0 
  END as avg_students_per_trip
FROM report_financials;

COMMENT ON VIEW reports_summary IS 'Aggregated summary across all reports for dashboard display.';

-- ====================================
-- 7. CREATE TRIPS WITHOUT REPORT VIEW
-- ====================================

CREATE OR REPLACE VIEW trips_without_report AS
SELECT 
  t.id as trip_id,
  t.trip_title,
  t.trip_date,
  t.amount_per_person,
  COALESCE(tu.student_count, 0) as total_students,
  COALESCE(c.cab_count, 0) as total_cabs,
  COALESCE(p.gross_revenue, 0) as gross_revenue
FROM trips t
LEFT JOIN reports r ON t.id = r.trip_id
LEFT JOIN (SELECT trip_id, COUNT(*) as student_count FROM trip_users GROUP BY trip_id) tu ON t.id = tu.trip_id
LEFT JOIN (SELECT trip_id, COUNT(*) as cab_count FROM cabs GROUP BY trip_id) c ON t.id = c.trip_id
LEFT JOIN (
  SELECT trip_id, COALESCE(SUM(payment_amount), 0) as gross_revenue 
  FROM payments 
  WHERE payment_status = 'confirmed' 
  GROUP BY trip_id
) p ON t.id = p.trip_id
WHERE r.id IS NULL
  AND t.trip_date <= CURRENT_DATE  -- Only past/today trips
ORDER BY t.trip_date DESC;

COMMENT ON VIEW trips_without_report IS 'List of completed trips that do not have a report yet.';

-- ====================================
-- VERIFY MIGRATION
-- ====================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Migration 021: Reports module created successfully';
  RAISE NOTICE '   - Table: reports';
  RAISE NOTICE '   - Table: report_adjustments';
  RAISE NOTICE '   - Table: report_history';
  RAISE NOTICE '   - View: report_financials';
  RAISE NOTICE '   - View: reports_summary';
  RAISE NOTICE '   - View: trips_without_report';
END $$;
