-- Migration: Harden mock test publishing function permissions and restore draft tests to published
-- 1. Updates publish_mock_test_safely and republish_archived_mock_test_safely to support both verified admin MFA and service_role
-- 2. Publishes AP EO Mahabharatham Mock Test 01, TG EO Mahabharatham Mock Test 01, and AP EO Hindu Puranams Mock Test 07
-- 3. Archives orphaned TG HMWSSB mock tests with missing paper hierarchy

BEGIN;

-- 1. Replace publish_mock_test_safely with security definer and service_role support
CREATE OR REPLACE FUNCTION public.publish_mock_test_safely(requested_mock_test_id uuid)
RETURNS TABLE (question_count bigint, total_marks numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  test_record record;
  actual_question_count bigint;
  actual_total_marks numeric;
  invalid_question_count bigint;
BEGIN
  IF coalesce(auth.jwt() ->> 'role', '') <> 'service_role' AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator MFA verification is required.';
  END IF;

  SELECT
    mock_test.id,
    mock_test.status,
    mock_test.test_scope,
    mock_test.paper_id,
    mock_test.subject_id,
    mock_test.access_type,
    paper.question_count AS configured_question_count
  INTO test_record
  FROM public.mock_tests mock_test
  JOIN public.papers paper ON paper.id = mock_test.paper_id
  WHERE mock_test.id = requested_mock_test_id
  FOR UPDATE OF mock_test;

  IF test_record.id IS NULL THEN
    RAISE EXCEPTION 'Mock Test not found.';
  END IF;

  IF test_record.status <> 'draft' THEN
    RAISE EXCEPTION 'Only draft Mock Tests can be published.';
  END IF;

  IF test_record.access_type = 'paid' AND NOT EXISTS (
    SELECT 1
    FROM public.access_product_exam_groups map
    JOIN public.access_products product ON product.id = map.product_id
    WHERE map.exam_group_id = (SELECT exam_group_id FROM public.papers WHERE id = test_record.paper_id)
      AND product.is_active
  ) THEN
    RAISE EXCEPTION 'Create an active Exam Pass for this Exam before publishing a paid Mock Test.';
  END IF;

  SELECT
    count(*),
    coalesce(sum(assignment.marks), 0),
    count(*) FILTER (
      WHERE question.id IS NULL
        OR NOT question.is_active
        OR subject.id IS NULL
        OR subject.paper_id <> test_record.paper_id
        OR (test_record.test_scope = 'subject' AND question.subject_id <> test_record.subject_id)
        OR (question.content_lifecycle = 'expires' AND question.expires_on < (now() AT TIME ZONE 'Asia/Kolkata')::date)
        OR assignment.marks <= 0
        OR assignment.negative_marks < 0
    )
  INTO actual_question_count, actual_total_marks, invalid_question_count
  FROM public.mock_test_questions assignment
  LEFT JOIN public.questions question ON question.id = assignment.question_id
  LEFT JOIN public.subjects subject ON subject.id = question.subject_id
  WHERE assignment.mock_test_id = requested_mock_test_id;

  IF actual_question_count = 0 THEN
    RAISE EXCEPTION 'Add at least one Question before publishing.';
  END IF;

  IF invalid_question_count > 0 THEN
    RAISE EXCEPTION 'Every assigned Question and mark must be active and valid.';
  END IF;

  IF test_record.test_scope = 'paper'
     AND test_record.configured_question_count IS NOT NULL
     AND actual_question_count <> test_record.configured_question_count THEN
    RAISE EXCEPTION 'The assigned Question count must match the Paper Question count.';
  END IF;

  UPDATE public.mock_tests
  SET status = 'published',
      published_at = COALESCE(published_at, now()),
      updated_at = now()
  WHERE id = requested_mock_test_id;

  RETURN QUERY SELECT actual_question_count, actual_total_marks;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_mock_test_safely(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.publish_mock_test_safely(uuid) TO authenticated, service_role;

-- 2. Replace republish_archived_mock_test_safely with security definer and service_role support
CREATE OR REPLACE FUNCTION public.republish_archived_mock_test_safely(requested_mock_test_id uuid)
RETURNS TABLE (question_count bigint, total_marks numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_test record;
BEGIN
  IF coalesce(auth.jwt() ->> 'role', '') <> 'service_role' AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator MFA verification is required.';
  END IF;

  SELECT id, status, superseded_by_mock_test_id INTO target_test
  FROM public.mock_tests
  WHERE id = requested_mock_test_id
  FOR UPDATE;

  IF target_test.id IS NULL THEN
    RAISE EXCEPTION 'Mock Test not found.';
  END IF;

  IF target_test.status <> 'archived' THEN
    RAISE EXCEPTION 'Only hidden Mock Tests can be published again.';
  END IF;

  IF target_test.superseded_by_mock_test_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.mock_tests
    WHERE id = target_test.superseded_by_mock_test_id AND status = 'published'
  ) THEN
    RAISE EXCEPTION 'The corrected version of this Mock Test is already published.';
  END IF;

  UPDATE public.mock_tests
  SET status = 'draft', published_at = null
  WHERE id = requested_mock_test_id;

  RETURN QUERY
  SELECT published.question_count, published.total_marks
  FROM public.publish_mock_test_safely(requested_mock_test_id) AS published;
END;
$$;

REVOKE ALL ON FUNCTION public.republish_archived_mock_test_safely(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.republish_archived_mock_test_safely(uuid) TO authenticated, service_role;

-- 3. Publish previously prepared mock tests that are ready for students
UPDATE public.mock_tests
SET status = 'published',
    published_at = COALESCE(published_at, now()),
    updated_at = now()
WHERE id IN (
  '5d4222b7-a2e9-4471-a006-b1813a18f7a4', -- AP EO · Mahabharatham · Mock Test 01
  '433697ea-8456-44d7-8681-81b46125b23e', -- TG EO · Mahabharatham · Mock Test 01
  '15f047ac-d741-4abe-bda4-75fcd4771542'  -- AP EO · Hindu Puranams · Mock Test 07
)
AND status = 'draft';

-- 4. Archive orphaned TG HMWSSB tests pointing to non-existent paper
UPDATE public.mock_tests
SET status = 'archived',
    updated_at = now()
WHERE id IN (
  'e92b8031-af32-4c73-bdd4-6fe526f4b66b',
  '82af1240-51ee-4c6f-ae80-494edcb30536'
)
AND status = 'published';

COMMIT;

NOTIFY pgrst, 'reload schema';
