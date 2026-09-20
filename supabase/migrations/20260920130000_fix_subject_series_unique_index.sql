-- Allow each sub-section (month/topic) to have its own independent series (Mock Test 01, Mock Test 02...)
-- Drop old subject series index that enforced uniqueness across the whole subject regardless of sub-section
drop index if exists public.uq_mock_tests_subject_series;

-- Enforce uniqueness for common subject mocks (where subject_section_id is null)
create unique index if not exists uq_mock_tests_subject_common_series
  on public.mock_tests(subject_id, series_number)
  where test_scope = 'subject' and subject_section_id is null;

-- Enforce uniqueness for sub-section mocks (where subject_section_id is not null)
create unique index if not exists uq_mock_tests_subject_section_series
  on public.mock_tests(subject_section_id, series_number)
  where test_scope = 'subject' and subject_section_id is not null;

notify pgrst, 'reload schema';
