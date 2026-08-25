create table if not exists public.student_question_bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table if not exists public.student_question_mistakes (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  mistake_count integer not null default 1 check (mistake_count > 0),
  correct_after_mistake_count integer not null default 0 check (correct_after_mistake_count >= 0),
  last_attempt_id uuid references public.test_attempts(id) on delete set null,
  last_selected_answer text check (last_selected_answer in ('A', 'B', 'C', 'D')),
  last_seen_at timestamptz not null default now(),
  mastered_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index if not exists idx_student_question_mistakes_active
  on public.student_question_mistakes(user_id, last_seen_at desc)
  where mastered_at is null;

alter table public.student_question_bookmarks enable row level security;
alter table public.student_question_mistakes enable row level security;

do $$ begin
  create policy "Students manage their own question bookmarks"
  on public.student_question_bookmarks for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Students view their own mistake book"
  on public.student_question_mistakes for select to authenticated
  using (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Students can remove their own mistake entries"
  on public.student_question_mistakes for delete to authenticated
  using (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

create or replace function public.track_student_question_result()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  attempt_owner uuid;
  attempt_time timestamptz;
begin
  select user_id, submitted_at into attempt_owner, attempt_time
  from public.test_attempts where id = new.attempt_id;

  if attempt_owner is null then return new; end if;

  if new.is_correct then
    update public.student_question_mistakes
    set correct_after_mistake_count = correct_after_mistake_count + 1,
        last_attempt_id = new.attempt_id,
        last_selected_answer = new.selected_answer,
        last_seen_at = attempt_time,
        mastered_at = attempt_time
    where user_id = attempt_owner and question_id = new.question_id;
  else
    insert into public.student_question_mistakes (
      user_id, question_id, mistake_count, last_attempt_id,
      last_selected_answer, last_seen_at, mastered_at
    ) values (
      attempt_owner, new.question_id, 1, new.attempt_id,
      new.selected_answer, attempt_time, null
    )
    on conflict (user_id, question_id) do update
    set mistake_count = student_question_mistakes.mistake_count + 1,
        last_attempt_id = excluded.last_attempt_id,
        last_selected_answer = excluded.last_selected_answer,
        last_seen_at = excluded.last_seen_at,
        mastered_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists track_student_question_result_after_insert on public.attempt_responses;
create trigger track_student_question_result_after_insert
after insert on public.attempt_responses
for each row execute function public.track_student_question_result();

-- Include existing retained incorrect answers without modifying attempt history.
insert into public.student_question_mistakes (
  user_id, question_id, mistake_count, last_seen_at
)
select attempt.user_id, response.question_id,
       count(*) filter (where response.is_correct = false)::integer,
       max(attempt.submitted_at)
from public.attempt_responses response
join public.test_attempts attempt on attempt.id = response.attempt_id
group by attempt.user_id, response.question_id
having (array_agg(response.is_correct order by attempt.submitted_at desc, attempt.id desc))[1] = false
   and count(*) filter (where response.is_correct = false) > 0
on conflict (user_id, question_id) do nothing;

create or replace function public.get_student_study_book(requested_kind text)
returns table (
  question_id uuid,
  subject_name text,
  question_text text,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  correct_answer text,
  explanation text,
  image_url text,
  content_language_mode text,
  question_text_te text,
  option_a_te text,
  option_b_te text,
  option_c_te text,
  option_d_te text,
  explanation_te text,
  mistake_count integer,
  last_selected_answer text,
  last_seen_at timestamptz,
  bookmarked boolean
)
language sql
security definer
set search_path = public
as $$
  select question.id, subject.name, question.question_text,
    question.option_a, question.option_b, question.option_c, question.option_d,
    question.correct_answer, question.explanation, question.image_url,
    subject.content_language_mode, question.question_text_te,
    question.option_a_te, question.option_b_te, question.option_c_te,
    question.option_d_te, question.explanation_te,
    coalesce(mistake.mistake_count, 0), mistake.last_selected_answer,
    coalesce(mistake.last_seen_at, bookmark.created_at), bookmark.question_id is not null
  from public.questions question
  join public.subjects subject on subject.id = question.subject_id
  left join public.student_question_mistakes mistake
    on mistake.question_id = question.id and mistake.user_id = auth.uid()
  left join public.student_question_bookmarks bookmark
    on bookmark.question_id = question.id and bookmark.user_id = auth.uid()
  where auth.uid() is not null
    and (
      (requested_kind = 'mistakes' and mistake.question_id is not null and mistake.mastered_at is null)
      or (requested_kind = 'bookmarks' and bookmark.question_id is not null)
    )
  order by coalesce(mistake.last_seen_at, bookmark.created_at) desc;
$$;

revoke all on function public.get_student_study_book(text) from public;
grant execute on function public.get_student_study_book(text) to authenticated;
