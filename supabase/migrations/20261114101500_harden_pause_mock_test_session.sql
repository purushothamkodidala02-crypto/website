-- =============================================================================
-- Migration: 20261114101500_harden_pause_mock_test_session.sql
-- Purpose: Harden pause_mock_test_session so that if a session is already paused
--          (e.g. concurrent or duplicate calls), it returns the existing
--          remaining_seconds instead of throwing an unhandled exception.
-- =============================================================================

create or replace function public.pause_mock_test_session(
  requested_session_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  paused_seconds integer;
begin
  if auth.uid() is null then
    raise exception 'You must be logged in.';
  end if;

  update public.test_attempt_sessions as session
  set remaining_seconds = greatest(
        0,
        ceil(extract(epoch from (session.expires_at - now())))::integer
      ),
      session_state = 'paused',
      last_timer_sync_at = now()
  where session.id = requested_session_id
    and session.user_id = auth.uid()
    and session.submitted_at is null
    and session.session_state = 'active'
  returning session.remaining_seconds into paused_seconds;

  -- If session was already paused, return the already recorded remaining_seconds
  if paused_seconds is null then
    select session.remaining_seconds into paused_seconds
    from public.test_attempt_sessions as session
    where session.id = requested_session_id
      and session.user_id = auth.uid()
      and session.submitted_at is null
      and session.session_state = 'paused';
  end if;

  if paused_seconds is null then
    raise exception 'This practice attempt is not active.';
  end if;
  return paused_seconds;
end;
$$;

revoke all on function public.pause_mock_test_session(uuid) from public;
grant execute on function public.pause_mock_test_session(uuid) to authenticated;
