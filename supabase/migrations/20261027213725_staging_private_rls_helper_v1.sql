begin;
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
create or replace function private.is_current_user_admin()
returns boolean language sql stable security definer set search_path = ''
as $function$
 select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin');
$function$;
revoke all on function private.is_current_user_admin() from public, anon;
grant execute on function private.is_current_user_admin() to authenticated;
do $block$
declare p record; q text; w text;
begin
 for p in select schemaname,tablename,policyname,cmd,qual,with_check from pg_policies
   where schemaname='public' and (coalesce(qual,'') like '%is_current_user_admin%' or coalesce(with_check,'') like '%is_current_user_admin%')
 loop
  q:=replace(coalesce(p.qual,''),'is_current_user_admin()','private.is_current_user_admin()');
  w:=replace(coalesce(p.with_check,''),'is_current_user_admin()','private.is_current_user_admin()');
  execute format('drop policy %I on %I.%I',p.policyname,p.schemaname,p.tablename);
  if p.cmd='SELECT' then execute format('create policy %I on %I.%I for select to authenticated using (%s)',p.policyname,p.schemaname,p.tablename,q);
  elsif p.cmd='INSERT' then execute format('create policy %I on %I.%I for insert to authenticated with check (%s)',p.policyname,p.schemaname,p.tablename,w);
  elsif p.cmd='UPDATE' then execute format('create policy %I on %I.%I for update to authenticated using (%s) with check (%s)',p.policyname,p.schemaname,p.tablename,q,w);
  elsif p.cmd='DELETE' then execute format('create policy %I on %I.%I for delete to authenticated using (%s)',p.policyname,p.schemaname,p.tablename,q);
  elsif p.cmd='ALL' then execute format('create policy %I on %I.%I for all to authenticated using (%s) with check (%s)',p.policyname,p.schemaname,p.tablename,q,w);
  end if;
 end loop;
end
$block$;
drop function public.is_current_user_admin();
commit;
