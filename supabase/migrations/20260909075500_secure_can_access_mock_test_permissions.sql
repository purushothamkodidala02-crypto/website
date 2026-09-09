-- Fix: Revoke anon execution on SECURITY DEFINER function can_access_mock_test
revoke all on function public.can_access_mock_test(uuid) from public;
revoke all on function public.can_access_mock_test(uuid) from anon;
grant execute on function public.can_access_mock_test(uuid) to authenticated, service_role;
