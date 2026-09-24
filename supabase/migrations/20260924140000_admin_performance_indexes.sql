-- Performance optimization indexes for admin operations and queries

-- 1. Index question_id on test_attempt_session_questions for instant question usage check
create index if not exists idx_test_attempt_session_questions_question_id
  on public.test_attempt_session_questions(question_id);

-- 2. Index profiles role for fast admin identification without full table scan
create index if not exists idx_profiles_role
  on public.profiles(role);

-- 3. Index payment_orders status for fast paid order aggregations
create index if not exists idx_payment_orders_status
  on public.payment_orders(status);

-- 4. Composite index on questions for fast active / expiry filtering and counts
create index if not exists idx_questions_active_lifecycle_expires_on
  on public.questions(is_active, content_lifecycle, expires_on);
