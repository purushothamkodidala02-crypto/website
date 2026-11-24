-- Add bilingual and multi-image support for questions:
-- 1. Add image_url_te to public.questions for Telugu-specific diagram/image.
-- 2. Add image_url_te to public.test_attempt_session_questions for attempt snapshots.
-- 3. Update create_corrected_mock_test_version to copy image_url_te.
-- 4. Update delete_question_safely to check and return both deleted images.
-- 5. Update start_mock_test_session to snapshot image_url_te.
-- 6. Update get_mock_test_session_payload to return image_url_te.
-- 7. Update get_attempt_review to return image_url_te.

alter table public.questions
  add column if not exists image_url_te text;

alter table public.test_attempt_session_questions
  add column if not exists image_url_te text;

-- 1. Update create_corrected_mock_test_version
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
  if not exists (select 1 from public.test_attempts where mock_test_id = requested_mock_test_id) then
    raise exception 'This Mock Test has no student attempts. Edit the existing draft instead.';
  end if;

  update public.mock_tests
  set status = 'archived', superseded_by_mock_test_id = corrected_test_id, updated_at = now()
  where id = source_test.id;

  insert into public.mock_tests (
    id, paper_id, subject_id, subject_section_id, title, slug, description, instructions, duration_minutes,
    difficulty, status, version, display_order, published_at, access_type, price_inr,
    test_scope, series_number, seo_title, seo_description, target_question_count,
    replaces_mock_test_id
  ) values (
    corrected_test_id, source_test.paper_id, source_test.subject_id, source_test.subject_section_id, source_test.title,
    source_test.slug, source_test.description, source_test.instructions, source_test.duration_minutes,
    source_test.difficulty, 'draft', source_test.version + 1, source_test.display_order, null,
    source_test.access_type, source_test.price_inr, source_test.test_scope,
    source_test.series_number, source_test.seo_title, source_test.seo_description,
    source_test.target_question_count, source_test.id
  );

  for source_assignment in
    select assignment.question_order, assignment.marks, assignment.negative_marks, question.*
    from public.mock_test_questions assignment
    join public.questions question on question.id = assignment.question_id
    where assignment.mock_test_id = source_test.id
    order by assignment.question_order
  loop
    insert into public.questions (
      subject_id, question_text, question_type, option_a, option_b, option_c, option_d,
      correct_answer, explanation, difficulty, image_url, source_reference, is_active,
      content_lifecycle, review_on, expires_on, import_key, question_text_te, option_a_te,
      option_b_te, option_c_te, option_d_te, explanation_te, source_exam_date, image_url_te
    ) values (
      source_assignment.subject_id, source_assignment.question_text, source_assignment.question_type,
      source_assignment.option_a, source_assignment.option_b, source_assignment.option_c,
      source_assignment.option_d, source_assignment.correct_answer, source_assignment.explanation,
      source_assignment.difficulty, source_assignment.image_url, source_assignment.source_reference,
      source_assignment.is_active, source_assignment.content_lifecycle, source_assignment.review_on,
      source_assignment.expires_on, null, source_assignment.question_text_te,
      source_assignment.option_a_te, source_assignment.option_b_te, source_assignment.option_c_te,
      source_assignment.option_d_te, source_assignment.explanation_te, source_assignment.source_exam_date,
      source_assignment.image_url_te
    ) returning id into corrected_question_id;

    insert into public.mock_test_questions (mock_test_id, question_id, question_order, marks, negative_marks)
    values (corrected_test_id, corrected_question_id, source_assignment.question_order,
      source_assignment.marks, source_assignment.negative_marks);
  end loop;
  return corrected_test_id;
end;
$$;

revoke all on function public.create_corrected_mock_test_version(uuid) from public;
grant execute on function public.create_corrected_mock_test_version(uuid) to authenticated;

