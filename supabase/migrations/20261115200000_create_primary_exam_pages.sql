-- Administrator-managed primary recruitment notification pages and links.
create table if not exists public.primary_exam_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 3 and 300),
  telugu_title text default '',
  state text not null default 'Andhra Pradesh',
  status text not null default 'live' check (status in ('live', 'upcoming')),
  status_code text not null default '200 OK',
  published_date text not null default '',
  last_updated text not null default '',
  url text not null unique check (char_length(trim(url)) >= 3),
  vacancies text not null default '',
  description text not null default '',
  highlights text[] not null default '{}',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists primary_exam_pages_order_idx
  on public.primary_exam_pages (display_order asc, created_at desc);

drop trigger if exists update_primary_exam_pages_updated_at on public.primary_exam_pages;
create trigger update_primary_exam_pages_updated_at
before update on public.primary_exam_pages
for each row execute function public.update_updated_at_column();

alter table public.primary_exam_pages enable row level security;

grant select on public.primary_exam_pages to anon, authenticated;
grant insert, update, delete on public.primary_exam_pages to authenticated;

drop policy if exists "Anyone can view primary exam pages" on public.primary_exam_pages;
create policy "Anyone can view primary exam pages"
on public.primary_exam_pages for select
using (true);

drop policy if exists "Admins can manage primary exam pages" on public.primary_exam_pages;
create policy "Admins can manage primary exam pages"
on public.primary_exam_pages for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Seed initial primary exam pages
insert into public.primary_exam_pages (
  title,
  telugu_title,
  state,
  status,
  status_code,
  published_date,
  last_updated,
  url,
  vacancies,
  description,
  highlights,
  display_order
) values
(
  'Telangana Police Constable Notification 2026',
  'తెలంగాణ పోలీస్ కానిస్టేబుల్ 7,112 పోస్టుల అధికారిక నోటిఫికేషన్',
  'Telangana',
  'live',
  '200 OK',
  '14 Nov 2026',
  '15 Nov 2026',
  'https://varadhiprep.in/news/telangana-police-constable-notification-2026',
  '7,112 Posts',
  'Official recruitment breakdown for Post Codes 21–28, revised pay scale (₹24,280–₹72,850), 100-mark PMT/PET events, complete syllabus weightage, and 58 bilingual mock tests.',
  ARRAY['Post Codes 21–28', '₹24,280 – ₹72,850 Scale', '58 Free Mock Tests', 'Official PDF Mirror (748 KB)'],
  1
),
(
  'AP Endowment Officer Notification 2026',
  'ఆంధ్రప్రదేశ్ దేవాదాయ శాఖ ఎగ్జిక్యూటివ్ ఆఫీసర్ నోటిఫికేషన్ 2026',
  'Andhra Pradesh',
  'live',
  '200 OK',
  '15 Nov 2026',
  '15 Nov 2026',
  'https://varadhiprep.in/news/ap-endowment-officer-notification-2026',
  '104 Posts',
  'APSSC Executive Officer Grade-III Notification No. 23/2026, Paper-I GS & Paper-II Hindu Philosophy weightage, Act 30/1987, and official Gazette PDF download.',
  ARRAY['APPSC Cadre-III', 'Hindu Philosophy Paper-II', 'Timed Mock Tests', 'Official Gazette PDF'],
  2
)
on conflict (url) do update set
  title = excluded.title,
  telugu_title = excluded.telugu_title,
  state = excluded.state,
  status = excluded.status,
  status_code = excluded.status_code,
  published_date = excluded.published_date,
  last_updated = excluded.last_updated,
  vacancies = excluded.vacancies,
  description = excluded.description,
  highlights = excluded.highlights,
  display_order = excluded.display_order;

notify pgrst, 'reload schema';
