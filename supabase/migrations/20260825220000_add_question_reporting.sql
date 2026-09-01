create table if not exists public.question_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  attempt_id uuid references public.test_attempts(id) on delete set null,
  category text not null check (category in ('wrong_answer', 'unclear_wording', 'translation', 'broken_image', 'duplicate', 'other')),
  details text check (
    (details is null or char_length(details) <= 1000)
    and (category <> 'other' or char_length(trim(details)) >= 10)
  ),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  admin_notes text check (admin_notes is null or char_length(admin_notes) <= 2000),
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_question_reports_admin_queue
  on public.question_reports(status, created_at desc);
create index if not exists idx_question_reports_question
  on public.question_reports(question_id, created_at desc);
create unique index if not exists uq_question_reports_open_student_category
  on public.question_reports(user_id, question_id, category)
  where status in ('open', 'reviewing');

alter table public.question_reports enable row level security;

do $$ begin
  create policy "Students submit their own open question reports"
  on public.question_reports for insert to authenticated
  with check (
    user_id = auth.uid() and status = 'open'
    and admin_notes is null and resolved_by is null and resolved_at is null
    and (attempt_id is null or exists (
      select 1 from public.test_attempts attempt
      where attempt.id = question_reports.attempt_id and attempt.user_id = auth.uid()
    ))
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Students view their own question reports"
  on public.question_reports for select to authenticated
  using (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins manage question reports"
  on public.question_reports for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
exception when duplicate_object then null;
end $$;
