-- Switch can_access_mock_test to SECURITY INVOKER to satisfy Supabase security linter
create or replace function public.can_access_mock_test(requested_mock_test_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.mock_tests mock_test
    join public.papers paper on paper.id = mock_test.paper_id
    where mock_test.id = requested_mock_test_id
      and mock_test.status = 'published'
      and (
        mock_test.access_type = 'free'
        or exists (
          select 1 from public.mock_test_entitlements legacy
          where legacy.mock_test_id = mock_test.id and legacy.user_id = auth.uid()
        )
        or exists (
          select 1
          from public.student_entitlements entitlement
          join public.access_product_exam_groups product_exam
            on product_exam.product_id = entitlement.product_id
          where entitlement.user_id = auth.uid()
            and entitlement.starts_at <= now()
            and entitlement.expires_at > now()
            and product_exam.exam_group_id = paper.exam_group_id
        )
      )
  );
$$;

revoke all on function public.can_access_mock_test(uuid) from public, anon;
grant execute on function public.can_access_mock_test(uuid) to authenticated, service_role;
