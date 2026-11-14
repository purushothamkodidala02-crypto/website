-- Alias 'endowment-officer' to AP Endowment Officer ('appsc-endowment-officer-mock-test')
-- so both slugs work seamlessly and redirect to the canonical path.

insert into public.public_slug_aliases (entity_type, entity_id, parent_id, slug)
values (
  'exam',
  'bf9fff17-effc-4c6e-86c7-cb8effe65178',
  '21f8fa56-b87f-4209-8af7-1545e39c892b',
  'endowment-officer'
)
on conflict do nothing;
