-- Prevent duplicate questions across mock tests in the same paper series
-- 1. Updates guard_mock_test_question_mutation to prevent inserting/updating a question assignment if that question is already in another mock test of the same paper.
-- 2. Updates fill_mock_test_with_latest_questions to strictly exclude questions already assigned to ANY mock test in the paper, as well as questions with duplicate text.

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
  if target_test.status <> 'draft' then
    raise exception 'Published or archived Mock Tests cannot be changed.';
  end if;
  if exists (select 1 from public.test_attempts where mock_test_id = target_id) then
    raise exception 'This Mock Test has student attempts and its Questions are locked.';
  end if;

  if tg_op = 'INSERT' then
    select count(*) into assigned_count
    from public.mock_test_questions where mock_test_id = target_id;
    if assigned_count >= target_test.target_question_count then
      raise exception 'The Mock Test already has its target number of Questions.';
    end if;

    -- Block assigning questions that are already assigned to another mock test in the same paper series
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
      lower(regexp_replace(trim(question.question_text), '\s+', ' ', 'g')) as norm_text,
      lower(regexp_replace(trim(coalesce(question.question_text_te, '')), '\s+', ' ', 'g')) as norm_text_te
    from public.questions as question
    join public.subjects as subject on subject.id = question.subject_id
    where subject.paper_id = target_test.paper_id
      and (target_test.test_scope = 'paper' or question.subject_id = target_test.subject_id)
      and question.is_active
      and (question.content_lifecycle <> 'expires' or question.expires_on >= (now() at time zone 'Asia/Kolkata')::date)
      -- 1. Exclude any question already assigned to ANY mock test in this paper series
      and not exists (
        select 1
        from public.mock_test_questions as assignment
        join public.mock_tests as sibling_test on sibling_test.id = assignment.mock_test_id
        where sibling_test.paper_id = target_test.paper_id
          and assignment.question_id = question.id
      )
      -- 2. Exclude any question whose text matches a question already assigned to ANY mock test in this paper series
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
    -- Deduplicate among candidates themselves so identical question bank items aren't both added
    select distinct on (case when length(norm_text) >= 10 then norm_text when length(norm_text_te) >= 10 then norm_text_te else id::text end)
      id,
      created_at
    from raw_candidates
    order by (case when length(norm_text) >= 10 then norm_text when length(norm_text_te) >= 10 then norm_text_te else id::text end), created_at desc, id
  ),
  candidates as materialized (
    select
      id,
      row_number() over (order by created_at desc, id) as row_number
    from deduped_candidates
    order by created_at desc, id
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
