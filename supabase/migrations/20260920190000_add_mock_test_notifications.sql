-- ============================================
-- VARADHI - MOCK TEST EMAIL NOTIFICATIONS
-- ============================================

-- Table to log sent notifications to avoid duplicate blasts
create table if not exists public.mock_test_notifications (
  id uuid primary key default gen_random_uuid(),
  mock_test_id uuid not null references public.mock_tests(id) on delete cascade,
  recipient_count integer not null default 0,
  sent_by uuid references auth.users(id) on delete set null,
  sent_at timestamptz not null default now(),
  email_subject text not null,
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_mock_test_notifications_test_id
  on public.mock_test_notifications(mock_test_id, sent_at desc);

alter table public.mock_test_notifications enable row level security;

drop policy if exists "Admins can view and manage mock test notifications" on public.mock_test_notifications;
create policy "Admins can view and manage mock test notifications"
  on public.mock_test_notifications
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Service role can manage mock test notifications" on public.mock_test_notifications;
create policy "Service role can manage mock test notifications"
  on public.mock_test_notifications
  for all to service_role
  using (true)
  with check (true);

-- Function to find candidate student recipients for a mock test
-- Retrieves distinct students who attempted any mock test under the same exam group
-- or hold an active entitlement for that exam group.
create or replace function public.get_mock_test_candidate_recipients(requested_mock_test_id uuid)
returns table (
  user_id uuid,
  email text,
  full_name text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_exam_group_id uuid;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' and not public.is_admin() then
    raise exception 'Administrator access is required.';
  end if;

  select p.exam_group_id into target_exam_group_id
  from public.mock_tests mt
  join public.papers p on p.id = mt.paper_id
  where mt.id = requested_mock_test_id;

  if target_exam_group_id is null then
    return;
  end if;

  return query
  with candidate_users as (
    -- Students who submitted any test in this exam group
    select distinct ta.user_id
    from public.test_attempts ta
    join public.mock_tests mt on mt.id = ta.mock_test_id
    join public.papers p on p.id = mt.paper_id
    where p.exam_group_id = target_exam_group_id

    union

    -- Students who started a session in this exam group
    select distinct tas.user_id
    from public.test_attempt_sessions tas
    join public.mock_tests mt on mt.id = tas.mock_test_id
    join public.papers p on p.id = mt.paper_id
    where p.exam_group_id = target_exam_group_id

    union

    -- Students who purchased or hold an active pass for this exam group
    select distinct se.user_id
    from public.student_entitlements se
    join public.access_product_exam_groups apeg on apeg.product_id = se.product_id
    where apeg.exam_group_id = target_exam_group_id
      and se.expires_at > now()
  )
  select
    cu.user_id,
    u.email::text,
    coalesce(nullif(trim(prof.full_name), ''), 'Student')::text as full_name
  from candidate_users cu
  join auth.users u on u.id = cu.user_id
  join public.profiles prof on prof.id = cu.user_id
  where u.email is not null
    and u.email_confirmed_at is not null
    and prof.role = 'student'
  order by full_name asc;
end;
$$;

revoke all on function public.get_mock_test_candidate_recipients(uuid) from public, anon;
grant execute on function public.get_mock_test_candidate_recipients(uuid) to authenticated, service_role;
