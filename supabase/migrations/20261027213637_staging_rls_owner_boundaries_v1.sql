-- Staging-only owner-bound RLS policies. Initial helper is moved to private schema
-- by the next migration after all policies are recreated.
begin;
create or replace function public.is_current_user_admin()
returns boolean language sql stable security definer set search_path = ''
as $function$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$function$;
revoke all on function public.is_current_user_admin() from public, anon;
grant execute on function public.is_current_user_admin() to authenticated;

create or replace function public.handle_new_auth_user_profile()
returns trigger language plpgsql security definer set search_path = ''
as $function$
begin
  insert into public.profiles(id,role,full_name)
  values (new.id,'petugas',nullif(trim(coalesce(new.raw_user_meta_data->>'full_name','')),''))
  on conflict (id) do nothing;
  return new;
end;
$function$;
revoke all on function public.handle_new_auth_user_profile() from public, anon, authenticated;
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users
for each row execute function public.handle_new_auth_user_profile();

drop policy if exists investigations_owner_select on public.investigations;
create policy investigations_owner_select on public.investigations for select to authenticated using (owner_id=(select auth.uid()) or public.is_current_user_admin());
drop policy if exists investigations_owner_insert on public.investigations;
create policy investigations_owner_insert on public.investigations for insert to authenticated with check (owner_id=(select auth.uid()) or public.is_current_user_admin());
drop policy if exists investigations_owner_update on public.investigations;
create policy investigations_owner_update on public.investigations for update to authenticated using (owner_id=(select auth.uid()) or public.is_current_user_admin()) with check (owner_id=(select auth.uid()) or public.is_current_user_admin());
drop policy if exists investigations_owner_delete on public.investigations;
create policy investigations_owner_delete on public.investigations for delete to authenticated using (owner_id=(select auth.uid()) or public.is_current_user_admin());

drop policy if exists cases_owner_select on public.cases;
create policy cases_owner_select on public.cases for select to authenticated using (owner_id=(select auth.uid()) or public.is_current_user_admin());
drop policy if exists cases_owner_insert on public.cases;
create policy cases_owner_insert on public.cases for insert to authenticated with check ((owner_id=(select auth.uid()) and exists(select 1 from public.investigations i where i.id=investigation_id and i.owner_id=(select auth.uid()))) or public.is_current_user_admin());
drop policy if exists cases_owner_update on public.cases;
create policy cases_owner_update on public.cases for update to authenticated using (owner_id=(select auth.uid()) or public.is_current_user_admin()) with check ((owner_id=(select auth.uid()) and exists(select 1 from public.investigations i where i.id=investigation_id and i.owner_id=(select auth.uid()))) or public.is_current_user_admin());
drop policy if exists cases_owner_delete on public.cases;
create policy cases_owner_delete on public.cases for delete to authenticated using (owner_id=(select auth.uid()) or public.is_current_user_admin());

drop policy if exists contacts_owner_all on public.contacts;
create policy contacts_owner_all on public.contacts for all to authenticated using (owner_id=(select auth.uid()) or public.is_current_user_admin()) with check ((owner_id=(select auth.uid()) and exists(select 1 from public.investigations i where i.id=investigation_id and i.owner_id=(select auth.uid()))) or public.is_current_user_admin());
drop policy if exists specimens_owner_all on public.specimens;
create policy specimens_owner_all on public.specimens for all to authenticated using (owner_id=(select auth.uid()) or public.is_current_user_admin()) with check ((owner_id=(select auth.uid()) and exists(select 1 from public.investigations i where i.id=investigation_id and i.owner_id=(select auth.uid()))) or public.is_current_user_admin());
drop policy if exists field_visits_owner_all on public.field_visits;
create policy field_visits_owner_all on public.field_visits for all to authenticated using (owner_id=(select auth.uid()) or public.is_current_user_admin()) with check ((owner_id=(select auth.uid()) and exists(select 1 from public.investigations i where i.id=investigation_id and i.owner_id=(select auth.uid()))) or public.is_current_user_admin());
drop policy if exists alerts_owner_all on public.alerts;
create policy alerts_owner_all on public.alerts for all to authenticated using (owner_id=(select auth.uid()) or public.is_current_user_admin()) with check (owner_id=(select auth.uid()) or public.is_current_user_admin());

drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles for select to authenticated using (id=(select auth.uid()) or public.is_current_user_admin());
drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles for update to authenticated using (public.is_current_user_admin()) with check (public.is_current_user_admin());

drop policy if exists diseases_authenticated_read on public.diseases;
create policy diseases_authenticated_read on public.diseases for select to authenticated using (true);
drop policy if exists diseases_admin_write on public.diseases;
create policy diseases_admin_write on public.diseases for all to authenticated using (public.is_current_user_admin()) with check (public.is_current_user_admin());

drop policy if exists questionnaires_owner_select on public.questionnaires;
create policy questionnaires_owner_select on public.questionnaires for select to authenticated using (created_by=(select auth.uid()) or public.is_current_user_admin());
drop policy if exists questionnaires_owner_insert on public.questionnaires;
create policy questionnaires_owner_insert on public.questionnaires for insert to authenticated with check (created_by=(select auth.uid()) or public.is_current_user_admin());
drop policy if exists questionnaires_owner_update on public.questionnaires;
create policy questionnaires_owner_update on public.questionnaires for update to authenticated using (created_by=(select auth.uid()) or public.is_current_user_admin()) with check (created_by=(select auth.uid()) or public.is_current_user_admin());

drop policy if exists public_surveys_owner_select on public.public_surveys;
create policy public_surveys_owner_select on public.public_surveys for select to authenticated using (created_by=(select auth.uid()) or public.is_current_user_admin());
drop policy if exists public_surveys_owner_insert on public.public_surveys;
create policy public_surveys_owner_insert on public.public_surveys for insert to authenticated with check (created_by=(select auth.uid()) and exists(select 1 from public.investigations i where i.id=investigation_id and i.owner_id=(select auth.uid())));
drop policy if exists public_surveys_owner_update on public.public_surveys;
create policy public_surveys_owner_update on public.public_surveys for update to authenticated using (created_by=(select auth.uid()) or public.is_current_user_admin()) with check (created_by=(select auth.uid()) or public.is_current_user_admin());

drop policy if exists registration_requests_owner_select on public.registration_requests;
create policy registration_requests_owner_select on public.registration_requests for select to authenticated using (user_id=(select auth.uid()) or public.is_current_user_admin());
drop policy if exists registration_requests_admin_update on public.registration_requests;
create policy registration_requests_admin_update on public.registration_requests for update to authenticated using (public.is_current_user_admin()) with check (public.is_current_user_admin());

drop policy if exists subscriptions_owner_select on public.subscriptions;
create policy subscriptions_owner_select on public.subscriptions for select to authenticated using (user_id=(select auth.uid()) or public.is_current_user_admin());
drop policy if exists subscriptions_admin_all on public.subscriptions;
create policy subscriptions_admin_all on public.subscriptions for all to authenticated using (public.is_current_user_admin()) with check (public.is_current_user_admin());

drop policy if exists audit_log_admin_select on public.audit_log;
create policy audit_log_admin_select on public.audit_log for select to authenticated using (public.is_current_user_admin());

grant select on public.profiles to authenticated;
grant update (full_name,facility) on public.profiles to authenticated;
grant select,insert,update,delete on public.investigations,public.cases,public.contacts,public.specimens,public.field_visits,public.alerts to authenticated;
grant select,insert,update,delete on public.diseases to authenticated;
grant select,insert,update on public.questionnaires,public.public_surveys to authenticated;
grant select,insert,update on public.registration_requests to authenticated;
grant select,insert,update,delete on public.subscriptions to authenticated;
grant select on public.audit_log to authenticated;
grant usage on schema public to authenticated;

create or replace view public.my_access_status with (security_invoker=true) as
select p.id as user_id,
  (p.role='admin' or exists(select 1 from public.subscriptions s where s.user_id=p.id and s.status='active' and s.starts_at<=now() and (s.expires_at is null or s.expires_at>now()))) as has_access,
  (p.role='admin') as is_admin,
  (select max(s.expires_at) from public.subscriptions s where s.user_id=p.id and s.status='active') as expires_at
from public.profiles p where p.id=auth.uid();
grant select on public.my_access_status to authenticated;
commit;
