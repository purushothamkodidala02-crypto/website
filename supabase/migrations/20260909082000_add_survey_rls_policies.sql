-- Row Level Security policies for dynamic survey tables
alter table if exists public.dynamic_surveys enable row level security;
alter table if exists public.dynamic_survey_questions enable row level security;
alter table if exists public.dynamic_survey_responses enable row level security;
alter table if exists public.dynamic_survey_answers enable row level security;

-- dynamic_surveys
drop policy if exists "Public can view active surveys" on public.dynamic_surveys;
create policy "Public can view active surveys" on public.dynamic_surveys
  for select using (is_active or public.is_admin());

drop policy if exists "Admins can manage surveys" on public.dynamic_surveys;
create policy "Admins can manage surveys" on public.dynamic_surveys
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- dynamic_survey_questions
drop policy if exists "Public can view survey questions" on public.dynamic_survey_questions;
create policy "Public can view survey questions" on public.dynamic_survey_questions
  for select using (
    exists (
      select 1 from public.dynamic_surveys s
      where s.id = dynamic_survey_questions.survey_id
        and (s.is_active or public.is_admin())
    )
  );

drop policy if exists "Admins can manage survey questions" on public.dynamic_survey_questions;
create policy "Admins can manage survey questions" on public.dynamic_survey_questions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- dynamic_survey_responses
drop policy if exists "Users can submit survey responses" on public.dynamic_survey_responses;
create policy "Users can submit survey responses" on public.dynamic_survey_responses
  for insert
  with check (user_id = auth.uid() or user_id is null);

drop policy if exists "Users can view own survey responses" on public.dynamic_survey_responses;
create policy "Users can view own survey responses" on public.dynamic_survey_responses
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can manage survey responses" on public.dynamic_survey_responses;
create policy "Admins can manage survey responses" on public.dynamic_survey_responses
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- dynamic_survey_answers
drop policy if exists "Users can submit survey answers" on public.dynamic_survey_answers;
create policy "Users can submit survey answers" on public.dynamic_survey_answers
  for insert
  with check (
    exists (
      select 1 from public.dynamic_survey_responses r
      where r.id = dynamic_survey_answers.response_id
        and (r.user_id = auth.uid() or r.user_id is null or public.is_admin())
    )
  );

drop policy if exists "Users can view own survey answers" on public.dynamic_survey_answers;
create policy "Users can view own survey answers" on public.dynamic_survey_answers
  for select to authenticated
  using (
    exists (
      select 1 from public.dynamic_survey_responses r
      where r.id = dynamic_survey_answers.response_id
        and (r.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "Admins can manage survey answers" on public.dynamic_survey_answers;
create policy "Admins can manage survey answers" on public.dynamic_survey_answers
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
