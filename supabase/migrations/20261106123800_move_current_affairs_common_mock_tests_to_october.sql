-- Migration: Move Current Affairs common mock tests under October section
-- Subject: AP Endowment Officer · General Studies & General Abilities · Current Affairs
-- Subject ID: b675525c-5185-40e8-9df5-a869a113c7bb
-- Paper ID: 7c9ee5a1-0d79-422f-8cd1-13ae921d9b53

begin;

-- 1. Create October sub-section under Current Affairs
insert into public.subject_sections (
  id,
  subject_id,
  name,
  slug,
  display_order,
  is_active,
  created_at,
  updated_at
) values (
  '76b32ea7-4ce8-48b2-b13c-cf313e2dfb31',
  'b675525c-5185-40e8-9df5-a869a113c7bb',
  'October',
  'october',
  1,
  true,
  now(),
  now()
) on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  display_order = excluded.display_order,
  is_active = excluded.is_active,
  updated_at = now();

-- 2. Move Common Mock Test 01 to October section
update public.mock_tests
set
  subject_section_id = '76b32ea7-4ce8-48b2-b13c-cf313e2dfb31',
  title = 'AP Endowment Officer · General Studies & General Abilities · Current Affairs (October) · Mock Test 01',
  slug = 'current-affairs-october-mock-test-01',
  updated_at = now()
where id = '4f63a38e-1535-4640-ad10-6b87ae3938f4';

-- 3. Move Common Mock Test 02 to October section
update public.mock_tests
set
  subject_section_id = '76b32ea7-4ce8-48b2-b13c-cf313e2dfb31',
  title = 'AP Endowment Officer · General Studies & General Abilities · Current Affairs (October) · Mock Test 02',
  slug = 'current-affairs-october-mock-test-02',
  updated_at = now()
where id = 'a322692e-d0e2-48b0-bdb9-7fc3a1ad4ed1';

-- 4. Preserve old slugs in public_slug_aliases for backwards compatibility and permanent 301 redirects
insert into public.public_slug_aliases (
  id,
  entity_type,
  entity_id,
  parent_id,
  slug,
  created_at
) values
  (gen_random_uuid(), 'mock_test', '4f63a38e-1535-4640-ad10-6b87ae3938f4', '7c9ee5a1-0d79-422f-8cd1-13ae921d9b53', 'current-affairs-mock-test-01', now()),
  (gen_random_uuid(), 'mock_test', 'a322692e-d0e2-48b0-bdb9-7fc3a1ad4ed1', '7c9ee5a1-0d79-422f-8cd1-13ae921d9b53', 'current-affairs-mock-test-02', now())
on conflict (entity_type, coalesce(parent_id, '00000000-0000-0000-0000-000000000000'::uuid), slug) do update
set entity_id = excluded.entity_id;

commit;
