-- ====================================
-- Migration: Create Activity Logs Table
-- ====================================
-- An extensible activity logging table to track admin (and future user) actions.
-- Uses JSONB 'details' column for flexible, action-specific context payloads.

CREATE TABLE IF NOT EXISTS activity_logs (
  id              SERIAL PRIMARY KEY,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,    -- Actor (admin/user performing the action)
  target_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,    -- Target user (if action is on a user)
  action_type     VARCHAR(100) NOT NULL,                           -- e.g. TRIP_CREATED, USER_BOARDED
  entity_type     VARCHAR(100),                                    -- e.g. trip, journey, report
  entity_id       VARCHAR(255),                                    -- UUID of the affected entity
  details         JSONB DEFAULT '{}',                              -- Extensible context payload
  ip_address      VARCHAR(45),                                     -- Optional IP tracking
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
