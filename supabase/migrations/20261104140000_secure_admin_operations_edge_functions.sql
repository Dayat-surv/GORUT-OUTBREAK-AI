-- STAGING REVIEW ONLY.
-- Server-only RPC entry points for Edge Functions. Do not apply to production
-- until the Edge Functions, secrets, browser tests, and rollback plan are approved.
--
-- The Edge Functions validate the caller's Supabase Auth JWT and derive actor_id
-- from the verified JWT. Only service_role can execute these database functions.
-- Never place a service-role/secret key in browser code or source control.

create or replace function public.edge_delete_investigation_bundle(
  p_actor_id uuid,
  p_investigation_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_owner_id uuid;
  v_case_count integer := 0;
  v_contact_count integer := 0;
  v_specimen_count integer := 0;
  v_visit_count integer := 0;
  v_survey_count integer := 0;
  v_response_count integer := 0;
begin
  if p_actor_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select i.owner_id into v_owner_id
  from public.investigations i
  where i.id = p_investigation_id
  for update;

  if not found then raise exception 'INVESTIGATION_NOT_FOUND'; end if;
  if v_owner_id is distinct from p_actor_id then raise exception 'NOT_AUTHORIZED'; end if;

  select count(*) into v_case_count from public.cases c where c.investigation_id = p_investigation_id;
  select count(*) into v_contact_count from public.contacts c where c.investigation_id = p_investigation_id;
  select count(*) into v_specimen_count from public.specimens s where s.investigation_id = p_investigation_id;
  select count(*) into v_visit_count from public.field_visits f where f.investigation_id = p_investigation_id;
  select count(*) into v_survey_count from public.public_surveys s where s.investigation_id = p_investigation_id;
  select count(*) into v_response_count
  from public.survey_responses r
  join public.public_surveys s on s.id = r.survey_id
  where s.investigation_id = p_investigation_id;

  delete from public.survey_responses r
  using public.public_surveys s
  where r.survey_id = s.id and s.investigation_id = p_investigation_id;
  delete from public.public_surveys where investigation_id = p_investigation_id;
  delete from public.field_visits where investigation_id = p_investigation_id;
  delete from public.specimens where investigation_id = p_investigation_id;
  delete from public.contacts where investigation_id = p_investigation_id;
  delete from public.cases where investigation_id = p_investigation_id;
  delete from public.investigations where id = p_investigation_id;
  if not found then raise exception 'INVESTIGATION_DELETE_FAILED'; end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'audit_log' and column_name = 'details'
  ) then
    execute 'insert into public.audit_log(actor_id, action, entity_type, entity_id, details) values ($1,$2,$3,$4,$5)'
      using p_actor_id, 'delete_investigation_bundle', 'investigation', p_investigation_id,
      jsonb_build_object('cases',v_case_count,'contacts',v_contact_count,'specimens',v_specimen_count,
        'field_visits',v_visit_count,'public_surveys',v_survey_count,'survey_responses',v_response_count);
  else
    execute 'insert into public.audit_log(actor_id, action, entity_type, entity_id, metadata) values ($1,$2,$3,$4,$5)'
      using p_actor_id, 'delete_investigation_bundle', 'investigation', p_investigation_id,
      jsonb_build_object('cases',v_case_count,'contacts',v_contact_count,'specimens',v_specimen_count,
        'field_visits',v_visit_count,'public_surveys',v_survey_count,'survey_responses',v_response_count);
  end if;

  return jsonb_build_object(
    'investigation_id',p_investigation_id,'deleted',true,'cases',v_case_count,
    'contacts',v_contact_count,'specimens',v_specimen_count,'field_visits',v_visit_count,
    'public_surveys',v_survey_count,'survey_responses',v_response_count
  );
end;
$function$;

