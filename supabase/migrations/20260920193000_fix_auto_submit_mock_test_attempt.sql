-- Fix auto-submission race condition and timer-expiry abort in submit_mock_test_attempt.
-- Ensures that when test time ends and an attempt is auto-submitted, answers are safely
-- recorded and scored without throwing 'The test time has ended.'

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
  snapshot_record record;
  selected text;
  awarded numeric(8,2);
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

  -- Save submitted answers directly during submission without strict time-end abort,
  -- ensuring auto-submitted tests at deadline are recorded accurately.
  if jsonb_typeof(submitted_answers) = 'object' then
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
          updated_at = now();
  end if;

  for snapshot_record in
    select snapshot.question_id, snapshot.marks, snapshot.negative_marks,
      snapshot.correct_answer
    from public.test_attempt_session_questions as snapshot
    where snapshot.session_id = requested_session_id
    order by snapshot.question_order
  loop
    calculated_total := calculated_total + snapshot_record.marks;

    select answer.selected_answer into selected
    from public.test_attempt_session_answers as answer
    where answer.session_id = requested_session_id
      and answer.question_id = snapshot_record.question_id;

    if selected is null then
      calculated_unanswered := calculated_unanswered + 1;
    elsif selected = snapshot_record.correct_answer then
      calculated_correct := calculated_correct + 1;
      calculated_score := calculated_score + snapshot_record.marks;
    else
      calculated_incorrect := calculated_incorrect + 1;
      calculated_score := calculated_score - snapshot_record.negative_marks;
    end if;
  end loop;

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

  for snapshot_record in
    select snapshot.question_id, snapshot.marks, snapshot.negative_marks,
      snapshot.correct_answer
    from public.test_attempt_session_questions as snapshot
    where snapshot.session_id = requested_session_id
  loop
    select answer.selected_answer into selected
    from public.test_attempt_session_answers as answer
    where answer.session_id = requested_session_id
      and answer.question_id = snapshot_record.question_id;

    if selected is not null then
      awarded := case when selected = snapshot_record.correct_answer
        then snapshot_record.marks else -snapshot_record.negative_marks end;

      insert into public.attempt_responses (
        attempt_id, question_id, selected_answer, is_correct, marks_awarded
      ) values (
        new_attempt_id, snapshot_record.question_id, selected,
        selected = snapshot_record.correct_answer, awarded
      );
    end if;
  end loop;

  return query select new_attempt_id, calculated_score, calculated_total,
    calculated_correct, calculated_incorrect, calculated_unanswered;
end;
$$;

revoke all on function public.submit_mock_test_attempt(uuid, jsonb) from public;
grant execute on function public.submit_mock_test_attempt(uuid, jsonb) to authenticated;
