-- Friday Cab Project - Database Migration
-- Migration: 010_update_hall_enum_for_groups
-- Description: Update hall enum to support grouped pickup points (RK, PAN, LBS, VS)
-- Date: 2025-12-27

-- The existing enum has individual halls, but we want to use grouped pickup points
-- Add the grouped pickup point values if they don't exist

DO $$ 
BEGIN
  -- Check if we need to alter the enum
  -- We'll keep all existing values and ensure our grouped codes exist
  
  -- The enum already has: LBS, MMM, RK, RP, GKH, VS, MS, HJB, JCB, LLR, PAN
  -- We're using: RK (for RK+RP), PAN (for PAN loop), LBS (for LBS+MMM), VS (for VS+MS+HJB+JCB+LLR)
  -- So we don't need to add anything, just document the grouping
  
  NULL; -- No changes needed, enum already has all required values
END $$;

-- Update comments to reflect the grouping strategy
COMMENT ON COLUMN trip_users.hall IS 'Grouped pickup point selected by student. Values: RK (RK+RP), PAN (PAN Loop), LBS (LBS+MMM), VS (VS+MS+HJB+JCB+LLR). Used for cab allocation and routing.';

COMMENT ON TYPE hall_enum IS 'Hall/Residence codes. In booking UI, grouped as: RK (RK+RP), PAN (PAN Loop), LBS (LBS+MMM), VS (VS+MS+HJB+JCB+LLR). Individual codes preserved for flexibility.';

