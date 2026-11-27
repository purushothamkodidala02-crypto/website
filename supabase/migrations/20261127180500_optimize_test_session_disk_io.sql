-- =============================================================================
-- VARADHI - OPTIMIZE TEST SESSION & SUBMISSION DISK IO
-- =============================================================================
-- 1. start_mock_test_session: derive remaining time from authoritative
--    expires_at whenever resuming an active (unpaused) session so longer
--    client timer-sync intervals never grant extra clock time.
-- 2. submit_mock_test_attempt: replace row-by-row PL/pgSQL loops (100-200
--    individual SELECTs + INSERTs) with set-based SQL aggregation and a
--    single bulk INSERT into attempt_responses, and skip rewriting unchanged
--    answer rows.
-- 3. track_student_question_result_batch: replace the row-level AFTER INSERT
--    trigger on attempt_responses with a statement-level transition-table
--    trigger so mistake tracking runs once per submission instead of once per
--    question.
-- =============================================================================

-- 1. Harden start_mock_test_session against stale remaining_seconds on active sessions
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
  resumable_state text;
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

  select session.id, session.session_state, coalesce(session.remaining_seconds, 0), session.expires_at
  into resumable_session_id, resumable_state, resumable_seconds, current_session_expires_at
  from public.test_attempt_sessions as session
  where session.user_id = auth.uid()
    and session.mock_test_id = requested_mock_test_id
    and session.submitted_at is null
  order by session.started_at desc
  limit 1
  for update;

  if resumable_session_id is not null then
    -- Active (unpaused) sessions always derive remaining time from authoritative expires_at
    if resumable_state <> 'paused' then
      resumable_seconds := greatest(0, ceil(extract(epoch from (current_session_expires_at - now())))::integer);
    elsif resumable_seconds <= 0 and current_session_expires_at > now() then
      resumable_seconds := greatest(1, ceil(extract(epoch from (current_session_expires_at - now())))::integer);
    end if;

    if resumable_seconds > 0 then
      resumed_expires_at := case
        when resumable_state = 'paused' then now() + resumable_seconds * interval '1 second'
        else current_session_expires_at
      end;

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
    explanation_te, image_url_te
  )
  select
    new_session_id, question.id,
    row_number() over (order by coalesce(subject.display_order, 999), assignment.question_order),
    assignment.marks, assignment.negative_marks,
    question.question_text, question.option_a, question.option_b,
    question.option_c, question.option_d, question.correct_answer,
    question.explanation, question.image_url, subject.content_language_mode,
    question.question_text_te, question.option_a_te, question.option_b_te,
    question.option_c_te, question.option_d_te, question.explanation_te,
    question.image_url_te
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

