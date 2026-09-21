-- Fix Survey RLS Policies so that public/anonymous users can view active surveys and submit responses
-- without hitting 'permission denied for function is_admin'.

-- 1. dynamic_surveys: Allow public to view active surveys without evaluating is_admin()
drop policy if exists "Public can view active surveys" on public.dynamic_surveys;
create policy "Public can view active surveys" on public.dynamic_surveys
  for select using (is_active = true);

-- 2. dynamic_survey_questions: Allow public to view questions of active surveys without is_admin()
drop policy if exists "Public can view survey questions" on public.dynamic_survey_questions;
create policy "Public can view survey questions" on public.dynamic_survey_questions
  for select using (
    exists (
      select 1 from public.dynamic_surveys s
      where s.id = dynamic_survey_questions.survey_id
        and s.is_active = true
    )
  );

-- 3. dynamic_survey_answers: Allow responses with null or matching user_id without evaluating is_admin()
drop policy if exists "Users can submit survey answers" on public.dynamic_survey_answers;
create policy "Users can submit survey answers" on public.dynamic_survey_answers
  for insert
  with check (
    exists (
      select 1 from public.dynamic_survey_responses r
      where r.id = dynamic_survey_answers.response_id
        and (r.user_id = auth.uid() or r.user_id is null)
    )
  );

notify pgrst, 'reload schema';
