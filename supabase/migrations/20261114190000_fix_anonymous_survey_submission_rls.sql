-- Migration: 20261114190000_fix_anonymous_survey_submission_rls.sql
-- Purpose: Allow anonymous and authenticated students to submit survey answers without
--          being blocked by RLS subquery permission checks on dynamic_survey_responses.

create or replace function public.survey_response_allows_answers(target_response_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.dynamic_survey_responses
    where id = target_response_id
      and (user_id = auth.uid() or user_id is null)
  );
$$;

revoke all on function public.survey_response_allows_answers(uuid) from public;
grant execute on function public.survey_response_allows_answers(uuid) to anon, authenticated, service_role;

drop policy if exists "Users can submit survey answers" on public.dynamic_survey_answers;
create policy "Users can submit survey answers" on public.dynamic_survey_answers
  for insert
  with check (public.survey_response_allows_answers(response_id));

notify pgrst, 'reload schema';
