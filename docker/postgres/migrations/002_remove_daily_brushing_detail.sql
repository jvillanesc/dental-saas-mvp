-- Migration: Remove daily_brushing_detail column from medical_history table
-- Date: 2026-03-10
-- Description: Remove unused daily_brushing_detail field from medical history

ALTER TABLE medical_history DROP COLUMN IF EXISTS daily_brushing_detail;
