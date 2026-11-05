-- Performance optimization indexes for admin queries and dashboards

-- 1. Index dynamic_survey_responses for fast new/unseen survey badge counts and ordering
create index if not exists idx_dynamic_survey_responses_submitted_at
  on public.dynamic_survey_responses(submitted_at desc);

-- 2. Index question_reports by status and created_at for instantaneous badge and open report counts
create index if not exists idx_question_reports_status_created_at
  on public.question_reports(status, created_at desc);

-- 3. Composite index on test_attempts for fast mock_test_id and user_id exemption lookups
create index if not exists idx_test_attempts_mock_test_user
  on public.test_attempts(mock_test_id, user_id);

-- 4. Index mock_test_questions for fast assignment resolution by mock test
create index if not exists idx_mock_test_questions_test_question
  on public.mock_test_questions(mock_test_id, question_id);
