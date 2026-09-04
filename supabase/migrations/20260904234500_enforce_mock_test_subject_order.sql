-- Enforce subject display_order across mock tests:
-- 1. One-time data reordering of existing mock_test_questions by subject.display_order.
-- 2. Update start_mock_test_session to always assign session question_order by subject.display_order.
-- 3. Update fill_mock_test_with_latest_questions to assign candidates in subject.display_order.
-- 4. Update guard_mock_test_question_mutation to permit reordering question_order on published tests when there are zero student attempts.

-- Step 1: Temporarily disable the trigger to reorder all existing mock test questions
alter table public.mock_test_questions disable trigger guard_mock_test_question_mutation;

do $$
declare
  mt record;
begin
  for mt in select id from public.mock_tests loop
    -- Shift to avoid unique constraint violations on (mock_test_id, question_order)
    update public.mock_test_questions
    set question_order = question_order + 500000
    where mock_test_id = mt.id;

    -- Re-order sequentially by subject.display_order, then previous question_order
    with reordered as (
      select
        mtq.id as assignment_id,
        row_number() over (order by coalesce(s.display_order, 999), mtq.question_order) as new_order
      from public.mock_test_questions mtq
      join public.questions q on q.id = mtq.question_id
      left join public.subjects s on s.id = q.subject_id
      where mtq.mock_test_id = mt.id
    )
    update public.mock_test_questions mtq
    set question_order = r.new_order
    from reordered r
    where mtq.id = r.assignment_id;
  end loop;
end;
$$;

alter table public.mock_test_questions enable trigger guard_mock_test_question_mutation;

-- Step 2: Update guard_mock_test_question_mutation to allow question_order updates on published tests with no attempts
create or replace function public.guard_mock_test_question_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
  target_test record;
  assigned_count integer;
