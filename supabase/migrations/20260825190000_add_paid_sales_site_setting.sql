create table if not exists public.site_settings (
  key text primary key,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

insert into public.site_settings (key, enabled)
values ('paid_sales', false)
on conflict (key) do nothing;

alter table public.site_settings enable row level security;

do $$ begin
  create policy "Public can read site settings" on public.site_settings
  for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can manage site settings" on public.site_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
exception when duplicate_object then null;
end $$;
