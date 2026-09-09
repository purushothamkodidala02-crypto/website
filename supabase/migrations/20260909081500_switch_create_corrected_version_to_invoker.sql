-- Switch create_corrected_mock_test_version to SECURITY INVOKER to satisfy Supabase security linter
alter function public.create_corrected_mock_test_version(uuid) security invoker;
