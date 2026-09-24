-- Migration: Delete all 8 mock tests under Police Constable / Telangana History & Movement,
-- all student written attempts, answers, and marks, and the subject itself.

set session_replication_role = 'replica';

-- 1. Temporarily drop self-referential FK constraints to permit clean batch deletion
alter table public.mock_tests
  drop constraint if exists mock_tests_superseded_by_mock_test_id_fkey,
  drop constraint if exists mock_tests_replaces_mock_test_id_fkey;

do $$
declare
  target_subject_ids uuid[];
  target_mock_test_ids uuid[];
begin
  -- Identify target subject(s)
  select coalesce(array_agg(id), array[]::uuid[]) into target_subject_ids
  from public.subjects
  where id = '33ea640e-49cd-4cf2-903f-e46d02a1b7f2'
     or name ilike '%Telangana%Movement%';

  -- Identify all mock tests under this subject or matching TG Police Constable Movement
  select coalesce(array_agg(id), array[]::uuid[]) into target_mock_test_ids
  from public.mock_tests
  where (cardinality(target_subject_ids) > 0 and subject_id = any(target_subject_ids))
     or title ilike '%Police%Telangana%Movement%';

  raise notice 'Target subject count: %', cardinality(target_subject_ids);
  raise notice 'Target mock test count: %', cardinality(target_mock_test_ids);

  if cardinality(target_mock_test_ids) > 0 then
    -- 1. Delete student attempt responses
    delete from public.attempt_responses
    where attempt_id in (
      select id from public.test_attempts
      where mock_test_id = any(target_mock_test_ids)
    );

    -- 2. Delete student test attempts (scores, percentages, answers)
    delete from public.test_attempts
    where mock_test_id = any(target_mock_test_ids);

    -- 3. Delete session answers and session questions
    delete from public.test_attempt_session_answers
    where session_id in (
      select id from public.test_attempt_sessions
      where mock_test_id = any(target_mock_test_ids)
    );

    delete from public.test_attempt_session_questions
    where session_id in (
      select id from public.test_attempt_sessions
      where mock_test_id = any(target_mock_test_ids)
    );

    -- 4. Delete student test attempt sessions
    delete from public.test_attempt_sessions
    where mock_test_id = any(target_mock_test_ids);

    -- 5. Delete notifications and entitlements
    delete from public.mock_test_notifications
    where mock_test_id = any(target_mock_test_ids);

    delete from public.mock_test_entitlements
    where mock_test_id = any(target_mock_test_ids);

    -- 6. Delete public slug aliases
    delete from public.public_slug_aliases
    where entity_type = 'mock_test'
      and entity_id = any(target_mock_test_ids);

    -- 7. Delete question assignments
    delete from public.mock_test_questions
    where mock_test_id = any(target_mock_test_ids);

    -- 8. Delete the mock tests directly (no updates, no index checks)
    delete from public.mock_tests
    where id = any(target_mock_test_ids);
  end if;

  if cardinality(target_subject_ids) > 0 then
    -- Delete subject slug aliases
    delete from public.public_slug_aliases
    where entity_type = 'subject'
      and entity_id = any(target_subject_ids);

    -- Delete subject sections
    delete from public.subject_sections
    where subject_id = any(target_subject_ids);

    -- Delete the subject
    delete from public.subjects
    where id = any(target_subject_ids);
  end if;

end $$;

-- 2. Restore self-referential FK constraints
alter table public.mock_tests
  add constraint mock_tests_superseded_by_mock_test_id_fkey
  foreign key (superseded_by_mock_test_id)
  references public.mock_tests(id)
  on delete restrict
  deferrable initially deferred;

alter table public.mock_tests
  add constraint mock_tests_replaces_mock_test_id_fkey
  foreign key (replaces_mock_test_id)
  references public.mock_tests(id)
  on delete restrict;

set session_replication_role = 'origin';