begin
  target_id := case when tg_op = 'DELETE' then old.mock_test_id else new.mock_test_id end;
  select id, status, target_question_count, paper_id into target_test
  from public.mock_tests where id = target_id for update;

  if target_test.id is null then
    if tg_op = 'DELETE' then return old; end if;
    raise exception 'Mock Test not found.';
  end if;

  if exists (select 1 from public.test_attempts where mock_test_id = target_id) then
    raise exception 'This Mock Test has student attempts and its Questions are locked.';
  end if;

  if target_test.status <> 'draft' then
    if tg_op = 'UPDATE' and new.question_id = old.question_id and new.marks = old.marks and new.negative_marks = old.negative_marks then
      -- Allow reordering question_order when there are no student attempts
      null;
    else
      raise exception 'Published or archived Mock Tests cannot be changed.';
    end if;
  end if;

  if tg_op = 'INSERT' then
    select count(*) into assigned_count
    from public.mock_test_questions where mock_test_id = target_id;
    if assigned_count >= target_test.target_question_count then
      raise exception 'The Mock Test already has its target number of Questions.';
    end if;

    if exists (
      select 1
      from public.mock_test_questions as existing_assignment
      join public.mock_tests as sibling_test on sibling_test.id = existing_assignment.mock_test_id
      where sibling_test.paper_id = target_test.paper_id
        and existing_assignment.question_id = new.question_id
        and existing_assignment.mock_test_id <> target_id
    ) then
      raise exception 'This question is already assigned to another mock test in this paper series.';
    end if;
  end if;

  if tg_op = 'UPDATE' and new.question_id is distinct from old.question_id then
    if exists (
      select 1
      from public.mock_test_questions as existing_assignment
      join public.mock_tests as sibling_test on sibling_test.id = existing_assignment.mock_test_id
      where sibling_test.paper_id = target_test.paper_id
        and existing_assignment.question_id = new.question_id
        and existing_assignment.mock_test_id <> target_id
    ) then
      raise exception 'This question is already assigned to another mock test in this paper series.';
    end if;
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- Step 3: Update start_mock_test_session to always output questions in subject display_order
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

  select session.id, coalesce(session.remaining_seconds, 0)
  into resumable_session_id, resumable_seconds
  from public.test_attempt_sessions as session
  where session.user_id = auth.uid()
    and session.mock_test_id = requested_mock_test_id
    and session.submitted_at is null
  order by session.started_at desc
  limit 1
  for update;

  if resumable_session_id is not null and resumable_seconds > 0 then
    resumed_expires_at := now() + resumable_seconds * interval '1 second';
    update public.test_attempt_sessions
    set session_state = 'active',
        expires_at = resumed_expires_at,
        last_timer_sync_at = now()
    where id = resumable_session_id;
    return query
      select resumable_session_id, requested_mock_test_id, resumed_expires_at;
    return;
  end if;

  if resumable_session_id is not null then
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
    remaining_seconds, last_timer_sync_at
  ) values (
    auth.uid(), requested_mock_test_id,
    now() + test_duration_minutes * interval '1 minute',
    'active', test_duration_minutes * 60, now()
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

revoke all on function public.start_mock_test_session(uuid) from public;
grant execute on function public.start_mock_test_session(uuid) to authenticated;

-- Step 4: Update fill_mock_test_with_latest_questions to also order by subject display_order
create or replace function public.fill_mock_test_with_latest_questions(
  requested_mock_test_id uuid
)
returns table (assigned integer, remaining integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_test record;
  current_count integer;
  inserted_count integer := 0;
begin
  if not public.is_admin() then
    raise exception 'Administrator MFA verification is required.';
  end if;
  select mock_test.*, paper.default_correct_marks, paper.default_negative_marks
  into target_test
  from public.mock_tests as mock_test
  join public.papers as paper on paper.id = mock_test.paper_id
  where mock_test.id = requested_mock_test_id
  for update of mock_test;
  if target_test.id is null then raise exception 'Mock Test not found.'; end if;
  if target_test.status <> 'draft' then raise exception 'Only draft Mock Tests can be changed.'; end if;
  if exists (select 1 from public.test_attempts where mock_test_id = requested_mock_test_id) then
    raise exception 'This Mock Test has student attempts and its Questions are locked.';
  end if;

  select count(*) into current_count from public.mock_test_questions
  where mock_test_id = requested_mock_test_id;
  if current_count >= target_test.target_question_count then
    return query select 0, 0;
    return;
  end if;

  with raw_candidates as (
    select
      question.id,
      question.created_at,
      subject.display_order as subject_display_order,
      lower(regexp_replace(trim(question.question_text), '\s+', ' ', 'g')) as norm_text,
      lower(regexp_replace(trim(coalesce(question.question_text_te, '')), '\s+', ' ', 'g')) as norm_text_te
    from public.questions as question
    join public.subjects as subject on subject.id = question.subject_id
    where subject.paper_id = target_test.paper_id
      and (target_test.test_scope = 'paper' or question.subject_id = target_test.subject_id)
      and question.is_active
      and (question.content_lifecycle <> 'expires' or question.expires_on >= (now() at time zone 'Asia/Kolkata')::date)
      and not exists (
        select 1
        from public.mock_test_questions as assignment
        join public.mock_tests as sibling_test on sibling_test.id = assignment.mock_test_id
        where sibling_test.paper_id = target_test.paper_id
          and assignment.question_id = question.id
      )
      and not exists (
        select 1
        from public.mock_test_questions as assignment
        join public.mock_tests as sibling_test on sibling_test.id = assignment.mock_test_id
        join public.questions as assigned_q on assigned_q.id = assignment.question_id
        where sibling_test.paper_id = target_test.paper_id
          and (
            (
              length(trim(question.question_text)) >= 10
              and lower(regexp_replace(trim(question.question_text), '\s+', ' ', 'g')) =
                  lower(regexp_replace(trim(assigned_q.question_text), '\s+', ' ', 'g'))
            )
            or (
              length(trim(coalesce(question.question_text_te, ''))) >= 10
              and lower(regexp_replace(trim(coalesce(question.question_text_te, '')), '\s+', ' ', 'g')) =
                  lower(regexp_replace(trim(coalesce(assigned_q.question_text_te, '')), '\s+', ' ', 'g'))
            )
          )
      )
  ),
  deduped_candidates as (
    select distinct on (case when length(norm_text) >= 10 then norm_text when length(norm_text_te) >= 10 then norm_text_te else id::text end)
      id,
      created_at,
      subject_display_order
    from raw_candidates
    order by (case when length(norm_text) >= 10 then norm_text when length(norm_text_te) >= 10 then norm_text_te else id::text end), created_at desc, id
  ),
  candidates as materialized (
    select
      id,
      row_number() over (order by coalesce(subject_display_order, 999), created_at desc, id) as row_number
    from deduped_candidates
    order by coalesce(subject_display_order, 999), created_at desc, id
    limit (target_test.target_question_count - current_count)
  )
  insert into public.mock_test_questions (
    mock_test_id, question_id, question_order, marks, negative_marks
  )
  select requested_mock_test_id, candidate.id,
    current_count + candidate.row_number,
    coalesce(target_test.default_correct_marks, 1),
    coalesce(target_test.default_negative_marks, 0)
  from candidates as candidate;

  get diagnostics inserted_count = row_count;
  return query select inserted_count,
    greatest(target_test.target_question_count - current_count - inserted_count, 0);
end;
$$;

revoke all on function public.fill_mock_test_with_latest_questions(uuid) from public;
grant execute on function public.fill_mock_test_with_latest_questions(uuid) to authenticated;
