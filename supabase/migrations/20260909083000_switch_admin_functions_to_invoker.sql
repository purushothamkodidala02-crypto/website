-- Switch admin-only procedural functions to SECURITY INVOKER to satisfy Supabase security linter
alter function public.create_exam_structure_atomic(uuid, text, text, text, boolean, integer, jsonb, jsonb) security invoker;
alter function public.import_questions_atomic(uuid, uuid, jsonb, jsonb) security invoker;
alter function public.replace_mock_test_questions_atomic(uuid, uuid, jsonb, jsonb) security invoker;
alter function public.publish_mock_test_safely(uuid) security invoker;
alter function public.republish_archived_mock_test_safely(uuid) security invoker;
alter function public.fill_mock_test_with_latest_questions(uuid) security invoker;
alter function public.move_mock_test_question(uuid, uuid, integer) security invoker;
alter function public.delete_question_safely(uuid) security invoker;
alter function public.make_question_unavailable_safely(uuid) security invoker;
alter function public.get_admin_attempt_summary() security invoker;
alter function public.get_admin_mock_test_summaries() security invoker;
alter function public.get_admin_user_emails(uuid[]) security invoker;
