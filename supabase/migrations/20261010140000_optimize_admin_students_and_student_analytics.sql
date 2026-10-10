-- Optimization indexes and analytics function for admin registrations and student dashboard

-- 1. Index question_id on attempt_responses for high-performance student analytics joins
create index if not exists idx_attempt_responses_question_id
  on public.attempt_responses(question_id);

-- 2. Fast single-query administrative registration and sales analytics
create or replace function public.get_admin_registration_analytics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  result jsonb;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' and not public.is_admin() then
    raise exception 'Administrator access is required.';
  end if;

  select jsonb_build_object(
    'total_paid_orders', coalesce((select count(*) from public.payment_orders where status = 'paid'), 0),
    'unique_paid_students', coalesce((select count(distinct user_id) from public.payment_orders where status = 'paid'), 0),
    'gross_revenue_paise', coalesce((select sum(amount_paise) from public.payment_orders where status = 'paid'), 0),
    'active_access_count', coalesce((select count(distinct user_id) from public.student_entitlements where expires_at > now()), 0),
    'series_stats', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'product_id', p.id,
          'payments', count(o.id),
          'buyers', count(distinct o.user_id),
          'revenue_paise', coalesce(sum(o.amount_paise), 0),
          'active_students', (
            select count(distinct e.user_id)
            from public.student_entitlements e
            where e.product_id = p.id and e.expires_at > now()
          )
        )
      )
      from public.access_products p
      left join public.payment_orders o on o.product_id = p.id and o.status = 'paid'
      group by p.id
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.get_admin_registration_analytics() from public, anon;
grant execute on function public.get_admin_registration_analytics() to authenticated, service_role;
