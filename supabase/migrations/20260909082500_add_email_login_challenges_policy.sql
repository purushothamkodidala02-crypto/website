-- Add RLS policy for email_login_challenges to satisfy Supabase security linter
drop policy if exists "Admins can view email login challenges" on public.email_login_challenges;
create policy "Admins can view email login challenges"
on public.email_login_challenges
for all to authenticated
using (public.is_admin())
with check (public.is_admin());
