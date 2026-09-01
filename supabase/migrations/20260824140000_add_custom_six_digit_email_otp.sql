-- Varadhi's branded six-digit email login codes. The raw code is never stored.
create table public.email_login_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  code_hash text not null,
  requester_ip_hash text not null,
  attempts integer not null default 0 check (attempts >= 0 and attempts <= 5),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);

create index email_login_challenges_user_created_idx on public.email_login_challenges(user_id, created_at desc);
create index email_login_challenges_ip_created_idx on public.email_login_challenges(requester_ip_hash, created_at desc);
alter table public.email_login_challenges enable row level security;

create or replace function public.find_auth_user_id_by_email(requested_email text)
returns uuid
language sql stable security definer set search_path = public, auth
as $$
  select id from auth.users where lower(email) = lower(trim(requested_email)) limit 1;
$$;

create or replace function public.issue_custom_email_login_challenge(
  requested_user_id uuid,
  requested_email text,
  requested_code_hash text,
  requested_ip_hash text
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare new_id uuid;
begin
  if requested_user_id is null or requested_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Invalid login request.';
  end if;
  if exists (select 1 from public.email_login_challenges where user_id = requested_user_id and created_at > now() - interval '60 seconds') then
    raise exception 'Please wait one minute before requesting another code.';
  end if;
  if (select count(*) from public.email_login_challenges where user_id = requested_user_id and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many codes requested. Please try again later.';
  end if;
  if (select count(*) from public.email_login_challenges where requester_ip_hash = requested_ip_hash and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'Too many code requests from this connection. Please try again later.';
  end if;
  update public.email_login_challenges set consumed_at = now()
  where user_id = requested_user_id and consumed_at is null;
  insert into public.email_login_challenges (user_id, email, code_hash, requester_ip_hash, expires_at)
  values (requested_user_id, lower(trim(requested_email)), requested_code_hash, requested_ip_hash, now() + interval '10 minutes')
  returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.consume_custom_email_login_challenge(
  requested_email text,
  requested_code_hash text
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare challenge public.email_login_challenges%rowtype;
begin
  select * into challenge from public.email_login_challenges
  where email = lower(trim(requested_email)) and consumed_at is null
  order by created_at desc limit 1 for update;
  if challenge.id is null then raise exception 'Code is invalid or expired.'; end if;
  if challenge.expires_at <= now() then
    update public.email_login_challenges set consumed_at = now() where id = challenge.id;
    raise exception 'Code is invalid or expired.';
  end if;
  if challenge.attempts >= 5 then
    update public.email_login_challenges set consumed_at = now() where id = challenge.id;
    raise exception 'Too many incorrect attempts. Request a new code.';
  end if;
  if challenge.code_hash <> requested_code_hash then
    update public.email_login_challenges set attempts = attempts + 1 where id = challenge.id;
    raise exception 'Code is invalid or expired.';
  end if;
  update public.email_login_challenges set consumed_at = now() where id = challenge.id;
  return challenge.user_id;
end;
$$;

revoke all on table public.email_login_challenges from public;
revoke all on function public.find_auth_user_id_by_email(text) from public;
revoke all on function public.issue_custom_email_login_challenge(uuid, text, text, text) from public;
revoke all on function public.consume_custom_email_login_challenge(text, text) from public;
grant execute on function public.find_auth_user_id_by_email(text) to service_role;
grant execute on function public.issue_custom_email_login_challenge(uuid, text, text, text) to service_role;
grant execute on function public.consume_custom_email_login_challenge(text, text) to service_role;

notify pgrst, 'reload schema';
