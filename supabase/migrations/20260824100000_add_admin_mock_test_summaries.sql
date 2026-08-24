-- Keep the admin mock-test dashboard accurate after the assignment tables grow
-- beyond PostgREST's per-request row limit. Aggregate in PostgreSQL instead of
-- loading every assignment and attempt into the Next.js server process.
create or replace function public.get_admin_mock_test_summaries()
returns table (
  mock_test_id uuid,
  question_count bigint,
  usable_question_count bigint,
  total_marks numeric,
  attempt_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator MFA verification is required.';
  end if;

  return query
  with assignment_summaries as (
    select
      mock_test.id as mock_test_id,
      count(assignment.id) as question_count,
      count(assignment.id) filter (
        where question.id is not null
          and question.is_active
          and subject.id is not null
          and subject.paper_id = mock_test.paper_id
          and (
            mock_test.test_scope <> 'subject'
            or question.subject_id = mock_test.subject_id
          )
          and not (
            question.content_lifecycle = 'expires'
            and question.expires_on < (now() at time zone 'Asia/Kolkata')::date
          )
          and assignment.marks > 0
          and assignment.negative_marks >= 0
      ) as usable_question_count,
      coalesce(sum(assignment.marks), 0) as total_marks
    from public.mock_tests as mock_test
    left join public.mock_test_questions as assignment
      on assignment.mock_test_id = mock_test.id
    left join public.questions as question
      on question.id = assignment.question_id
    left join public.subjects as subject
      on subject.id = question.subject_id
    group by mock_test.id
  ),
  attempt_summaries as (
    select
      attempt.mock_test_id,
      count(*) as attempt_count
    from public.test_attempts as attempt
    group by attempt.mock_test_id
  )
  select
    mock_test.id,
    coalesce(assignment.question_count, 0),
    coalesce(assignment.usable_question_count, 0),
    coalesce(assignment.total_marks, 0),
    coalesce(attempt.attempt_count, 0)
  from public.mock_tests as mock_test
  left join assignment_summaries as assignment
    on assignment.mock_test_id = mock_test.id
  left join attempt_summaries as attempt
    on attempt.mock_test_id = mock_test.id;
end;
$$;

revoke all on function public.get_admin_mock_test_summaries() from public;
grant execute on function public.get_admin_mock_test_summaries() to authenticated;

notify pgrst, 'reload schema';
