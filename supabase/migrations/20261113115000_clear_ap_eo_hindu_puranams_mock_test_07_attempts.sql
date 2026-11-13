-- Migration: Clear attempts and restore AP Endowment Officer · Hindu Puranams · Mock Test 07 to draft
-- Mock Test ID: 15f047ac-d741-4abe-bda4-75fcd4771542
-- Paper: Hindu Philosophy & Temple System (48070adb-d7a4-4968-b474-5e642b107e9f)
-- Subject: Hindu Puranams (4290a68c-c509-4461-b8bc-9f96604646de)
-- Series Number: 7
--
-- Allows administrator to safely re-upload / replace questions from an updated Excel file.

BEGIN;

-- 1. Delete submitted test attempts (cascades to attempt_responses, sets last_attempt_id null in mistakes)
DELETE FROM public.test_attempts
WHERE mock_test_id = '15f047ac-d741-4abe-bda4-75fcd4771542';

-- 2. Delete timed attempt sessions (cascades to session_questions and session_answers)
DELETE FROM public.test_attempt_sessions
WHERE mock_test_id = '15f047ac-d741-4abe-bda4-75fcd4771542';

-- 3. Reset mock test status to draft so the Excel/CSV question replacement form is enabled
UPDATE public.mock_tests
SET status = 'draft',
    published_at = NULL
WHERE id = '15f047ac-d741-4abe-bda4-75fcd4771542';

COMMIT;
