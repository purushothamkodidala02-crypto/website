alter table public.question_reports
  add column if not exists mock_test_id uuid references public.mock_tests(id) on delete set null;

create index if not exists idx_question_reports_mock_test
  on public.question_reports(mock_test_id);
