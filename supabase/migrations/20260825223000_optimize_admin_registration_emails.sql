create or replace function public.get_admin_user_emails(requested_user_ids uuid[])
returns table (user_id uuid, email text)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Administrator access is required.';
  end if;
  if coalesce(array_length(requested_user_ids, 1), 0) > 200 then
    raise exception 'Too many users requested.';
  end if;
  return query
  select account.id, account.email::text
  from auth.users account
  where account.id = any(coalesce(requested_user_ids, array[]::uuid[]));
end;
$$;

revoke all on function public.get_admin_user_emails(uuid[]) from public;
grant execute on function public.get_admin_user_emails(uuid[]) to authenticated;

