-- Migration: 20261114193000_add_dynamic_surveys_settings.sql
-- Purpose: Add JSONB settings column to dynamic_surveys for survey display rules,
--          audience targeting, re-appearance frequency, and quota restrictions.

alter table if exists public.dynamic_surveys
  add column if not exists settings jsonb default '{}'::jsonb;

notify pgrst, 'reload schema';
