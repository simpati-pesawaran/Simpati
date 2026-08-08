-- ============================================================================
-- Migration: Add missing enum values for activity_logs
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================================

-- Add 'view' to action_type
ALTER TYPE action_type ADD VALUE IF NOT EXISTS 'view';

-- Add 'publish' to action_type
ALTER TYPE action_type ADD VALUE IF NOT EXISTS 'publish';

-- Add 'cancel' to action_type
ALTER TYPE action_type ADD VALUE IF NOT EXISTS 'cancel';

-- Add 'sync_failure' to action_type
ALTER TYPE action_type ADD VALUE IF NOT EXISTS 'sync_failure';

-- Add 'audiensi' to entity_type
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'audiensi';

-- Add 'auth' to entity_type
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'auth';

-- Add 'user' to entity_type
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'user';

-- Verify the changes
SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'action_type');
SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'entity_type');
