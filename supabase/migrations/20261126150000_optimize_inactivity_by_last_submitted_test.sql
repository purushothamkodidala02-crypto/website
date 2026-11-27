-- ============================================
-- VARADHI - OPTIMIZE INACTIVITY BY LAST SUBMITTED TEST
-- ============================================
-- 1. Denormalize each user's last submitted test timestamp onto public.profiles
--    so inactivity queries never need a full-table GROUP BY on test_attempts.
-- 2. Keep it automatically in sync via trigger on test_attempts.
-- 3. Add composite indexes for fast exam-group candidate discovery.
-- 4. Update get_mock_test_candidate_recipients to measure inactivity from
--    profiles.last_test_submitted_at.

alter table public.profiles
  add column if not exists last_test_submitted_at timestamptz;

-- Backfill from existing submitted attempts
update public.profiles p
set last_test_submitted_at = sub.max_submitted_at
from (
  select
    ta.user_id,
    max(ta.submitted_at) as max_submitted_at
  from public.test_attempts ta
  group by ta.user_id
) sub
where p.id = sub.user_id
  and (p.last_test_submitted_at is null or p.last_test_submitted_at < sub.max_submitted_at);

-- Trigger to keep profiles.last_test_submitted_at updated in O(1) on test submission
create or replace function public.sync_profile_last_test_submitted_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set last_test_submitted_at = greatest(
    coalesce(last_test_submitted_at, new.submitted_at),
    new.submitted_at
  )
  where id = new.user_id;
  return new;
end;
$$;

drop trigger if exists trg_sync_profile_last_test_submitted_at on public.test_attempts;
create trigger trg_sync_profile_last_test_submitted_at
  after insert or update of submitted_at on public.test_attempts
  for each row
  execute function public.sync_profile_last_test_submitted_at();

-- Composite indexes for fast candidate lookup by exam group
create index if not exists idx_test_attempt_sessions_mock_test_user
  on public.test_attempt_sessions(mock_test_id, user_id);

create index if not exists idx_student_entitlements_product_expires_user
  on public.student_entitlements(product_id, expires_at, user_id);

create index if not exists idx_profiles_student_last_submitted
  on public.profiles(last_test_submitted_at asc)
  where role = 'student';

-- Recreate RPC using profiles.last_test_submitted_at (zero GROUP BY over test_attempts)
drop function if exists public.get_mock_test_candidate_recipients(uuid);

create or replace function public.get_mock_test_candidate_recipients(requested_mock_test_id uuid)
returns table (
  user_id uuid,
  email text,
  full_name text,
  last_seen_at timestamptz,
  registered_at timestamptz,
  priority_tier text,
  inactive_days integer
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
  with exam_test_ids as (
    select mt.id
    from public.mock_tests mt
    join public.papers p on p.id = mt.paper_id
    where p.exam_group_id = target_exam_group_id
  ),
  attempt_or_session_users as (
    select ta.user_id
    from public.test_attempts ta
    join exam_test_ids et on et.id = ta.mock_test_id
    union
    select tas.user_id
    from public.test_attempt_sessions tas
    join exam_test_ids et on et.id = tas.mock_test_id
  ),
  entitled_users as (
    select distinct se.user_id
    from public.student_entitlements se
    join public.access_product_exam_groups apeg on apeg.product_id = se.product_id
    where apeg.exam_group_id = target_exam_group_id
      and se.expires_at > now()
  ),
  candidate_users as (
    select
      coalesce(asu.user_id, eu.user_id) as user_id,
      (asu.user_id is not null) as has_taken_exam
    from attempt_or_session_users asu
    full outer join entitled_users eu on eu.user_id = asu.user_id
  ),
  enriched_users as (
    select
      cu.user_id,
      u.email::text as email,
      coalesce(nullif(trim(prof.full_name), ''), 'Student')::text as full_name,
      coalesce(prof.last_test_submitted_at, u.created_at) as computed_last_submitted_at,
      u.created_at as computed_registered_at,
      cu.has_taken_exam
    from candidate_users cu
    join auth.users u on u.id = cu.user_id
    join public.profiles prof on prof.id = cu.user_id
    where u.email is not null
      and u.email_confirmed_at is not null
      and prof.role = 'student'
  ),
  prioritized_users as (
    select
      eu.user_id,
      eu.email,
      eu.full_name,
      eu.computed_last_submitted_at as last_seen_at,
      eu.computed_registered_at as registered_at,
      case
        when eu.computed_registered_at >= now() - interval '7 days' then 'recent_signup'
        when eu.has_taken_exam and eu.computed_last_submitted_at < now() - interval '7 days' then 'inactive_test_taker'
        else 'active_or_entitled'
      end as priority_tier,
      greatest(0, floor(extract(epoch from (now() - eu.computed_last_submitted_at)) / 86400)::integer) as inactive_days,
      case
        when eu.has_taken_exam
          and eu.computed_last_submitted_at < now() - interval '7 days'
          and eu.computed_registered_at < now() - interval '7 days' then 1
        when eu.computed_registered_at < now() - interval '7 days' then 2
        else 3
      end as sort_rank
    from enriched_users eu
  )
  select
    pu.user_id,
    pu.email,
    pu.full_name,
    pu.last_seen_at,
    pu.registered_at,
    pu.priority_tier,
    pu.inactive_days
  from prioritized_users pu
  order by
    pu.sort_rank asc,
    case when pu.sort_rank in (1, 2) then pu.last_seen_at end asc,
    case when pu.sort_rank = 3 then pu.registered_at end asc,
    pu.full_name asc;
end;
$$;

revoke all on function public.get_mock_test_candidate_recipients(uuid) from public, anon;
grant execute on function public.get_mock_test_candidate_recipients(uuid) to authenticated, service_role;
