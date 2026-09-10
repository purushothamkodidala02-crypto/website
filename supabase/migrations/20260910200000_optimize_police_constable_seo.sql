-- Optimize SEO title, description, and voice-search FAQs for Telangana Police Constable Mock Test Series 2026

update public.exam_groups as exam_group
set
  seo_title = 'Telangana Police Constable Mock Test Series 2026 | Free',
  seo_description = 'Practice the latest Telangana Police Constable Mock Test 2026 for free. Get bilingual questions, detailed solutions, and instant performance analytics. Start now!'
from public.exams as category
join public.exam_states as state on state.id = category.state_id
where exam_group.exam_id = category.id
  and state.slug = 'telangana'
  and exam_group.slug = 'police-constable';

-- Add or update official voice search FAQs for Telangana Police Constable
do $$
declare
  target_exam_id uuid;
begin
  select exam_group.id into target_exam_id
  from public.exam_groups as exam_group
  join public.exams as category on category.id = exam_group.exam_id
  join public.exam_states as state on state.id = category.state_id
  where state.slug = 'telangana' and exam_group.slug = 'police-constable'
  limit 1;

  if target_exam_id is not null then
    -- Delete existing auto FAQs to avoid duplicates and replace with authoritative voice-search FAQs
    delete from public.exam_page_faqs where exam_group_id = target_exam_id;

    insert into public.exam_page_faqs (exam_group_id, question, answer, display_order)
    values
      (
        target_exam_id,
        'How to prepare for TG Police Constable?',
        'Start by mastering the official TGPRB syllabus across Arithmetic, Reasoning, General Studies, and Telangana Movement. Follow a three-step routine: complete foundational subject revision, practice Previous Year Papers to recognize question trends, and take full-length timed mock tests on Varadhi Prep to build 3-hour exam endurance.',
        0
      ),
      (
        target_exam_id,
        'What is the exam pattern for Telangana Police Constable Prelims and Mains?',
        'Both the Preliminary Written Test (PWT) and Final Written Examination (FWE) consist of 200 objective multiple-choice questions for 200 marks with a duration of 3 hours (180 minutes). The Prelims is qualifying in nature, whereas your score in the Mains exam determines your final selection merit.',
        1
      ),
      (
        target_exam_id,
        'Is there negative marking in the Telangana Police Constable exam?',
        'Official TGPRB notifications specify the exact marking scheme for each recruitment cycle. In standard patterns, correct answers receive 1 mark. Any applicable negative marking rule is mirrored precisely in Varadhi Prep mock tests so you practice under authentic exam conditions.',
        2
      ),
      (
        target_exam_id,
        'Can I attempt mock tests in Telugu and English?',
        'Yes! All Telangana Police Constable mock tests on Varadhi Prep are bilingual in Telugu and English. You can view questions and answers side-by-side or switch languages at any moment during the test.',
        3
      ),
      (
        target_exam_id,
        'How do Previous Year Papers help in cracking the Police Constable exam?',
        'Previous Year Papers reveal exact question difficulty, recurring themes (especially in Telangana Movement and Indian Polity), and help you gauge your pace. Practicing PYPs on Varadhi Prep gives you instant scorecards and detailed explanatory solutions for every question.',
        4
      ),
      (
        target_exam_id,
        'Does Varadhi Prep provide instant performance analytics and rank prediction?',
        'Yes. Immediately after submitting a mock test, you receive your total score, accuracy percentage, time spent per question, topic-wise strength and weakness analysis, and simulated rank among fellow aspirants.',
        5
      );
  end if;
end $$;
