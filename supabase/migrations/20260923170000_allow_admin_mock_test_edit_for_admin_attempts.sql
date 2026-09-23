-- Allow admin to edit mock test anytime when attempts are by kodidalanani@gmail.com or admin accounts.

create or replace function public.mock_test_has_student_attempts(target_mock_test_id uuid)
returns boolean
language plpgsql
security definer
stable
set search_path = public, auth
as $$
begin
  return exists (
    select 1
    from public.test_attempts a
    left join auth.users u on u.id = a.user_id
    left join public.profiles p on p.id = a.user_id
    where a.mock_test_id = target_mock_test_id
      and lower(coalesce(u.email, '')) <> 'kodidalanani@gmail.com'
      and coalesce(p.role, 'student') <> 'admin'
  );
end;
$$;

revoke all on function public.mock_test_has_student_attempts(uuid) from public, anon;
grant execute on function public.mock_test_has_student_attempts(uuid) to authenticated, service_role;

-- Update guard_mock_test_question_mutation to use mock_test_has_student_attempts
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
  select id, status, target_question_count into target_test
  from public.mock_tests where id = target_id for update;

  if target_test.id is null then
    if tg_op = 'DELETE' then return old; end if;
    raise exception 'Mock Test not found.';
  end if;
  if target_test.status <> 'draft' then
    raise exception 'Published or archived Mock Tests cannot be changed.';
  end if;
  if public.mock_test_has_student_attempts(target_id) then
    raise exception 'This Mock Test has student attempts and its Questions are locked.';
  end if;

  if tg_op = 'INSERT' then
    select count(*) into assigned_count
    from public.mock_test_questions where mock_test_id = target_id;
    if assigned_count >= target_test.target_question_count then
      raise exception 'The Mock Test already has its target number of Questions.';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- Update guard_mock_test_target_change to use mock_test_has_student_attempts
create or replace function public.guard_mock_test_target_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_count integer;
begin
  if new.target_question_count is distinct from old.target_question_count
     or new.paper_id is distinct from old.paper_id
     or new.subject_id is distinct from old.subject_id
     or new.test_scope is distinct from old.test_scope then
    if old.status <> 'draft' then
      raise exception 'Only draft Mock Tests can change their target Question count.';
    end if;
    if public.mock_test_has_student_attempts(old.id) then
      raise exception 'This Mock Test has student attempts and its target is locked.';
    end if;
    select count(*) into assigned_count
    from public.mock_test_questions where mock_test_id = old.id;
    if assigned_count > 0 and (
      new.paper_id is distinct from old.paper_id
      or new.subject_id is distinct from old.subject_id
      or new.test_scope is distinct from old.test_scope
    ) then
      raise exception 'Remove all assigned Questions before changing the Mock Test Paper or Subject.';
    end if;
    if new.target_question_count < assigned_count then
      raise exception 'Remove Questions before lowering the target below the assigned count.';
    end if;
  end if;
  return new;
end;
$$;

