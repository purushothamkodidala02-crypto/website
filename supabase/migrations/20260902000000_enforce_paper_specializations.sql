-- Enforce that if an exam group has active specializations, 
-- any new paper created under it MUST select a specialization.

create or replace function public.validate_paper_specialization_requirement()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  specialization_count integer;
begin
  -- Check if the exam group has any specializations defined
  select count(*) into specialization_count
  from public.exam_specializations
  where exam_group_id = new.exam_group_id
  and is_active = true;

  -- If the exam has specializations, but this paper doesn't specify one, reject it
  if specialization_count > 0 and new.specialization_id is null then
    raise exception 'This exam has specializations configured. You must select a specialization for this paper.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_paper_specialization_requirement_trigger on public.papers;
create trigger validate_paper_specialization_requirement_trigger
before insert or update of exam_group_id, specialization_id, is_active
on public.papers
for each row 
when (new.is_active = true)
execute function public.validate_paper_specialization_requirement();
