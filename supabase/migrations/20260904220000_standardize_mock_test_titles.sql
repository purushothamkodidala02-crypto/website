-- Migration: Standardize all mock test titles to canonical format
-- Format: [StateCode] [ExamName] · [PaperName/Specialization] [· SubjectName] · Mock Test [XX]
-- Example: TG Executive Officer (EO) · Paper 2 · Mock Test 01

update public.mock_tests mt
set title = es.code || ' ' || eg.name || ' · ' || coalesce(esp.name, p.name) ||
  case when s.name is not null then ' · ' || s.name else '' end ||
  ' · Mock Test ' || lpad(greatest(1, coalesce(mt.series_number, 1))::text, 2, '0')
from public.papers p
join public.exam_groups eg on p.exam_group_id = eg.id
join public.exams e on eg.exam_id = e.id
join public.exam_states es on e.state_id = es.id
left join public.exam_specializations esp on p.specialization_id = esp.id
left join public.subjects s on mt.subject_id = s.id
where mt.paper_id = p.id;
