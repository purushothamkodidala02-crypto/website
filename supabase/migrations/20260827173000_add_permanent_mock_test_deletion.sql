-- Allow an administrator to deliberately erase one mock test and all of its
-- attempt history. This is intentionally separate from ordinary draft delete.
create or replace function public.permanently_delete_mock_test(
  requested_mock_test_id uuid,
  requested_confirmation text
)
returns table (deleted_attempts bigint, deleted_sessions bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_test public.mock_tests%rowtype;
  attempt_count bigint;
  session_count bigint;
begin
  if not public.is_admin() then
    raise exception 'Administrator MFA verification is required.';
  end if;
  if requested_confirmation is distinct from 'DELETE' then
    raise exception 'Type DELETE to confirm permanent deletion.';
  end if;

  select * into target_test
  from public.mock_tests
  where id = requested_mock_test_id
  for update;

  if target_test.id is null then raise exception 'Mock Test not found.'; end if;
  if target_test.status = 'published' then
    raise exception 'Hide the Mock Test before deleting it permanently.';
  end if;

  select count(*) into attempt_count from public.test_attempts
  where mock_test_id = requested_mock_test_id;
  select count(*) into session_count from public.test_attempt_sessions
  where mock_test_id = requested_mock_test_id;

  -- Temporarily exclude the selected row from current-version uniqueness,
  -- then safely detach either side of a corrected-version relationship.
  update public.mock_tests
  set superseded_by_mock_test_id = requested_mock_test_id
  where id = requested_mock_test_id;
  update public.mock_tests
  set replaces_mock_test_id = null
  where replaces_mock_test_id = requested_mock_test_id;
  update public.mock_tests
  set superseded_by_mock_test_id = null
  where superseded_by_mock_test_id = requested_mock_test_id
    and id <> requested_mock_test_id;

  -- These children hold the student's timed snapshot and submitted result.
  -- Their own response rows are removed by existing cascade constraints.
  delete from public.test_attempts where mock_test_id = requested_mock_test_id;
  delete from public.test_attempt_sessions where mock_test_id = requested_mock_test_id;

  -- Slug aliases for a removed entity must never resolve to a missing record.
  delete from public.public_slug_aliases
  where entity_type = 'mock_test' and entity_id = requested_mock_test_id;

  -- The assignment guard permits cascade removal only for a draft with no
  -- attempts. Question-bank records themselves are deliberately retained.
  update public.mock_tests set status = 'draft', published_at = null
  where id = requested_mock_test_id;
  delete from public.mock_tests where id = requested_mock_test_id;

  return query select attempt_count, session_count;
end;
$$;

revoke all on function public.permanently_delete_mock_test(uuid, text) from public;
grant execute on function public.permanently_delete_mock_test(uuid, text) to authenticated;
notify pgrst, 'reload schema';