create or replace function public.edge_activate_premium_7d(
  p_actor_id uuid,
  p_registration_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_req public.registration_requests%rowtype;
  v_user_id uuid;
  v_expires timestamptz;
  v_sub_id uuid;
begin
  if p_actor_id is null or not exists (
    select 1 from public.profiles p
    where p.id = p_actor_id and lower(coalesce(p.role,'')) = 'admin'
  ) then
    raise exception 'Hanya administrator yang dapat mengaktifkan akses';
  end if;

  select * into v_req from public.registration_requests
  where id = p_registration_id for update;
  if not found then raise exception 'Permintaan registrasi tidak ditemukan'; end if;
  if v_req.status <> 'pending' then raise exception 'Permintaan bukan berstatus pending'; end if;

  v_user_id := v_req.user_id;
  if v_user_id is null then
    select u.id into v_user_id
    from auth.users u
    where lower(u.email) = lower(v_req.email)
    order by u.created_at desc
    limit 1;
  end if;
  if v_user_id is null then
    raise exception 'Akun Auth untuk email ini belum tersedia; akses belum diaktifkan';
  end if;

  v_expires := now() + interval '7 days';
  update public.registration_requests
  set user_id = v_user_id, status = 'approved'
  where id = p_registration_id;

  insert into public.subscriptions(user_id, plan_code, status, starts_at, expires_at, activated_at)
  values (v_user_id, 'premium_7d', 'active', now(), v_expires, now())
  returning id into v_sub_id;

  insert into public.audit_log(actor_id, action, entity_type, entity_id, metadata)
  values (p_actor_id, 'activate_premium_7d', 'registration_request', p_registration_id::text,
    jsonb_build_object('user_id',v_user_id,'subscription_id',v_sub_id,'expires_at',v_expires));

  return jsonb_build_object('success',true,'subscription_id',v_sub_id,'expires_at',v_expires);
end;
$function$;

create or replace function public.edge_reject_registration(
  p_actor_id uuid,
  p_registration_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_req public.registration_requests%rowtype;
begin
  if p_actor_id is null or not exists (
    select 1 from public.profiles p
    where p.id = p_actor_id and lower(coalesce(p.role,'')) = 'admin'
  ) then
    raise exception 'Hanya administrator yang dapat menolak registrasi';
  end if;

  select * into v_req from public.registration_requests
  where id = p_registration_id for update;
  if not found then raise exception 'Permintaan registrasi tidak ditemukan'; end if;
  if v_req.status <> 'pending' then raise exception 'Permintaan bukan berstatus pending'; end if;
  if length(trim(coalesce(p_reason,''))) > 1000 then raise exception 'Alasan terlalu panjang'; end if;

  update public.registration_requests
  set status = 'rejected', rejection_reason = nullif(trim(coalesce(p_reason,'')), '')
  where id = p_registration_id;

  insert into public.audit_log(actor_id, action, entity_type, entity_id, metadata)
  values (p_actor_id, 'reject_registration', 'registration_request', p_registration_id::text,
    jsonb_build_object('reason',nullif(trim(coalesce(p_reason,'')),'')));

  return jsonb_build_object('success',true,'registration_id',p_registration_id,'status','rejected');
end;
$function$;

-- Remove direct client access to the legacy SECURITY DEFINER RPCs.
revoke all on function public.delete_investigation_bundle(text) from public, anon, authenticated;
revoke all on function public.activate_premium_7d(uuid) from public, anon, authenticated;
revoke all on function public.reject_registration(uuid, text) from public, anon, authenticated;

-- The new RPC entry points are callable only by the server-side service role.
revoke all on function public.edge_delete_investigation_bundle(uuid, text) from public, anon, authenticated;
revoke all on function public.edge_activate_premium_7d(uuid, uuid) from public, anon, authenticated;
revoke all on function public.edge_reject_registration(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.edge_delete_investigation_bundle(uuid, text) to service_role;
grant execute on function public.edge_activate_premium_7d(uuid, uuid) to service_role;
grant execute on function public.edge_reject_registration(uuid, uuid, text) to service_role;

-- Explicitly preserve the public-survey kill switch. This migration does not
-- enable surveys or alter survey data.
