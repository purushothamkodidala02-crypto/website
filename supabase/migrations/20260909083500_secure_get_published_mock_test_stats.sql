-- Restrict get_published_mock_test_stats to service_role only
revoke all on function public.get_published_mock_test_stats() from public, anon, authenticated;
grant execute on function public.get_published_mock_test_stats() to service_role;
