-- =============================================================================
-- Migration: 20261107020000_single_device_enforcement.sql
-- Purpose: Enforce Single-Device Login site-wide and seamless single-device
--          execution for Mock Test exam sessions with automatic displacement.
-- =============================================================================

-- 1. Add active session tracking to profiles
alter table public.profiles
  add column if not exists active_session_token text,
  add column if not exists active_session_updated_at timestamptz default now();

create index if not exists idx_profiles_active_session_token
  on public.profiles(id, active_session_token);

-- 2. Add active device tracking to test attempt sessions
alter table public.test_attempt_sessions
  add column if not exists active_device_token text,
  add column if not exists last_device_heartbeat_at timestamptz default now();

create index if not exists idx_test_attempt_sessions_device
  on public.test_attempt_sessions(id, active_device_token);

-- 3. Function to update a student's active site session token
create or replace function public.set_active_site_session(
  requested_session_token text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'You must be logged in.';
  end if;

  update public.profiles
  set active_session_token = requested_session_token,
      active_session_updated_at = now()
  where id = auth.uid();
end;
$$;

revoke all on function public.set_active_site_session(text) from public;
grant execute on function public.set_active_site_session(text) to authenticated;

-- 4. Function to check if the current site session is active
create or replace function public.verify_active_site_session(
  requested_session_token text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role text;
  stored_token text;
begin
  if auth.uid() is null then
    return false;
  end if;

  select role, active_session_token
  into user_role, stored_token
  from public.profiles
  where id = auth.uid();

  -- Administrators are exempt from single-device displacement
  if user_role = 'admin' then
    return true;
  end if;

  -- If no token has been set yet, allow session
  if stored_token is null or requested_session_token is null then
    return true;
  end if;

  return stored_token = requested_session_token;
end;
$$;

revoke all on function public.verify_active_site_session(text) from public;
grant execute on function public.verify_active_site_session(text) to authenticated;

-- 5. Update start_mock_test_session to accept and register the active device token
create or replace function public.start_mock_test_session(
  requested_mock_test_id uuid,
  requested_device_token text default null
)
returns table (
  session_id uuid,
  mock_test_id uuid,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  resumable_session_id uuid;
  resumable_seconds integer;
  resumed_expires_at timestamptz;
  new_session_id uuid;
  test_duration_minutes integer;
  test_scope text;
  test_paper_id uuid;
  test_subject_id uuid;
  configured_question_count integer;
  snapshot_count integer;
  current_session_expires_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'You must be logged in.';
  end if;

  if not public.can_access_mock_test(requested_mock_test_id) then
    raise exception 'You do not have access to this Mock Test.';
  end if;

  perform pg_advisory_xact_lock(
    hashtext(auth.uid()::text),
    hashtext(requested_mock_test_id::text)
  );

  select session.id, coalesce(session.remaining_seconds, 0), session.expires_at
  into resumable_session_id, resumable_seconds, current_session_expires_at
  from public.test_attempt_sessions as session
  where session.user_id = auth.uid()
    and session.mock_test_id = requested_mock_test_id
    and session.submitted_at is null
  order by session.started_at desc
  limit 1
  for update;

  -- If session has remaining seconds or active time left, resume it cleanly
  if resumable_session_id is not null then
    -- If remaining_seconds was 0 but expires_at is still in the future, calculate remaining seconds
    if resumable_seconds <= 0 and current_session_expires_at > now() then
      resumable_seconds := greatest(1, ceil(extract(epoch from (current_session_expires_at - now())))::integer);
    end if;

    if resumable_seconds > 0 then
      resumed_expires_at := now() + resumable_seconds * interval '1 second';
      update public.test_attempt_sessions
      set session_state = 'active',
          remaining_seconds = resumable_seconds,
          expires_at = resumed_expires_at,
          last_timer_sync_at = now(),
          active_device_token = coalesce(requested_device_token, active_device_token),
          last_device_heartbeat_at = now()
      where id = resumable_session_id;

      return query
        select resumable_session_id, requested_mock_test_id, resumed_expires_at;
      return;
    end if;

    -- Only delete stale exhausted sessions
    delete from public.test_attempt_sessions where id = resumable_session_id;
  end if;

  select mock_test.duration_minutes, mock_test.test_scope, mock_test.paper_id,
    mock_test.subject_id, paper.question_count
  into test_duration_minutes, test_scope, test_paper_id, test_subject_id,
    configured_question_count
  from public.mock_tests as mock_test
  join public.papers as paper on paper.id = mock_test.paper_id
  where mock_test.id = requested_mock_test_id
    and mock_test.status = 'published';

  if test_duration_minutes is null then
    raise exception 'Mock Test is not available.';
  end if;

  insert into public.test_attempt_sessions (
    user_id, mock_test_id, expires_at, session_state,
    remaining_seconds, last_timer_sync_at, active_device_token, last_device_heartbeat_at
  ) values (
    auth.uid(), requested_mock_test_id,
    now() + test_duration_minutes * interval '1 minute',
    'active', test_duration_minutes * 60, now(),
    requested_device_token, now()
  ) returning id, test_attempt_sessions.expires_at
    into new_session_id, resumed_expires_at;

  insert into public.test_attempt_session_questions (
    session_id, question_id, question_order, marks, negative_marks,
    question_text, option_a, option_b, option_c, option_d,
    correct_answer, explanation, image_url, content_language_mode,
    question_text_te, option_a_te, option_b_te, option_c_te, option_d_te,
    explanation_te
  )
  select
    new_session_id, question.id,
    row_number() over (order by coalesce(subject.display_order, 999), assignment.question_order),
    assignment.marks, assignment.negative_marks,
    question.question_text, question.option_a, question.option_b,
    question.option_c, question.option_d, question.correct_answer,
    question.explanation, question.image_url, subject.content_language_mode,
    question.question_text_te, question.option_a_te, question.option_b_te,
    question.option_c_te, question.option_d_te, question.explanation_te
  from public.mock_test_questions as assignment
  join public.questions as question on question.id = assignment.question_id
  join public.subjects as subject on subject.id = question.subject_id
  where assignment.mock_test_id = requested_mock_test_id
    and question.is_active = true
    and subject.paper_id = test_paper_id
    and (test_scope = 'paper' or question.subject_id = test_subject_id)
    and (
      question.content_lifecycle <> 'expires'
      or question.expires_on >= (now() at time zone 'Asia/Kolkata')::date
    )
  order by coalesce(subject.display_order, 999), assignment.question_order;

  get diagnostics snapshot_count = row_count;
  if snapshot_count = 0 then
    delete from public.test_attempt_sessions where id = new_session_id;
    raise exception 'Mock Test has no active Questions.';
  end if;

  if test_scope = 'paper'
     and configured_question_count is not null
     and snapshot_count <> configured_question_count then
    delete from public.test_attempt_sessions where id = new_session_id;
    raise exception 'Mock Test Question count does not match its Paper.';
  end if;

  return query select new_session_id, requested_mock_test_id, resumed_expires_at;
end;
$$;

revoke all on function public.start_mock_test_session(uuid, text) from public;
grant execute on function public.start_mock_test_session(uuid, text) to authenticated;

-- Backwards-compatible overload for existing calls passing only (uuid)
create or replace function public.start_mock_test_session(
  requested_mock_test_id uuid
)
returns table (
  session_id uuid,
  mock_test_id uuid,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query select * from public.start_mock_test_session(requested_mock_test_id, null::text);
end;
$$;

revoke all on function public.start_mock_test_session(uuid) from public;
grant execute on function public.start_mock_test_session(uuid) to authenticated;

-- 6. Check mock test device status (lightweight heartbeat)
create or replace function public.check_mock_test_device_status(
  requested_session_id uuid,
  requested_device_token text
)
returns table (
  is_active boolean,
  is_displaced boolean,
  session_state text,
  remaining_seconds integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  stored_device_token text;
  stored_state text;
  stored_remaining integer;
  stored_expires_at timestamptz;
  stored_submitted_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'You must be logged in.';
  end if;

  select
    session.active_device_token,
    session.session_state,
    session.remaining_seconds,
    session.expires_at,
    session.submitted_at
  into
    stored_device_token,
    stored_state,
    stored_remaining,
    stored_expires_at,
    stored_submitted_at
  from public.test_attempt_sessions as session
  where session.id = requested_session_id
    and session.user_id = auth.uid();

  if stored_state is null then
    return query select false, false, 'not_found'::text, 0;
    return;
  end if;

  if stored_submitted_at is not null then
    return query select false, false, 'submitted'::text, 0;
    return;
  end if;

  -- If a different device has claimed this session, signal displacement!
  if stored_device_token is not null and requested_device_token is not null and stored_device_token <> requested_device_token then
    return query select false, true, stored_state, 0;
    return;
  end if;

  -- Still active on this device: update heartbeat timestamp
  update public.test_attempt_sessions
  set last_device_heartbeat_at = now()
  where id = requested_session_id;

  return query select
    (stored_state = 'active'),
    false,
    stored_state,
    greatest(0, coalesce(stored_remaining, ceil(extract(epoch from (stored_expires_at - now())))::integer));
end;
$$;

revoke all on function public.check_mock_test_device_status(uuid, text) from public;
grant execute on function public.check_mock_test_device_status(uuid, text) to authenticated;

-- 7. Update sync_mock_test_session_timer with device displacement check
create or replace function public.sync_mock_test_session_timer(
  requested_session_id uuid,
  requested_device_token text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  synced_seconds integer;
  stored_device_token text;
begin
  if auth.uid() is null then
    raise exception 'You must be logged in.';
  end if;

  select session.active_device_token into stored_device_token
  from public.test_attempt_sessions as session
  where session.id = requested_session_id
    and session.user_id = auth.uid();

  -- If displaced by another device, abort sync
  if stored_device_token is not null and requested_device_token is not null and stored_device_token <> requested_device_token then
    raise exception 'SESSION_DISPLACED_BY_ANOTHER_DEVICE';
  end if;

  update public.test_attempt_sessions as session
  set remaining_seconds = greatest(0, ceil(extract(epoch from (session.expires_at - now())))::integer),
      last_timer_sync_at = now(),
      last_device_heartbeat_at = now()
  where session.id = requested_session_id
    and session.user_id = auth.uid()
    and session.submitted_at is null
    and session.session_state = 'active'
  returning session.remaining_seconds into synced_seconds;

  if synced_seconds is null then
    raise exception 'This practice attempt is not active.';
  end if;
  return synced_seconds;
end;
$$;

revoke all on function public.sync_mock_test_session_timer(uuid, text) from public;
grant execute on function public.sync_mock_test_session_timer(uuid, text) to authenticated;

-- Backwards-compatible overload for (uuid)
create or replace function public.sync_mock_test_session_timer(
  requested_session_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.sync_mock_test_session_timer(requested_session_id, null::text);
end;
$$;

revoke all on function public.sync_mock_test_session_timer(uuid) from public;
grant execute on function public.sync_mock_test_session_timer(uuid) to authenticated;

-- 8. Update save_mock_test_answer_update with device displacement check
create or replace function public.save_mock_test_answer_update(
  requested_session_id uuid,
  requested_question_id uuid,
  requested_answer text,
  requested_device_token text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  session_expires_at timestamptz;
  stored_device_token text;
begin
  if requested_answer is not null and requested_answer not in ('A', 'B', 'C', 'D') then
    raise exception 'Invalid answer choice.';
  end if;

  select session.expires_at, session.active_device_token
  into session_expires_at, stored_device_token
  from public.test_attempt_sessions as session
  where session.id = requested_session_id
    and session.user_id = auth.uid()
    and session.submitted_at is null
    and session.session_state = 'active'
  for update;

  if session_expires_at is null or now() > session_expires_at then
    raise exception 'This test attempt is no longer active.';
  end if;

  -- If displaced by another device, reject answer write
  if stored_device_token is not null and requested_device_token is not null and stored_device_token <> requested_device_token then
    raise exception 'SESSION_DISPLACED_BY_ANOTHER_DEVICE';
  end if;

  if not exists (
    select 1 from public.test_attempt_session_questions
    where session_id = requested_session_id
      and question_id = requested_question_id
  ) then
    raise exception 'Question is not part of this attempt.';
  end if;

  insert into public.test_attempt_session_answers (
    session_id, question_id, selected_answer
  ) values (
    requested_session_id, requested_question_id, requested_answer
  )
  on conflict (session_id, question_id) do update
    set selected_answer = excluded.selected_answer,
        updated_at = now();
end;
$$;

revoke all on function public.save_mock_test_answer_update(uuid, uuid, text, text) from public;
grant execute on function public.save_mock_test_answer_update(uuid, uuid, text, text) to authenticated;

-- Backwards-compatible overload for (uuid, uuid, text)
create or replace function public.save_mock_test_answer_update(
  requested_session_id uuid,
  requested_question_id uuid,
  requested_answer text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.save_mock_test_answer_update(requested_session_id, requested_question_id, requested_answer, null::text);
end;
$$;

revoke all on function public.save_mock_test_answer_update(uuid, uuid, text) from public;
grant execute on function public.save_mock_test_answer_update(uuid, uuid, text) to authenticated;
