-- Revoke anon and public execution from all SECURITY DEFINER functions in public schema
do $$ 
declare 
    func record;
begin 
    for func in (
        select 
            p.proname,
            pg_get_function_identity_arguments(p.oid) as args
        from pg_proc p
        join pg_namespace n on p.pronamespace = n.oid
        where n.nspname = 'public'
          and p.prosecdef = true
          and has_function_privilege('anon', p.oid, 'EXECUTE')
    ) loop 
        execute format('revoke all on function public.%I(%s) from public;', func.proname, func.args);
        execute format('revoke all on function public.%I(%s) from anon;', func.proname, func.args);
        execute format('grant execute on function public.%I(%s) to authenticated, service_role;', func.proname, func.args);
    end loop; 
end $$;

-- Specifically restrict internal cleanup function to service_role only
revoke all on function public.cleanup_attempt_history_retention() from public, anon, authenticated;
grant execute on function public.cleanup_attempt_history_retention() to service_role;
