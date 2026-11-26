-- Allow specific mock tests (such as Previous Year Papers) to reuse questions
-- that already appear in other mock tests of the same paper.
alter table public.mock_tests
  add column if not exists allow_duplicate_questions boolean not null default false;
