-- Administrator-managed questions and answers shown on each public exam page.
create table if not exists public.exam_page_faqs (
  id uuid primary key default gen_random_uuid(),
  exam_group_id uuid not null references public.exam_groups(id) on delete cascade,
  question text not null check (char_length(trim(question)) between 5 and 300),
  answer text not null check (char_length(trim(answer)) between 10 and 3000),
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exam_page_faqs_exam_group_order_idx
  on public.exam_page_faqs (exam_group_id, display_order, created_at);

drop trigger if exists update_exam_page_faqs_updated_at on public.exam_page_faqs;
create trigger update_exam_page_faqs_updated_at
before update on public.exam_page_faqs
for each row execute function public.update_updated_at_column();

alter table public.exam_page_faqs enable row level security;

grant select on public.exam_page_faqs to anon, authenticated;
grant insert, update, delete on public.exam_page_faqs to authenticated;

create policy "Anyone can view public exam page FAQs"
on public.exam_page_faqs for select
using (true);

create policy "Admins can manage exam page FAQs"
on public.exam_page_faqs for all to authenticated
using (public.is_admin())
with check (public.is_admin());
