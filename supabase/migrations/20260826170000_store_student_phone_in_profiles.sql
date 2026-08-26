-- Keep the mobile number collected during email registration in the student profile.
-- Email/password accounts intentionally do not use Supabase's SMS-auth phone field.
alter table public.profiles
  add column if not exists phone text;

alter table public.profiles
  drop constraint if exists profiles_phone_format;

alter table public.profiles
  add constraint profiles_phone_format
  check (phone is null or phone ~ '^[6-9][0-9]{9}$') not valid;

update public.profiles as profile
set phone = auth_user.raw_user_meta_data ->> 'phone'
from auth.users as auth_user
where profile.id = auth_user.id
  and profile.phone is null
  and (auth_user.raw_user_meta_data ->> 'phone') ~ '^[6-9][0-9]{9}$';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    phone,
    role
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when (new.raw_user_meta_data ->> 'phone') ~ '^[6-9][0-9]{9}$'
        then new.raw_user_meta_data ->> 'phone'
      else null
    end,
    'student'
  );

  return new;
end;
$$;

notify pgrst, 'reload schema';
