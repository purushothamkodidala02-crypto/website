-- Migration: 20261120000000_add_growth_popup_interactions.sql
-- Purpose: Track candidate interactions, impressions, button clicks, and amounts on the Help Us Grow pop-up.

create table if not exists public.growth_popup_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  student_name text,
  student_email text,
  event_type text not null, -- 'view', 'click_support', 'select_tier', 'dismiss', 'close', 'trigger'
  button_label text not null, -- 'Viewed Pop-up', 'Support Varadhi (₹49)', '₹99 Tier', 'Maybe Later', '✕ Close', '🌱 Support Us Trigger'
  amount numeric default null,
  page_path text default null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_growth_popup_interactions_created_at on public.growth_popup_interactions(created_at desc);
create index if not exists idx_growth_popup_interactions_user_id on public.growth_popup_interactions(user_id);
create index if not exists idx_growth_popup_interactions_event_type on public.growth_popup_interactions(event_type);

alter table public.growth_popup_interactions enable row level security;

-- Insert policy: Anyone (authenticated students or guests) can log pop-up interaction events
drop policy if exists "Anyone can record growth popup interactions" on public.growth_popup_interactions;
create policy "Anyone can record growth popup interactions" on public.growth_popup_interactions
  for insert to public
  with check (true);

-- Select policy: Only administrators can view interaction records
drop policy if exists "Admins can view growth popup interactions" on public.growth_popup_interactions;
create policy "Admins can view growth popup interactions" on public.growth_popup_interactions
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

notify pgrst, 'reload schema';
