-- Return catalogue location with every study-book question so students can filter revision.
drop function if exists public.get_student_study_book(text);

create function public.get_student_study_book(requested_kind text)
returns table (
  question_id uuid, exam_name text, paper_name text, subject_name text,
  question_text text, option_a text, option_b text, option_c text, option_d text,
  correct_answer text, explanation text, image_url text, content_language_mode text,
  question_text_te text, option_a_te text, option_b_te text, option_c_te text,
  option_d_te text, explanation_te text, mistake_count integer,
  last_selected_answer text, last_seen_at timestamptz, bookmarked boolean
)
language sql security definer set search_path = public
as $$
  select question.id, exam_group.name, paper.name, subject.name, question.question_text,
    question.option_a, question.option_b, question.option_c, question.option_d,
    question.correct_answer, question.explanation, question.image_url,
    subject.content_language_mode, question.question_text_te,
    question.option_a_te, question.option_b_te, question.option_c_te,
    question.option_d_te, question.explanation_te,
    coalesce(mistake.mistake_count, 0), mistake.last_selected_answer,
    coalesce(mistake.last_seen_at, bookmark.created_at), bookmark.question_id is not null
  from public.questions question
  join public.subjects subject on subject.id = question.subject_id
  join public.papers paper on paper.id = subject.paper_id
  join public.exam_groups exam_group on exam_group.id = paper.exam_group_id
  left join public.student_question_mistakes mistake on mistake.question_id = question.id and mistake.user_id = auth.uid()
  left join public.student_question_bookmarks bookmark on bookmark.question_id = question.id and bookmark.user_id = auth.uid()
  where auth.uid() is not null and (
    (requested_kind = 'mistakes' and mistake.question_id is not null and mistake.mastered_at is null)
    or (requested_kind = 'bookmarks' and bookmark.question_id is not null)
  )
  order by coalesce(mistake.last_seen_at, bookmark.created_at) desc;
$$;

revoke all on function public.get_student_study_book(text) from public;
grant execute on function public.get_student_study_book(text) to authenticated;
