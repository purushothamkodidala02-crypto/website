-- Mock Test specialisation is inherited through its Paper. The initial
-- corrected-version function incorrectly referenced a non-existent mock-test
-- column. Replace it with the exact live mock_tests column set.
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
    id, paper_id, subject_id, title, slug, description, instructions, duration_minutes,
    difficulty, status, version, display_order, published_at, access_type, price_inr,
    test_scope, series_number, seo_title, seo_description, target_question_count,
    replaces_mock_test_id
  ) values (
    corrected_test_id, source_test.paper_id, source_test.subject_id, source_test.title,
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

revoke all on function public.create_corrected_mock_test_version(uuid) from public;
grant execute on function public.create_corrected_mock_test_version(uuid) to authenticated;
notify pgrst, 'reload schema';
