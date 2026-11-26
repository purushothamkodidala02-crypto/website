-- Sync all mock_tests.title values to match the canonical buildMockTestTitle format
-- so renamed subjects, sub-sections, papers, specializations, exams, or states
-- never leave stale titles in mock_tests.

with canonical as (
  select
    mt.id,
    concat(
      es.code,
      ' ',
      eg.name,
      ' · ',
      coalesce(esp.name, p.name),
      case
        when s.id is not null and ss.id is not null then concat(' · ', s.name, ' (', ss.name, ')')
        when s.id is not null then concat(' · ', s.name)
        else ''
      end,
      ' · Mock Test ',
      lpad(greatest(1, coalesce(mt.series_number, 1))::text, 2, '0')
    ) as canonical_title
  from public.mock_tests as mt
  join public.papers as p on p.id = mt.paper_id
  join public.exam_groups as eg on eg.id = p.exam_group_id
  join public.exams as e on e.id = eg.exam_id
  join public.exam_states as es on es.id = e.state_id
  left join public.exam_specializations as esp on esp.id = p.specialization_id
  left join public.subjects as s on s.id = mt.subject_id
  left join public.subject_sections as ss on ss.id = mt.subject_section_id
)
update public.mock_tests as mt
set title = c.canonical_title
from canonical as c
where mt.id = c.id
  and mt.title is distinct from c.canonical_title;
