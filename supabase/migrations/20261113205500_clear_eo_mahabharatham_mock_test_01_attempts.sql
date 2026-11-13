-- Migration: Clear attempts and restore Endowment Officer · Paper 2 · Mahabharatham · Mock Test 01 to draft
--
-- Mock Tests covered:
-- 1. AP Endowment Officer · Hindu Philosophy & Temple System · Mahabharatham · Mock Test 01
--    ID: 5d4222b7-a2e9-4471-a006-b1813a18f7a4
-- 2. TG Endowment Officer · Hindu Religion &Temple System · Mahabharatham · Mock Test 01
--    ID: 433697ea-8456-44d7-8681-81b46125b23e
--
-- Clears previous test attempts and timed attempt sessions, and reverts mock test to draft
-- so the administrator can upload / replace questions from an updated Excel file.

BEGIN;

-- 1. Delete submitted test attempts (cascades to attempt_responses, unlinks last_attempt_id in student_question_mistakes)
DELETE FROM public.test_attempts
WHERE mock_test_id IN (
  '5d4222b7-a2e9-4471-a006-b1813a18f7a4',
  '433697ea-8456-44d7-8681-81b46125b23e'
);

-- 2. Delete timed attempt sessions (cascades to test_attempt_session_questions and test_attempt_session_answers)
DELETE FROM public.test_attempt_sessions
WHERE mock_test_id IN (
  '5d4222b7-a2e9-4471-a006-b1813a18f7a4',
  '433697ea-8456-44d7-8681-81b46125b23e'
);

-- 3. Reset mock test status to draft so the Excel/CSV question replacement form is enabled
UPDATE public.mock_tests
SET status = 'draft',
    published_at = NULL
WHERE id IN (
  '5d4222b7-a2e9-4471-a006-b1813a18f7a4',
  '433697ea-8456-44d7-8681-81b46125b23e'
);

COMMIT;
