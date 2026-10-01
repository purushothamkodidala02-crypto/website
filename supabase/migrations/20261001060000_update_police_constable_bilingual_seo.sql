-- Update Police Constable catalog SEO metadata with bilingual high-intent search terms (TGPRB/TSLPRB & Telugu script)
update public.exam_groups as exam_group
set
  seo_title = 'TG Police Constable Free Mock Test 2026 (TGPRB/TSLPRB) | తెలంగాణ పోలీస్ కానిస్టేబుల్ మాక్ టెస్ట్',
  seo_description = 'Free TG Police Constable mock test 2026 (TGPRB/TSLPRB) in Telugu & English. తెలంగాణ పోలీస్ కానిస్టేబుల్ ఆన్‌లైన్ ప్రాక్టీస్ పేపర్స్ with solutions.'
from public.exams as category
join public.exam_states as state on state.id = category.state_id
where exam_group.exam_id = category.id
  and state.slug in ('telangana', 'tg')
  and exam_group.slug = 'police-constable';
