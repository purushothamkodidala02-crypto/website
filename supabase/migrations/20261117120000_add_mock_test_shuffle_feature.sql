-- Migration: 20261117120000_add_mock_test_shuffle_feature.sql
-- Purpose: Add shuffle questions and options support for mock test retakes and practice.
--          Randomizes question sequence and permutes options A, B, C, D (and Telugu _te)
--          while dynamically re-mapping the correct_answer letter to guarantee 100% accurate
--          evaluation and scoring.

-- 1. Add is_shuffled tracking column to test_attempt_sessions
alter table public.test_attempt_sessions
  add column if not exists is_shuffled boolean not null default false;

-- 2. Drop previous overloads to avoid PostgREST PGRST203 ambiguity
drop function if exists public.start_mock_test_session(uuid, text);
drop function if exists public.restart_mock_test_session(uuid, text);
drop function if exists public.start_mock_test_session(uuid);
drop function if exists public.restart_mock_test_session(uuid);

-- 3. Define unified start_mock_test_session with requested_shuffle parameter
create or replace function public.start_mock_test_session(
  requested_mock_test_id uuid,
  requested_device_token text default null,
  requested_shuffle boolean default false
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
  snapshot_count integer := 0;
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
    remaining_seconds, last_timer_sync_at, active_device_token, last_device_heartbeat_at,
    is_shuffled
  ) values (
    auth.uid(), requested_mock_test_id,
    now() + test_duration_minutes * interval '1 minute',
    'active', test_duration_minutes * 60, now(),
    requested_device_token, now(),
    coalesce(requested_shuffle, false)
  ) returning id, test_attempt_sessions.expires_at
    into new_session_id, resumed_expires_at;

  -- Insert questions into session snapshot
  if not coalesce(requested_shuffle, false) then
    -- Standard official ordering
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
  else
    -- Shuffled mode: randomize question sequence and permute options A, B, C, D
    declare
      q_rec record;
      order_idx integer := 1;
      perm integer[];
      i integer;
      j integer;
      tmp integer;
      opts_en text[];
      opts_te text[];
      orig_correct_idx integer;
      final_correct text;
      final_opt_a text;
      final_opt_b text;
      final_opt_c text;
      final_opt_d text;
      final_opt_a_te text;
      final_opt_b_te text;
      final_opt_c_te text;
      final_opt_d_te text;
      has_relative_options boolean;
    begin
      snapshot_count := 0;
      for q_rec in
        select
          question.id as question_id,
          assignment.marks,
          assignment.negative_marks,
          question.question_text,
          question.option_a,
          question.option_b,
          question.option_c,
          question.option_d,
          question.correct_answer,
          question.explanation,
          question.image_url,
          subject.content_language_mode,
          question.question_text_te,
          question.option_a_te,
          question.option_b_te,
          question.option_c_te,
          question.option_d_te,
          question.explanation_te
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
        order by random()
      loop
        -- Check if any option refers to positional options (e.g. "All of the above", "None of the above", "Both A and B")
        has_relative_options := (
          q_rec.option_a ~* '(above|below|both [a-d]|all of the|none of the|పైవన్నీ|పైవేవీ|ఏదీ కాదు)' or
          q_rec.option_b ~* '(above|below|both [a-d]|all of the|none of the|పైవన్నీ|పైవేవీ|ఏదీ కాదు)' or
          q_rec.option_c ~* '(above|below|both [a-d]|all of the|none of the|పైవన్నీ|పైవేవీ|ఏదీ కాదు)' or
          q_rec.option_d ~* '(above|below|both [a-d]|all of the|none of the|పైవన్నీ|పైవేవీ|ఏదీ కాదు)' or
          coalesce(q_rec.option_a_te, '') ~* '(పైవన్నీ|పైవేవీ|ఏదీ కాదు)' or
          coalesce(q_rec.option_b_te, '') ~* '(పైవన్నీ|పైవేవీ|ఏదీ కాదు)' or
          coalesce(q_rec.option_c_te, '') ~* '(పైవన్నీ|పైవేవీ|ఏదీ కాదు)' or
          coalesce(q_rec.option_d_te, '') ~* '(పైవన్నీ|పైవేవీ|ఏదీ కాదు)'
        );

        if has_relative_options then
          -- Retain option positions as original to protect contextual phrases like "All of the above"
          final_opt_a := q_rec.option_a;
          final_opt_b := q_rec.option_b;
          final_opt_c := q_rec.option_c;
          final_opt_d := q_rec.option_d;
          final_opt_a_te := q_rec.option_a_te;
          final_opt_b_te := q_rec.option_b_te;
          final_opt_c_te := q_rec.option_c_te;
          final_opt_d_te := q_rec.option_d_te;
          final_correct := q_rec.correct_answer;
        else
          -- Permute options A, B, C, D using Fisher-Yates shuffle
          opts_en := array[q_rec.option_a, q_rec.option_b, q_rec.option_c, q_rec.option_d];
          opts_te := array[q_rec.option_a_te, q_rec.option_b_te, q_rec.option_c_te, q_rec.option_d_te];
          perm := array[1, 2, 3, 4];

          for i in reverse 4..2 loop
            j := floor(random() * i + 1)::integer;
            tmp := perm[i];
            perm[i] := perm[j];
            perm[j] := tmp;
          end loop;

          orig_correct_idx := case q_rec.correct_answer
            when 'A' then 1
            when 'B' then 2
            when 'C' then 3
            when 'D' then 4
            else 1
          end;

          -- Re-map correct answer to its new randomized option position
          if perm[1] = orig_correct_idx then
            final_correct := 'A';
          elsif perm[2] = orig_correct_idx then
            final_correct := 'B';
          elsif perm[3] = orig_correct_idx then
            final_correct := 'C';
          else
            final_correct := 'D';
          end if;

          final_opt_a := opts_en[perm[1]];
          final_opt_b := opts_en[perm[2]];
          final_opt_c := opts_en[perm[3]];
          final_opt_d := opts_en[perm[4]];

          final_opt_a_te := opts_te[perm[1]];
          final_opt_b_te := opts_te[perm[2]];
          final_opt_c_te := opts_te[perm[3]];
          final_opt_d_te := opts_te[perm[4]];
        end if;

        insert into public.test_attempt_session_questions (
          session_id, question_id, question_order, marks, negative_marks,
          question_text, option_a, option_b, option_c, option_d,
          correct_answer, explanation, image_url, content_language_mode,
          question_text_te, option_a_te, option_b_te, option_c_te, option_d_te,
          explanation_te
        ) values (
          new_session_id, q_rec.question_id, order_idx, q_rec.marks, q_rec.negative_marks,
          q_rec.question_text, final_opt_a, final_opt_b, final_opt_c, final_opt_d,
          final_correct, q_rec.explanation, q_rec.image_url, q_rec.content_language_mode,
          q_rec.question_text_te, final_opt_a_te, final_opt_b_te, final_opt_c_te, final_opt_d_te,
          q_rec.explanation_te
        );

        order_idx := order_idx + 1;
        snapshot_count := snapshot_count + 1;
      end loop;
    end;
  end if;

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

revoke all on function public.start_mock_test_session(uuid, text, boolean) from public;
grant execute on function public.start_mock_test_session(uuid, text, boolean) to authenticated;

-- 4. Define unified restart_mock_test_session with requested_shuffle parameter
create or replace function public.restart_mock_test_session(
  requested_mock_test_id uuid,
  requested_device_token text default null,
  requested_shuffle boolean default false
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

  delete from public.test_attempt_sessions as session
  where session.user_id = auth.uid()
    and session.mock_test_id = requested_mock_test_id
    and session.submitted_at is null;

  return query
  select started.session_id, started.mock_test_id, started.expires_at
  from public.start_mock_test_session(requested_mock_test_id, requested_device_token, requested_shuffle) as started;
end;
$$;

revoke all on function public.restart_mock_test_session(uuid, text, boolean) from public;
grant execute on function public.restart_mock_test_session(uuid, text, boolean) to authenticated;

notify pgrst, 'reload schema';
