-- ============================================
-- VARADHI - PRIORITIZE INACTIVE EXAM-TAKERS IN MOCK TEST NOTIFICATIONS
-- ============================================
-- Orders candidate recipients so that:
--   1. Inactive past test-takers (took/started a test in this exam group,
--      not active on the site for >= 7 days) come FIRST, oldest activity first.
--   2. Active returning test-takers / pass holders (registered >= 7 days ago,
--      active within 7 days) come NEXT, least recently active first.
--   3. Recently registered users (created within the last 7 days) are placed
--      at the BOTTOM of the list, newest registrations last.

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
  with exam_attempts as (
    select
      ta.user_id,
      max(ta.submitted_at) as last_attempt_at
    from public.test_attempts ta
    join public.mock_tests mt on mt.id = ta.mock_test_id
    join public.papers p on p.id = mt.paper_id
    where p.exam_group_id = target_exam_group_id
    group by ta.user_id
  ),
  exam_sessions as (
    select
      tas.user_id,
      max(tas.started_at) as last_session_at
    from public.test_attempt_sessions tas
    join public.mock_tests mt on mt.id = tas.mock_test_id
    join public.papers p on p.id = mt.paper_id
    where p.exam_group_id = target_exam_group_id
    group by tas.user_id
  ),
  exam_entitlements as (
    select distinct se.user_id
    from public.student_entitlements se
    join public.access_product_exam_groups apeg on apeg.product_id = se.product_id
    where apeg.exam_group_id = target_exam_group_id
      and se.expires_at > now()
  ),
  candidate_users as (
    select
      coalesce(ea.user_id, es.user_id, ee.user_id) as user_id,
      (ea.user_id is not null or es.user_id is not null) as has_taken_exam,
      nullif(
        greatest(
          coalesce(ea.last_attempt_at, '-infinity'::timestamptz),
          coalesce(es.last_session_at, '-infinity'::timestamptz)
        ),
        '-infinity'::timestamptz
      ) as last_exam_activity_at
    from exam_attempts ea
    full outer join exam_sessions es on es.user_id = ea.user_id
    full outer join exam_entitlements ee on ee.user_id = coalesce(ea.user_id, es.user_id)
  ),
  enriched_users as (
    select
      cu.user_id,
      u.email::text as email,
      coalesce(nullif(trim(prof.full_name), ''), 'Student')::text as full_name,
      greatest(
        coalesce(u.last_sign_in_at, u.created_at),
        coalesce(cu.last_exam_activity_at, u.created_at)
      ) as computed_last_seen_at,
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
      eu.computed_last_seen_at as last_seen_at,
      eu.computed_registered_at as registered_at,
      case
        when eu.computed_registered_at >= now() - interval '7 days' then 'recent_signup'
        when eu.has_taken_exam and eu.computed_last_seen_at < now() - interval '7 days' then 'inactive_test_taker'
        else 'active_or_entitled'
      end as priority_tier,
      greatest(0, floor(extract(epoch from (now() - eu.computed_last_seen_at)) / 86400)::integer) as inactive_days,
      case
        when eu.has_taken_exam and eu.computed_last_seen_at < now() - interval '7 days' and eu.computed_registered_at < now() - interval '7 days' then 1
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