-- 2. Set-based submit_mock_test_attempt (eliminates ~200-400 per-row queries per submit)
create or replace function public.submit_mock_test_attempt(
  requested_session_id uuid,
  submitted_answers jsonb
)
returns table (
  attempt_id uuid,
  score numeric,
  total_marks numeric,
  correct_answers integer,
  incorrect_answers integer,
  unanswered_questions integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  session_record record;
  existing_attempt record;
  new_attempt_id uuid;
  calculated_score numeric(8,2) := 0;
  calculated_total numeric(8,2) := 0;
  calculated_correct integer := 0;
  calculated_incorrect integer := 0;
  calculated_unanswered integer := 0;
begin
  if auth.uid() is null then
    raise exception 'You must be logged in.';
  end if;

  if jsonb_typeof(submitted_answers) <> 'object' then
    raise exception 'Invalid submitted answers.';
  end if;

  select * into session_record
  from public.test_attempt_sessions
  where id = requested_session_id
    and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Test attempt not found.';
  end if;

  -- If session has already been submitted, return existing attempt idempotently
  if session_record.submitted_at is not null then
    select * into existing_attempt
    from public.test_attempts
    where session_id = requested_session_id
      and user_id = auth.uid();

    if existing_attempt.id is not null then
      return query select
        existing_attempt.id,
        existing_attempt.score,
        existing_attempt.total_marks,
        existing_attempt.correct_answers,
        existing_attempt.incorrect_answers,
        existing_attempt.unanswered_questions;
      return;
    end if;
  end if;

  -- Upsert only changed/missing answers so unchanged rows do not dirty WAL/heap blocks
  insert into public.test_attempt_session_answers (
    session_id, question_id, selected_answer
  )
  select requested_session_id, snapshot.question_id, item.selected_value
  from jsonb_each_text(submitted_answers) as item(question_key, selected_value)
  join public.test_attempt_session_questions as snapshot
    on snapshot.session_id = requested_session_id
    and snapshot.question_id::text = item.question_key
  where item.selected_value in ('A', 'B', 'C', 'D')
  on conflict (session_id, question_id) do update
    set selected_answer = excluded.selected_answer,
        updated_at = now()
    where test_attempt_session_answers.selected_answer is distinct from excluded.selected_answer;

  -- Single-pass aggregate scoring across all session questions
  select
    coalesce(sum(snapshot.marks), 0)::numeric(8,2),
    coalesce(sum(
      case
        when answer.selected_answer is null then 0
        when answer.selected_answer = snapshot.correct_answer then snapshot.marks
        else -snapshot.negative_marks
      end
    ), 0)::numeric(8,2),
    count(*) filter (where answer.selected_answer = snapshot.correct_answer)::integer,
    count(*) filter (where answer.selected_answer is not null and answer.selected_answer <> snapshot.correct_answer)::integer,
    count(*) filter (where answer.selected_answer is null)::integer
  into
    calculated_total,
    calculated_score,
    calculated_correct,
    calculated_incorrect,
    calculated_unanswered
  from public.test_attempt_session_questions as snapshot
  left join public.test_attempt_session_answers as answer
    on answer.session_id = requested_session_id
    and answer.question_id = snapshot.question_id
  where snapshot.session_id = requested_session_id;

  if calculated_total = 0 then
    raise exception 'Mock Test has no Questions.';
  end if;

  update public.test_attempt_sessions
  set submitted_at = now(),
      remaining_seconds = 0
  where id = requested_session_id
    and submitted_at is null;

  insert into public.test_attempts (
    user_id, mock_test_id, session_id, score, total_marks, correct_answers,
    incorrect_answers, unanswered_questions
  ) values (
    auth.uid(), session_record.mock_test_id, requested_session_id,
    calculated_score, calculated_total, calculated_correct,
    calculated_incorrect, calculated_unanswered
  ) returning id into new_attempt_id;

  -- Single bulk insert into attempt_responses
  insert into public.attempt_responses (
    attempt_id, question_id, selected_answer, is_correct, marks_awarded
  )
  select
    new_attempt_id,
    snapshot.question_id,
    answer.selected_answer,
    (answer.selected_answer = snapshot.correct_answer),
    case
      when answer.selected_answer = snapshot.correct_answer then snapshot.marks
      else -snapshot.negative_marks
    end
  from public.test_attempt_session_questions as snapshot
  join public.test_attempt_session_answers as answer
    on answer.session_id = requested_session_id
    and answer.question_id = snapshot.question_id
  where snapshot.session_id = requested_session_id
    and answer.selected_answer is not null;

  return query select new_attempt_id, calculated_score, calculated_total,
    calculated_correct, calculated_incorrect, calculated_unanswered;
end;
$$;

revoke all on function public.submit_mock_test_attempt(uuid, jsonb) from public;
grant execute on function public.submit_mock_test_attempt(uuid, jsonb) to authenticated;

-- 3. Statement-level trigger for student_question_mistakes (runs once per bulk INSERT)
create or replace function public.track_student_question_result_batch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  with correct_agg as (
    select
      attempt.user_id,
      r.question_id,
      count(*)::integer as added_correct,
      (array_agg(r.attempt_id order by attempt.submitted_at desc, r.attempt_id desc))[1] as last_attempt_id,
      (array_agg(r.selected_answer order by attempt.submitted_at desc, r.attempt_id desc))[1] as last_selected_answer,
      max(attempt.submitted_at) as last_seen_at
    from inserted_rows r
    join public.test_attempts attempt on attempt.id = r.attempt_id
    where r.is_correct = true
    group by attempt.user_id, r.question_id
  )
  update public.student_question_mistakes m
  set correct_after_mistake_count = m.correct_after_mistake_count + ca.added_correct,
      last_attempt_id = ca.last_attempt_id,
      last_selected_answer = ca.last_selected_answer,
      last_seen_at = ca.last_seen_at,
      mastered_at = ca.last_seen_at
  from correct_agg ca
  where m.user_id = ca.user_id
    and m.question_id = ca.question_id;

  with incorrect_agg as (
    select
      attempt.user_id,
      r.question_id,
      count(*)::integer as added_mistakes,
      (array_agg(r.attempt_id order by attempt.submitted_at desc, r.attempt_id desc))[1] as last_attempt_id,
      (array_agg(r.selected_answer order by attempt.submitted_at desc, r.attempt_id desc))[1] as last_selected_answer,
      max(attempt.submitted_at) as last_seen_at
    from inserted_rows r
    join public.test_attempts attempt on attempt.id = r.attempt_id
    where r.is_correct = false
    group by attempt.user_id, r.question_id
  )
  insert into public.student_question_mistakes (
    user_id, question_id, mistake_count, last_attempt_id,
    last_selected_answer, last_seen_at, mastered_at
  )
  select
    ia.user_id,
    ia.question_id,
    ia.added_mistakes,
    ia.last_attempt_id,
    ia.last_selected_answer,
    ia.last_seen_at,
    null
  from incorrect_agg ia
  on conflict (user_id, question_id) do update
  set mistake_count = student_question_mistakes.mistake_count + excluded.mistake_count,
      last_attempt_id = excluded.last_attempt_id,
      last_selected_answer = excluded.last_selected_answer,
      last_seen_at = excluded.last_seen_at,
      mastered_at = null;

  return null;
end;
$$;

drop trigger if exists track_student_question_result_after_insert on public.attempt_responses;
create trigger track_student_question_result_after_insert
after insert on public.attempt_responses
referencing new table as inserted_rows
for each statement execute function public.track_student_question_result_batch();

notify pgrst, 'reload schema';
