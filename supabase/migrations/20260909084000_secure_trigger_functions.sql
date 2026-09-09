-- Revoke direct API execution on internal database trigger functions
revoke all on function public.track_student_question_result() from public, anon, authenticated;
grant execute on function public.track_student_question_result() to service_role;

revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;

revoke all on function public.remember_previous_public_slug() from public, anon, authenticated;
grant execute on function public.remember_previous_public_slug() to service_role;

revoke all on function public.guard_mock_test_question_mutation() from public, anon, authenticated;
grant execute on function public.guard_mock_test_question_mutation() to service_role;

revoke all on function public.guard_mock_test_target_change() from public, anon, authenticated;
grant execute on function public.guard_mock_test_target_change() to service_role;

revoke all on function public.keep_published_mock_test_live_during_correction() from public, anon, authenticated;
grant execute on function public.keep_published_mock_test_live_during_correction() to service_role;
