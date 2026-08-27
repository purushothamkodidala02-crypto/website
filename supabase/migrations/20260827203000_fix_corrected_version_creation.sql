-- The corrected-version function creates both sides of a revision link in one
-- transaction. Validate the forward link at commit time, after the new mock
-- test row and its independent question copies exist.
alter table public.mock_tests
  drop constraint if exists mock_tests_superseded_by_mock_test_id_fkey;

alter table public.mock_tests
  add constraint mock_tests_superseded_by_mock_test_id_fkey
  foreign key (superseded_by_mock_test_id)
  references public.mock_tests(id)
  on delete restrict
  deferrable initially deferred;

notify pgrst, 'reload schema';
