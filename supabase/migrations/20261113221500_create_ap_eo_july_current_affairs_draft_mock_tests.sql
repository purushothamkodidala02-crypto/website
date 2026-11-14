-- Migration: Create July Current Affairs sub-section and 4 draft mock tests
-- Exam: AP Endowment Officer (APPSC)
-- Paper: General Studies & General Abilities (7c9ee5a1-0d79-422f-8cd1-13ae921d9b53)
-- Subject: Current Affairs (b675525c-5185-40e8-9df5-a869a113c7bb)
-- Sub-section: July (87a21644-329b-4e17-b73f-c1f9380962b7)

BEGIN;

-- 1. Ensure July sub-section exists under Current Affairs
INSERT INTO public.subject_sections (
  id,
  subject_id,
  name,
  slug,
  display_order,
  is_active,
  created_at,
  updated_at
) VALUES (
  '588e14bd-6098-445c-82dd-77a3bf563cdb',
  'b675525c-5185-40e8-9df5-a869a113c7bb',
  'July',
  'july',
  4,
  true,
  now(),
  now()
) ON CONFLICT (subject_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- 2. Create 4 Draft Mock Tests for July Current Affairs
INSERT INTO public.mock_tests (
  id,
  paper_id,
  subject_id,
  subject_section_id,
  title,
  slug,
  description,
  instructions,
  duration_minutes,
  difficulty,
  status,
  version,
  display_order,
  published_at,
  access_type,
  price_inr,
  test_scope,
  series_number,
  seo_title,
  seo_description,
  target_question_count,
  created_at,
  updated_at
) VALUES
  (
    '25794632-fc09-4404-8af0-59b3b12b7418',
    '7c9ee5a1-0d79-422f-8cd1-13ae921d9b53',
    'b675525c-5185-40e8-9df5-a869a113c7bb',
    '588e14bd-6098-445c-82dd-77a3bf563cdb',
    'AP Endowment Officer · General Studies & General Abilities · Current Affairs (July) · Mock Test 01',
    'current-affairs-july-mock-test-01',
    'Practice July 2026 current affairs with 25 bilingual questions covering key Andhra Pradesh, national, and international events for APPSC Endowment Officer Paper 1.',
    null,
    25,
    'mixed',
    'draft',
    1,
    1,
    null,
    'free',
    null,
    'subject',
    1,
    null,
    null,
    25,
    now(),
    now()
  ),
  (
    '7a5d31af-9aa1-46c8-8590-a7530a3f6899',
    '7c9ee5a1-0d79-422f-8cd1-13ae921d9b53',
    'b675525c-5185-40e8-9df5-a869a113c7bb',
    '588e14bd-6098-445c-82dd-77a3bf563cdb',
    'AP Endowment Officer · General Studies & General Abilities · Current Affairs (July) · Mock Test 02',
    'current-affairs-july-mock-test-02',
    'Practice July 2026 current affairs with 25 bilingual questions covering key Andhra Pradesh, national, and international events for APPSC Endowment Officer Paper 1.',
    null,
    25,
    'mixed',
    'draft',
    1,
    2,
    null,
    'free',
    null,
    'subject',
    2,
    null,
    null,
    25,
    now(),
    now()
  ),
  (
    '08ce5a49-ca02-4f2a-ba90-9b4bce955e50',
    '7c9ee5a1-0d79-422f-8cd1-13ae921d9b53',
    'b675525c-5185-40e8-9df5-a869a113c7bb',
    '588e14bd-6098-445c-82dd-77a3bf563cdb',
    'AP Endowment Officer · General Studies & General Abilities · Current Affairs (July) · Mock Test 03',
    'current-affairs-july-mock-test-03',
    'Practice July 2026 current affairs with 25 bilingual questions covering key Andhra Pradesh, national, and international events for APPSC Endowment Officer Paper 1.',
    null,
    25,
    'mixed',
    'draft',
    1,
    3,
    null,
    'free',
    null,
    'subject',
    3,
    null,
    null,
    25,
    now(),
    now()
  ),
  (
    'f7e8cbee-f5e5-4724-83af-1f775d9b75f2',
    '7c9ee5a1-0d79-422f-8cd1-13ae921d9b53',
    'b675525c-5185-40e8-9df5-a869a113c7bb',
    '588e14bd-6098-445c-82dd-77a3bf563cdb',
    'AP Endowment Officer · General Studies & General Abilities · Current Affairs (July) · Mock Test 04',
    'current-affairs-july-mock-test-04',
    'Practice July 2026 current affairs with 25 bilingual questions covering key Andhra Pradesh, national, and international events for APPSC Endowment Officer Paper 1.',
    null,
    25,
    'mixed',
    'draft',
    1,
    4,
    null,
    'free',
    null,
    'subject',
    4,
    null,
    null,
    25,
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

COMMIT;
