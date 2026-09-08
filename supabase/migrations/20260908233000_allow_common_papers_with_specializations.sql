-- Allow exams with specializations to have common / direct papers (e.g. Paper 1 General Studies & General Abilities for AEE).
-- Drop the trigger and validation function that previously prevented specialization_id from being null.

drop trigger if exists validate_paper_specialization_requirement_trigger on public.papers;
drop function if exists public.validate_paper_specialization_requirement();