-- 2. Update delete_question_safely
drop function if exists public.delete_question_safely(uuid);
create function public.delete_question_safely(requested_question_id uuid)
returns table (deleted_image_url text, deleted_image_url_te text)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_question record;
begin
  if not public.is_admin() then raise exception 'Administrator MFA verification is required.'; end if;
  select id, image_url, image_url_te into target_question from public.questions
  where id = requested_question_id for update;
  if target_question.id is null then raise exception 'Question not found.'; end if;
  if exists (select 1 from public.mock_test_questions where question_id = requested_question_id) then
    raise exception 'This Question is assigned to a Mock Test. Remove its assignments first.';
  end if;
  if exists (select 1 from public.test_attempt_session_questions where question_id = requested_question_id)
     or exists (select 1 from public.attempt_responses where question_id = requested_question_id) then
    raise exception 'This Question is required for a retained student attempt or answer review.';
  end if;
  delete from public.questions where id = requested_question_id;
  return query select
    case
      when target_question.image_url is not null and not exists (
        select 1 from public.questions where image_url = target_question.image_url
      ) then target_question.image_url::text
      else null::text
    end,
    case
      when target_question.image_url_te is not null and not exists (
        select 1 from public.questions where image_url_te = target_question.image_url_te
      ) then target_question.image_url_te::text
      else null::text
    end;
end;
$$;

revoke all on function public.delete_question_safely(uuid) from public;
grant execute on function public.delete_question_safely(uuid) to authenticated;

-- 3. Update start_mock_test_session to snapshot image_url_te
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

-- 4. Update get_mock_test_session_payload to return image_url_te
drop function if exists public.get_mock_test_session_payload(uuid);
create function public.get_mock_test_session_payload(
  requested_session_id uuid
)
returns table (
  question_id uuid,
  question_order integer,
  marks numeric,
  negative_marks numeric,
  question_text text,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  image_url text,
  image_url_te text,
  selected_answer text,
  marked_for_review boolean,
  content_language_mode text,
  question_text_te text,
  option_a_te text,
  option_b_te text,
  option_c_te text,
  option_d_te text
)
language sql
security definer
set search_path = public
as $$
  select
    snapshot.question_id,
    snapshot.question_order,
    snapshot.marks,
    snapshot.negative_marks,
    snapshot.question_text,
    snapshot.option_a,
    snapshot.option_b,
    snapshot.option_c,
    snapshot.option_d,
    snapshot.image_url,
    snapshot.image_url_te,
    answer.selected_answer,
    coalesce(answer.marked_for_review, false),
    snapshot.content_language_mode,
    snapshot.question_text_te,
    snapshot.option_a_te,
    snapshot.option_b_te,
    snapshot.option_c_te,
    snapshot.option_d_te
  from public.test_attempt_sessions as session
  join public.test_attempt_session_questions as snapshot
    on snapshot.session_id = session.id
  left join public.test_attempt_session_answers as answer
    on answer.session_id = snapshot.session_id
    and answer.question_id = snapshot.question_id
  where session.id = requested_session_id
    and session.user_id = auth.uid()
    and session.submitted_at is null
  order by snapshot.question_order;
$$;

revoke all on function public.get_mock_test_session_payload(uuid) from public;
grant execute on function public.get_mock_test_session_payload(uuid) to authenticated;

-- 5. Update get_attempt_review to return image_url_te
drop function if exists public.get_attempt_review(uuid);
create function public.get_attempt_review(
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
  image_url text,
  image_url_te text
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
      snapshot.image_url,
      snapshot.image_url_te
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
    snapshot.image_url,
    snapshot.image_url_te
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
    question.image_url,
    question.image_url_te
  from owned_attempt as attempt
  join public.mock_tests as mock_test on mock_test.id = attempt.mock_test_id
  join public.mock_test_questions as assignment
    on assignment.mock_test_id = mock_test.id
  join public.questions as question on question.id = assignment.question_id
  left join public.subjects as subject on subject.id = question.subject_id
  left join public.attempt_responses as response
    on response.attempt_id = attempt.id
    and response.question_id = question.id
  where not exists (select 1 from session_snapshots);
$$;

revoke all on function public.get_attempt_review(uuid) from public;
grant execute on function public.get_attempt_review(uuid) to authenticated;

notify pgrst, 'reload schema';