-- Update fill_mock_test_with_latest_questions to use mock_test_has_student_attempts
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
  if public.mock_test_has_student_attempts(requested_mock_test_id) then
    raise exception 'This Mock Test has student attempts and its Questions are locked.';
  end if;

  select count(*) into current_count from public.mock_test_questions
  where mock_test_id = requested_mock_test_id;
  if current_count >= target_test.target_question_count then
    return query select 0, 0;
    return;
  end if;

  with candidates as materialized (
    select question.id,
      row_number() over (order by question.created_at desc, question.id) as row_number
    from public.questions as question
    join public.subjects as subject on subject.id = question.subject_id
    where subject.paper_id = target_test.paper_id
      and (target_test.test_scope = 'paper' or question.subject_id = target_test.subject_id)
      and question.is_active
      and (question.content_lifecycle <> 'expires' or question.expires_on >= (now() at time zone 'Asia/Kolkata')::date)
      and not exists (
        select 1 from public.mock_test_questions as assignment
        where assignment.mock_test_id = requested_mock_test_id
          and assignment.question_id = question.id
      )
    order by question.created_at desc, question.id
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

-- Update replace_mock_test_questions_atomic to use mock_test_has_student_attempts
create or replace function public.replace_mock_test_questions_atomic(
  requested_paper_id uuid,
  requested_mock_test_id uuid,
  requested_questions jsonb,
  requested_assignments jsonb
)
returns table (
  added integer,
  updated integer,
  assigned integer,
  deleted_orphans integer,
  orphan_image_urls text[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_test record;
  question_input public.questions%rowtype;
  preference record;
  item jsonb;
  saved_question_id uuid;
  old_question_ids uuid[];
  deleted_images text[] := array[]::text[];
  added_count integer := 0;
  updated_count integer := 0;
  assigned_count integer := 0;
  deleted_count integer := 0;
  existed boolean;
begin
  if not public.is_admin() then raise exception 'Administrator MFA verification is required.'; end if;
  if jsonb_typeof(requested_questions) <> 'array'
     or jsonb_typeof(requested_assignments) <> 'array'
     or jsonb_array_length(requested_questions) = 0
     or jsonb_array_length(requested_questions) > 500
     or jsonb_array_length(requested_questions) <> jsonb_array_length(requested_assignments) then
    raise exception 'Invalid replacement file.';
  end if;

  select mock_test.* into target_test from public.mock_tests as mock_test
  where mock_test.id = requested_mock_test_id for update;
  if target_test.id is null then raise exception 'Mock Test not found.'; end if;
  if target_test.status <> 'draft' then raise exception 'Only draft Mock Tests can be replaced.'; end if;
  if target_test.paper_id <> requested_paper_id then raise exception 'The Mock Test and import Paper do not match.'; end if;
  if public.mock_test_has_student_attempts(requested_mock_test_id) then
    raise exception 'This Mock Test has student attempts and cannot be replaced.';
  end if;
  if jsonb_array_length(requested_questions) <> target_test.target_question_count then
    raise exception 'The replacement file must contain exactly % valid Questions.', target_test.target_question_count;
  end if;
  if exists (
    select 1
    from jsonb_populate_recordset(null::public.questions, requested_questions) as question
    left join public.subjects as subject on subject.id = question.subject_id
    where subject.id is null
      or subject.paper_id <> requested_paper_id
      or (target_test.test_scope = 'subject' and question.subject_id <> target_test.subject_id)
  ) then raise exception 'Every replacement Question must belong to this Mock Test Paper and Subject.'; end if;
  if exists (
    select 1 from jsonb_to_recordset(requested_assignments) as assignment(
      subject_id uuid, import_key text, question_order integer, marks numeric, negative_marks numeric
    ) where question_order < 1 or question_order > target_test.target_question_count
      or marks <= 0 or negative_marks < 0
  ) then raise exception 'Every replacement order and score must be valid.'; end if;
  if (select count(distinct assignment.question_order)
      from jsonb_to_recordset(requested_assignments) as assignment(
        subject_id uuid, import_key text, question_order integer, marks numeric, negative_marks numeric
      )) <> target_test.target_question_count then
    raise exception 'Replacement Question order numbers must be unique.';
  end if;

  select coalesce(array_agg(question_id), array[]::uuid[]) into old_question_ids
  from public.mock_test_questions where mock_test_id = requested_mock_test_id;
  delete from public.mock_test_questions where mock_test_id = requested_mock_test_id;

  for item in select value from jsonb_array_elements(requested_questions)
  loop
    select * into question_input from jsonb_populate_record(null::public.questions, item);
    select exists (
      select 1 from public.questions
      where subject_id = question_input.subject_id and import_key = question_input.import_key
    ) into existed;

    insert into public.questions (
      subject_id, import_key, question_type, question_text, option_a, option_b, option_c, option_d,
      question_text_te, option_a_te, option_b_te, option_c_te, option_d_te, correct_answer,
      explanation, explanation_te, difficulty, image_url, source_reference, source_exam_date,
      is_active, content_lifecycle, review_on, expires_on
    ) values (
      question_input.subject_id, question_input.import_key, question_input.question_type,
      question_input.question_text, question_input.option_a, question_input.option_b,
      question_input.option_c, question_input.option_d, question_input.question_text_te,
      question_input.option_a_te, question_input.option_b_te, question_input.option_c_te,
      question_input.option_d_te, question_input.correct_answer, question_input.explanation,
      question_input.explanation_te, question_input.difficulty, question_input.image_url,
      question_input.source_reference, question_input.source_exam_date, question_input.is_active,
      question_input.content_lifecycle, question_input.review_on, question_input.expires_on
    )
    on conflict (subject_id, import_key) where import_key is not null
    do update set
      question_type = excluded.question_type,
      question_text = excluded.question_text,
      option_a = excluded.option_a,
      option_b = excluded.option_b,
      option_c = excluded.option_c,
      option_d = excluded.option_d,
      question_text_te = excluded.question_text_te,
      option_a_te = excluded.option_a_te,
      option_b_te = excluded.option_b_te,
      option_c_te = excluded.option_c_te,
      option_d_te = excluded.option_d_te,
      correct_answer = excluded.correct_answer,
      explanation = excluded.explanation,
      explanation_te = excluded.explanation_te,
      difficulty = excluded.difficulty,
      image_url = coalesce(excluded.image_url, public.questions.image_url),
      source_reference = excluded.source_reference,
      source_exam_date = excluded.source_exam_date,
      is_active = excluded.is_active,
      content_lifecycle = excluded.content_lifecycle,
      review_on = excluded.review_on,
      expires_on = excluded.expires_on,
      updated_at = now()
    returning id into saved_question_id;

    if existed then updated_count := updated_count + 1;
    else added_count := added_count + 1;
    end if;

    select * into preference from jsonb_to_recordset(requested_assignments) as assignment(
      subject_id uuid, import_key text, question_order integer, marks numeric, negative_marks numeric
    ) where assignment.subject_id = question_input.subject_id and assignment.import_key = question_input.import_key;

    insert into public.mock_test_questions (
      mock_test_id, question_id, question_order, marks, negative_marks
    ) values (
      requested_mock_test_id, saved_question_id, preference.question_order,
      preference.marks, preference.negative_marks
    );
    assigned_count := assigned_count + 1;
  end loop;

  with deleted_rows as (
    delete from public.questions as question
    where question.id = any(old_question_ids)
      and not exists (
        select 1 from public.mock_test_questions as assignment
        where assignment.question_id = question.id
      )
      and not exists (
        select 1 from public.test_attempt_session_questions as session_question
        where session_question.question_id = question.id
      )
      and not exists (
        select 1 from public.attempt_responses as response
        where response.question_id = question.id
      )
    returning question.id, question.image_url
  )
  select count(*), array_remove(array_agg(image_url), null)
  into deleted_count, deleted_images
  from deleted_rows;

  return query select added_count, updated_count, assigned_count,
    deleted_count, coalesce(deleted_images, array[]::text[]);
end;
$$;

-- Update create_corrected_mock_test_version to check mock_test_has_student_attempts
create or replace function public.create_corrected_mock_test_version(requested_mock_test_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  source_test public.mock_tests%rowtype;
  corrected_test_id uuid := gen_random_uuid();
  source_assignment record;
  corrected_question_id uuid;
begin
  if not public.is_admin() then raise exception 'Administrator MFA verification is required.'; end if;
  select * into source_test from public.mock_tests where id = requested_mock_test_id for update;
  if source_test.id is null then raise exception 'Mock Test not found.'; end if;
  if source_test.superseded_by_mock_test_id is not null then
    raise exception 'A corrected version already exists for this Mock Test.';
  end if;
  if not public.mock_test_has_student_attempts(requested_mock_test_id) then
    raise exception 'This Mock Test has no student attempts. Edit the existing draft instead.';
  end if;

  update public.mock_tests set status = 'archived', superseded_by_mock_test_id = corrected_test_id, updated_at = now()
  where id = source_test.id;

  insert into public.mock_tests (
    id, paper_id, subject_id, title, slug, description, instructions, duration_minutes,
    difficulty, status, version, display_order, published_at, access_type, price_inr,
    test_scope, series_number, seo_title, seo_description,
    target_question_count, replaces_mock_test_id
  ) values (
    corrected_test_id, source_test.paper_id, source_test.subject_id, source_test.title,
    source_test.slug, source_test.description, source_test.instructions, source_test.duration_minutes,
    source_test.difficulty, 'draft', source_test.version + 1, source_test.display_order, null,
    source_test.access_type, source_test.price_inr, source_test.test_scope,
    source_test.series_number, source_test.seo_title,
    source_test.seo_description, source_test.target_question_count, source_test.id
  );

  for source_assignment in
    select assignment.question_order, assignment.marks, assignment.negative_marks, question.*
    from public.mock_test_questions assignment
    join public.questions question on question.id = assignment.question_id
    where assignment.mock_test_id = source_test.id order by assignment.question_order
  loop
    insert into public.questions (
      subject_id, question_text, question_type, option_a, option_b, option_c, option_d,
      correct_answer, explanation, difficulty, image_url, source_reference, is_active,
      content_lifecycle, review_on, expires_on, import_key, question_text_te, option_a_te,
      option_b_te, option_c_te, option_d_te, explanation_te, source_exam_date
    ) values (
      source_assignment.subject_id, source_assignment.question_text, source_assignment.question_type,
      source_assignment.option_a, source_assignment.option_b, source_assignment.option_c,
      source_assignment.option_d, source_assignment.correct_answer, source_assignment.explanation,
      source_assignment.difficulty, source_assignment.image_url, source_assignment.source_reference,
      source_assignment.is_active, source_assignment.content_lifecycle, source_assignment.review_on,
      source_assignment.expires_on, null, source_assignment.question_text_te,
      source_assignment.option_a_te, source_assignment.option_b_te, source_assignment.option_c_te,
      source_assignment.option_d_te, source_assignment.explanation_te, source_assignment.source_exam_date
    ) returning id into corrected_question_id;

    insert into public.mock_test_questions (mock_test_id, question_id, question_order, marks, negative_marks)
    values (corrected_test_id, corrected_question_id, source_assignment.question_order,
      source_assignment.marks, source_assignment.negative_marks);
  end loop;
  return corrected_test_id;
end;
$$;

-- Update get_admin_mock_test_summaries to exclude kodidalanani@gmail.com and admin accounts from attempt_count
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
set search_path = public, auth
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
      count(*) filter (
        where not exists (
          select 1 from auth.users u
          where u.id = attempt.user_id
            and lower(coalesce(u.email, '')) = 'kodidalanani@gmail.com'
        ) and not exists (
          select 1 from public.profiles p
          where p.id = attempt.user_id
            and p.role = 'admin'
        )
      ) as attempt_count
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
