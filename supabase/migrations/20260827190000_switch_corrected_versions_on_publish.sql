-- Keep the existing published version available while its correction is edited.
-- Publishing the corrected draft archives the previous version in the same
-- database transaction, so students never see a gap or two live versions.
create or replace function public.keep_published_mock_test_live_during_correction()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.status = 'published'
     and new.status = 'archived'
     and old.superseded_by_mock_test_id is null
     and new.superseded_by_mock_test_id is not null then
    new.status := 'published';
    new.published_at := old.published_at;
  end if;
  return new;
end;
$$;

drop trigger if exists keep_published_mock_test_live_during_correction on public.mock_tests;
create trigger keep_published_mock_test_live_during_correction
before update of status, superseded_by_mock_test_id on public.mock_tests
for each row execute function public.keep_published_mock_test_live_during_correction();

create or replace function public.switch_corrected_mock_test_on_publish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published'
     and old.status is distinct from 'published'
     and new.replaces_mock_test_id is not null then
    update public.mock_tests
    set status = 'archived', updated_at = now()
    where id = new.replaces_mock_test_id;
  end if;
  return new;
end;
$$;

drop trigger if exists switch_corrected_mock_test_on_publish on public.mock_tests;
create trigger switch_corrected_mock_test_on_publish
before update of status on public.mock_tests
for each row execute function public.switch_corrected_mock_test_on_publish();

-- Restore any live source that was hidden while a corrected draft was created
-- between the initial revision release and this zero-downtime switch release.
update public.mock_tests as previous
set status = 'published', updated_at = now()
from public.mock_tests as correction
where previous.superseded_by_mock_test_id = correction.id
  and previous.status = 'archived'
  and previous.published_at is not null
  and correction.status = 'draft';

notify pgrst, 'reload schema';
