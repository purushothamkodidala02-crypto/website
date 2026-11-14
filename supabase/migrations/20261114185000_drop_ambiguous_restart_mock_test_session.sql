-- Migration: 20261114185000_drop_ambiguous_restart_mock_test_session.sql
-- Purpose: Drop the legacy 1-parameter restart_mock_test_session(uuid) overload.
--          The function with `requested_device_token text default null` already handles
--          both 1-arg and 2-arg calls, so keeping the 1-arg overload causes PostgREST
--          PGRST203 overload ambiguity when students retake a test.

drop function if exists public.restart_mock_test_session(uuid);

notify pgrst, 'reload schema';
