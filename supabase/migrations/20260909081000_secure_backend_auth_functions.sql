-- Restrict internal authentication and payment functions to backend service_role only
revoke all on function public.consume_custom_email_login_challenge(text, text) from public, anon, authenticated;
grant execute on function public.consume_custom_email_login_challenge(text, text) to service_role;

revoke all on function public.issue_custom_email_login_challenge(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.issue_custom_email_login_challenge(uuid, text, text, text) to service_role;

revoke all on function public.find_auth_user_id_by_email(text) from public, anon, authenticated;
grant execute on function public.find_auth_user_id_by_email(text) to service_role;

revoke all on function public.grant_payment_entitlement(uuid) from public, anon, authenticated;
grant execute on function public.grant_payment_entitlement(uuid) to service_role;
