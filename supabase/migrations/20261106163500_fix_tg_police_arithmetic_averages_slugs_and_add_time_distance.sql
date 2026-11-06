-- Migration: Fix TG Police Constable Arithmetic Averages slugs and add Time and Distance topic
-- Paper: TG Police Constable · Preliminary Written Test (PWT) (b6b70de9-cbf1-4c92-84f6-b2a6f47389d2)
-- Subject: Arithmetic (1cb99b77-00a7-4998-ae71-d15f557279fc)
-- Sub-section Averages ID: 3b1b19dd-7310-442c-8a3f-25e41151519a

begin;

-- 1. Create 'Time and Distance' topic / sub-section under Arithmetic
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
  'a7e84f50-3bf2-4114-8f24-6997b1df250a',
  '1cb99b77-00a7-4998-ae71-d15f557279fc',
  'Time and Distance',
  'time-and-distance',
  2,
  true,
  now(),
  now()
) on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  display_order = excluded.display_order,
  is_active = excluded.is_active,
  updated_at = now();

-- 2. Update Mock Test 01 for Arithmetic (Averages) to include section in title and slug
update public.mock_tests
set
  title = 'TG Police Constable · Preliminary Written Test (PWT) · Arithmetic (Averages) · Mock Test 01',
  slug = 'arithmetic-averages-mock-test-01',
  updated_at = now()
where id = 'd49ab6d4-dc27-4f27-ab00-f772e83b237a';

-- 3. Update Mock Test 02 for Arithmetic (Averages) to include section in title and slug
update public.mock_tests
set
  title = 'TG Police Constable · Preliminary Written Test (PWT) · Arithmetic (Averages) · Mock Test 02',
  slug = 'arithmetic-averages-mock-test-02',
  updated_at = now()
where id = '9203fc48-46b3-4d40-ae40-18abcf2cfa23';

-- 4. Preserve old slugs in public_slug_aliases for backwards compatibility and permanent 308 redirects
insert into public.public_slug_aliases (
  id,
  entity_type,
  entity_id,
  parent_id,
  slug,
  created_at
) values
  (gen_random_uuid(), 'mock_test', 'd49ab6d4-dc27-4f27-ab00-f772e83b237a', 'b6b70de9-cbf1-4c92-84f6-b2a6f47389d2', 'arithmetic-mock-test-01', now()),
  (gen_random_uuid(), 'mock_test', '9203fc48-46b3-4d40-ae40-18abcf2cfa23', 'b6b70de9-cbf1-4c92-84f6-b2a6f47389d2', 'arithmetic-mock-test-02', now())
on conflict (entity_type, coalesce(parent_id, '00000000-0000-0000-0000-000000000000'::uuid), slug) do update
set entity_id = excluded.entity_id;

commit;
