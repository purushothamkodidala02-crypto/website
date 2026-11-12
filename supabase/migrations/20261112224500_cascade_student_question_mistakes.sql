-- Migration: Change foreign key constraint on student_question_mistakes(question_id)
-- from ON DELETE RESTRICT to ON DELETE CASCADE.
--
-- Problem: When updating or replacing questions in a mock test (or deleting draft questions),
-- if a question was previously answered incorrectly during a test attempt, its entry in
-- student_question_mistakes blocks question replacement or deletion with:
--   update or delete on table "questions" violates foreign key constraint
--   "student_question_mistakes_question_id_fkey" on table "student_question_mistakes"
--
-- Fix: student_question_mistakes should cascade on question deletion, identical to
-- student_question_bookmarks.

alter table public.student_question_mistakes
  drop constraint if exists student_question_mistakes_question_id_fkey,
  add constraint student_question_mistakes_question_id_fkey
    foreign key (question_id)
    references public.questions(id)
    on delete cascade;
