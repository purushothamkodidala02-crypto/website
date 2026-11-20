-- Harden get_attempt_review to ensure students can always review completed mock tests:
-- 1. Support null or missing detailed_review_available by coalescing to true.
-- 2. Fall back to mock_test_questions + questions whenever session snapshot rows are missing or session_id is null.
-- 3. Use LEFT JOIN for subjects so questions with null subject_id are never dropped.

create or replace function public.get_attempt_review(
  requested_attempt_id uuid
)
returns table (
  mock_test_title text,
  score numeric,
  total_marks numeric,
  correct_answers integer,
  incorrect_answers integer,
  unanswered_questions integer,
  question_order integer,
  question_text text,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  content_language_mode text,
  question_text_te text,
  option_a_te text,
  option_b_te text,
  option_c_te text,
  option_d_te text,
  selected_answer text,
  correct_answer text,
  is_correct boolean,
  marks_awarded numeric,
  explanation text,
  explanation_te text,
  image_url text
)
language sql
security definer
set search_path = public
as $$
  with owned_attempt as (
    select *
    from public.test_attempts
    where id = requested_attempt_id
      and user_id = auth.uid()
      and coalesce(detailed_review_available, true) = true
  ),
  session_snapshots as (
    select
      snapshot.session_id,
      snapshot.question_id,
      snapshot.question_order,
      snapshot.question_text,
      snapshot.option_a,
      snapshot.option_b,
      snapshot.option_c,
      snapshot.option_d,
      coalesce(snapshot.content_language_mode, 'english') as content_language_mode,
      snapshot.question_text_te,
      snapshot.option_a_te,
      snapshot.option_b_te,
      snapshot.option_c_te,
      snapshot.option_d_te,
      snapshot.correct_answer,
      snapshot.explanation,
      snapshot.explanation_te,
      snapshot.image_url
    from public.test_attempt_session_questions as snapshot
    join owned_attempt as attempt on attempt.session_id = snapshot.session_id
  )
  select
    mock_test.title as mock_test_title,
    attempt.score,
    attempt.total_marks,
    attempt.correct_answers,
    attempt.incorrect_answers,
    attempt.unanswered_questions,
    snapshot.question_order,
    snapshot.question_text,
    snapshot.option_a,
    snapshot.option_b,
    snapshot.option_c,
    snapshot.option_d,
    snapshot.content_language_mode,
    snapshot.question_text_te,
    snapshot.option_a_te,
    snapshot.option_b_te,
    snapshot.option_c_te,
    snapshot.option_d_te,
    response.selected_answer,
    snapshot.correct_answer,
    coalesce(response.is_correct, false) as is_correct,
    coalesce(response.marks_awarded, 0) as marks_awarded,
    snapshot.explanation,
    snapshot.explanation_te,
    snapshot.image_url
  from owned_attempt as attempt
  join public.mock_tests as mock_test on mock_test.id = attempt.mock_test_id
  join session_snapshots as snapshot on snapshot.session_id = attempt.session_id
  left join public.attempt_responses as response
    on response.attempt_id = attempt.id
    and response.question_id = snapshot.question_id

  union all

  select
    mock_test.title as mock_test_title,
    attempt.score,
    attempt.total_marks,
    attempt.correct_answers,
    attempt.incorrect_answers,
    attempt.unanswered_questions,
    assignment.question_order,
    question.question_text,
    question.option_a,
    question.option_b,
    question.option_c,
    question.option_d,
    coalesce(subject.content_language_mode, 'english') as content_language_mode,
    question.question_text_te,
    question.option_a_te,
    question.option_b_te,
    question.option_c_te,
    question.option_d_te,
    response.selected_answer,
    question.correct_answer,
    coalesce(response.is_correct, false) as is_correct,
    coalesce(response.marks_awarded, 0) as marks_awarded,
    question.explanation,
    question.explanation_te,
    question.image_url
  from owned_attempt as attempt
  join public.mock_tests as mock_test on mock_test.id = attempt.mock_test_id
  join public.mock_test_questions as assignment
    on assignment.mock_test_id = mock_test.id
  join public.questions as question on question.id = assignment.question_id
  left join public.subjects as subject on subject.id = question.subject_id
  left join public.attempt_responses as response
    on response.attempt_id = attempt.id
    and response.question_id = question.id
  where not exists (select 1 from session_snapshots)

  order by question_order;
$$;

revoke all on function public.get_attempt_review(uuid) from public;
grant execute on function public.get_attempt_review(uuid) to authenticated;
