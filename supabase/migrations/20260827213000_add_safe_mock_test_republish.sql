-- Republish an unchanged hidden Mock Test without unlocking its Questions.
create or replace function public.republish_archived_mock_test_safely(requested_mock_test_id uuid)
returns table (question_count bigint, total_marks numeric)
language plpgsql security definer set search_path = public
as $$
declare target_test record;
begin
  if not public.is_admin() then raise exception 'Administrator MFA verification is required.'; end if;
  select id, status, superseded_by_mock_test_id into target_test
  from public.mock_tests where id = requested_mock_test_id for update;
  if target_test.id is null then raise exception 'Mock Test not found.'; end if;
  if target_test.status <> 'archived' then raise exception 'Only hidden Mock Tests can be published again.'; end if;
  if target_test.superseded_by_mock_test_id is not null and exists (
    select 1 from public.mock_tests where id = target_test.superseded_by_mock_test_id and status = 'published'
  ) then raise exception 'The corrected version of this Mock Test is already published.'; end if;

  update public.mock_tests set status = 'draft', published_at = null where id = requested_mock_test_id;
  return query select published.question_count, published.total_marks
  from public.publish_mock_test_safely(requested_mock_test_id) as published;
end;
$$;

revoke all on function public.republish_archived_mock_test_safely(uuid) from public;
grant execute on function public.republish_archived_mock_test_safely(uuid) to authenticated;
notify pgrst, 'reload schema';
