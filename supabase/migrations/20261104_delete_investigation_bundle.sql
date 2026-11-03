-- Atomic, owner-scoped deletion of one investigation and its dependent operational records.
-- SECURITY DEFINER is required because survey_responses intentionally has no client DELETE policy.
create or replace function public.delete_investigation_bundle(p_investigation_id text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user_id uuid := auth.uid();
  v_owner_id uuid;
  v_case_count integer := 0;
  v_contact_count integer := 0;
  v_specimen_count integer := 0;
  v_visit_count integer := 0;
  v_survey_count integer := 0;
  v_response_count integer := 0;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select i.owner_id
    into v_owner_id
    from public.investigations i
   where i.id = p_investigation_id
   for update;

  if not found then
    raise exception 'INVESTIGATION_NOT_FOUND';
  end if;

  if v_owner_id is distinct from v_user_id then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select count(*) into v_case_count
    from public.cases c where c.investigation_id = p_investigation_id;
  select count(*) into v_contact_count
    from public.contacts c where c.investigation_id = p_investigation_id;
  select count(*) into v_specimen_count
    from public.specimens s where s.investigation_id = p_investigation_id;
  select count(*) into v_visit_count
    from public.field_visits f where f.investigation_id = p_investigation_id;
  select count(*) into v_survey_count
    from public.public_surveys s where s.investigation_id = p_investigation_id;
  select count(*) into v_response_count
    from public.survey_responses r
    join public.public_surveys s on s.id = r.survey_id
   where s.investigation_id = p_investigation_id;

  delete from public.survey_responses r
   using public.public_surveys s
   where r.survey_id = s.id
     and s.investigation_id = p_investigation_id;

  delete from public.public_surveys
   where investigation_id = p_investigation_id;

  delete from public.field_visits
   where investigation_id = p_investigation_id;

  delete from public.specimens
   where investigation_id = p_investigation_id;

  delete from public.contacts
   where investigation_id = p_investigation_id;

  delete from public.cases
   where investigation_id = p_investigation_id;

  delete from public.investigations
   where id = p_investigation_id;

  if not found then
    raise exception 'INVESTIGATION_DELETE_FAILED';
  end if;

  -- Audit schema differs slightly between existing staging and production projects.
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'audit_log' and column_name = 'details'
  ) then
    execute 'insert into public.audit_log(actor_id, action, entity_type, entity_id, details) values ($1,$2,$3,$4,$5)'
      using v_user_id, 'delete_investigation_bundle', 'investigation', p_investigation_id,
        jsonb_build_object('cases',v_case_count,'contacts',v_contact_count,'specimens',v_specimen_count,'field_visits',v_visit_count,'public_surveys',v_survey_count,'survey_responses',v_response_count);
  else
    execute 'insert into public.audit_log(actor_id, action, entity_type, entity_id, metadata) values ($1,$2,$3,$4,$5)'
      using v_user_id, 'delete_investigation_bundle', 'investigation', p_investigation_id,
        jsonb_build_object('cases',v_case_count,'contacts',v_contact_count,'specimens',v_specimen_count,'field_visits',v_visit_count,'public_surveys',v_survey_count,'survey_responses',v_response_count);
  end if;

  return jsonb_build_object(
    'investigation_id', p_investigation_id,
    'deleted', true,
    'cases', v_case_count,
    'contacts', v_contact_count,
    'specimens', v_specimen_count,
    'field_visits', v_visit_count,
    'public_surveys', v_survey_count,
    'survey_responses', v_response_count
  );
end;
$function$;

revoke all on function public.delete_investigation_bundle(text) from public;
revoke all on function public.delete_investigation_bundle(text) from anon;
grant execute on function public.delete_investigation_bundle(text) to authenticated;
