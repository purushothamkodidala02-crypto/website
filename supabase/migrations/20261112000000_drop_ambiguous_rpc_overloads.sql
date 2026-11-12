-- =============================================================================
-- Migration: 20261112000000_drop_ambiguous_rpc_overloads.sql
-- Purpose: Remove redundant legacy wrapper overloads created alongside functions
--          that already specify `requested_device_token text default null`.
--          Leaving both triggers PostgREST PGRST203 overload ambiguity when
--          requested_device_token is omitted.
-- =============================================================================

drop function if exists public.save_mock_test_answer_update(uuid, uuid, text);
drop function if exists public.sync_mock_test_session_timer(uuid);
drop function if exists public.start_mock_test_session(uuid);
