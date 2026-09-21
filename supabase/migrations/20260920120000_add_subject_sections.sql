-- Subject Sub-sections (e.g. June, July for Current Affairs or specific sub-topics)
create table if not exists public.subject_sections (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subject_id, slug)
);

create index if not exists idx_subject_sections_subject_id
  on public.subject_sections (subject_id, display_order);

alter table public.subject_sections enable row level security;

drop policy if exists "Public can view active subject sections" on public.subject_sections;
create policy "Public can view active subject sections"
on public.subject_sections for select
using (is_active = true);

drop policy if exists "Admins can manage subject sections" on public.subject_sections;
create policy "Admins can manage subject sections"
on public.subject_sections for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop trigger if exists update_subject_sections_updated_at on public.subject_sections;
create trigger update_subject_sections_updated_at
before update on public.subject_sections
for each row execute function public.update_updated_at_column();

-- Add optional subject_section_id to mock_tests
alter table public.mock_tests
  add column if not exists subject_section_id uuid
    references public.subject_sections(id) on delete set null;

create index if not exists idx_mock_tests_subject_section_id
  on public.mock_tests (subject_section_id);

create or replace function public.validate_mock_test_subject_section()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  section_subject_id uuid;
begin
  if new.subject_section_id is null then
    return new;
  end if;

  select subject_id into section_subject_id
  from public.subject_sections
  where id = new.subject_section_id;

  if section_subject_id is null or section_subject_id <> new.subject_id then
    raise exception 'The selected sub-section must belong to the selected Subject.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_mock_test_subject_section_trigger on public.mock_tests;
create trigger validate_mock_test_subject_section_trigger
before insert or update of subject_section_id, subject_id on public.mock_tests
for each row execute function public.validate_mock_test_subject_section();
