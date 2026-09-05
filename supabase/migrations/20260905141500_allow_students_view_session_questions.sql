-- Allow students to view snapshot questions for their own attempt sessions
create policy "Users can view own session questions"
on public.test_attempt_session_questions
for select
to authenticated
using (
  exists (
    select 1 from public.test_attempt_sessions
    where test_attempt_sessions.id = test_attempt_session_questions.session_id
      and test_attempt_sessions.user_id = auth.uid()
  )
);
