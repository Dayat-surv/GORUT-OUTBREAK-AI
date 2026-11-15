-- PRODUCTION CANDIDATE ONLY.
-- This migration is intentionally NOT applied to Supabase Production.
-- Execute only after backup, peer review, and explicit release approval.

begin;

create or replace function public.edge_create_registration_request(
  p_actor_id uuid,
  p_email text,
  p_full_name text,
  p_whatsapp text,
  p_institution text,
  p_payment_reference text,
  p_note text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_name text := trim(coalesce(p_full_name, ''));
  v_auth_email text;
  v_confirmed_at timestamptz;
  v_id uuid;
begin
  if p_actor_id is null then raise exception 'AUTH_REQUIRED'; end if;

  select lower(u.email), u.email_confirmed_at
    into v_auth_email, v_confirmed_at
  from auth.users u where u.id = p_actor_id;

  if not found then raise exception 'AUTH_REQUIRED'; end if;
  if v_auth_email is distinct from v_email then raise exception 'EMAIL_MISMATCH'; end if;
  if v_confirmed_at is null then raise exception 'EMAIL_NOT_VERIFIED'; end if;
  if v_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}$' then raise exception 'INVALID_EMAIL'; end if;
  if length(v_name) < 2 or length(v_name) > 160 then raise exception 'INVALID_FULL_NAME'; end if;
  if length(coalesce(p_whatsapp,'')) > 40
     or length(coalesce(p_institution,'')) > 200
     or length(coalesce(p_payment_reference,'')) > 200
     or length(coalesce(p_note,'')) > 2000 then
    raise exception 'INVALID_FIELD_LENGTH';
  end if;

  select r.id into v_id
  from public.registration_requests r
  where lower(r.email) = v_email and r.status = 'pending'
    and r.created_at > now() - interval '10 minutes'
  order by r.created_at desc limit 1;
  if v_id is not null then return v_id; end if;

  insert into public.registration_requests
    (user_id, full_name, email, whatsapp, institution, payment_reference, note, status)
  values
    (p_actor_id, v_name, v_email, nullif(trim(coalesce(p_whatsapp,'')), ''),
     nullif(trim(coalesce(p_institution,'')), ''),
     nullif(trim(coalesce(p_payment_reference,'')), ''),
     nullif(trim(coalesce(p_note,'')), ''), 'pending')
  returning id into v_id;

  insert into public.audit_log(actor_id, action, entity_type, entity_id, details)
  values (p_actor_id, 'registration_requested', 'registration_request', v_id::text,
          jsonb_build_object('email',v_email));

  return v_id;
end;
$function$;

create or replace function public.edge_activate_premium_7d(
  p_actor_id uuid, p_registration_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_req public.registration_requests%rowtype;
  v_user_id uuid;
  v_expires timestamptz;
  v_subscription_id uuid;
begin
  if p_actor_id is null or not exists (
    select 1 from public.profiles p where p.id = p_actor_id and lower(p.role) = 'admin'
  ) then raise exception 'Hanya administrator yang dapat mengaktifkan akses'; end if;

  select * into v_req from public.registration_requests
  where id = p_registration_id for update;
  if not found then raise exception 'Permintaan registrasi tidak ditemukan'; end if;
  if v_req.status <> 'pending' then raise exception 'Permintaan bukan berstatus pending'; end if;

  v_user_id := v_req.user_id;
  if v_user_id is null then
    select u.id into v_user_id from auth.users u
    where lower(u.email) = lower(v_req.email)
    order by u.created_at desc limit 1;
  end if;
  if v_user_id is null then raise exception 'Akun Auth untuk email ini belum tersedia'; end if;

  v_expires := now() + interval '7 days';
  update public.registration_requests
  set user_id = v_user_id, status = 'verified',
      reviewed_by = p_actor_id, reviewed_at = now()
  where id = p_registration_id;

  insert into public.subscriptions(user_id, plan_code, status, starts_at, expires_at, activated_at)
  values (v_user_id, 'premium_7d', 'active', now(), v_expires, now())
  returning id into v_subscription_id;

  insert into public.audit_log(actor_id, action, entity_type, entity_id, details)
  values (p_actor_id, 'activate_premium_7d', 'registration_request', p_registration_id::text,
          jsonb_build_object('user_id',v_user_id,'subscription_id',v_subscription_id,'expires_at',v_expires));

  return jsonb_build_object('success',true,'subscription_id',v_subscription_id,'expires_at',v_expires);
end;
$function$;

create or replace function public.edge_reject_registration(
  p_actor_id uuid, p_registration_id uuid, p_reason text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_req public.registration_requests%rowtype;
  v_reason text := trim(coalesce(p_reason,''));
begin
  if p_actor_id is null or not exists (
    select 1 from public.profiles p where p.id = p_actor_id and lower(p.role) = 'admin'
  ) then raise exception 'Hanya administrator yang dapat menolak registrasi'; end if;

  select * into v_req from public.registration_requests
  where id = p_registration_id for update;
  if not found then raise exception 'Permintaan registrasi tidak ditemukan'; end if;
  if v_req.status <> 'pending' then raise exception 'Permintaan bukan berstatus pending'; end if;
  if length(v_reason) > 1000 then raise exception 'Alasan terlalu panjang'; end if;

  update public.registration_requests
  set status = 'rejected', reviewed_by = p_actor_id, reviewed_at = now()
  where id = p_registration_id;

  -- Production schema stores audit metadata in audit_log.details;
  -- there is no rejection_reason column on registration_requests.
  insert into public.audit_log(actor_id, action, entity_type, entity_id, details)
  values (p_actor_id, 'reject_registration', 'registration_request', p_registration_id::text,
          jsonb_build_object('reason',nullif(v_reason,'')));

  return jsonb_build_object('success',true,'registration_id',p_registration_id,'status','rejected');
end;
$function$;

create or replace function public.edge_delete_investigation_bundle(
  p_actor_id uuid, p_investigation_id text
) returns jsonb
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
  if p_actor_id is null then raise exception 'AUTH_REQUIRED'; end if;

  select i.owner_id into v_owner_id
  from public.investigations i where i.id = p_investigation_id for update;
  if not found then raise exception 'INVESTIGATION_NOT_FOUND'; end if;
  if v_owner_id is distinct from p_actor_id then raise exception 'NOT_AUTHORIZED'; end if;

  select count(*) into v_case_count from public.cases where investigation_id = p_investigation_id;
  select count(*) into v_contact_count from public.contacts where investigation_id = p_investigation_id;
  select count(*) into v_specimen_count from public.specimens where investigation_id = p_investigation_id;
  select count(*) into v_visit_count from public.field_visits where investigation_id = p_investigation_id;
  select count(*) into v_survey_count from public.public_surveys where investigation_id = p_investigation_id;
  select count(*) into v_response_count
  from public.survey_responses r
  join public.public_surveys s on s.id = r.survey_id
  where s.investigation_id = p_investigation_id;

  delete from public.survey_responses r using public.public_surveys s
  where r.survey_id = s.id and s.investigation_id = p_investigation_id;
  delete from public.public_surveys where investigation_id = p_investigation_id;
  delete from public.field_visits where investigation_id = p_investigation_id;
  delete from public.specimens where investigation_id = p_investigation_id;
  delete from public.contacts where investigation_id = p_investigation_id;
  delete from public.cases where investigation_id = p_investigation_id;
  delete from public.investigations where id = p_investigation_id;
  if not found then raise exception 'INVESTIGATION_DELETE_FAILED'; end if;

  insert into public.audit_log(actor_id, action, entity_type, entity_id, details)
  values (p_actor_id, 'delete_investigation_bundle', 'investigation', p_investigation_id,
    jsonb_build_object('cases',v_case_count,'contacts',v_contact_count,'specimens',v_specimen_count,
      'field_visits',v_visit_count,'public_surveys',v_survey_count,'survey_responses',v_response_count));

  return jsonb_build_object('investigation_id',p_investigation_id,'deleted',true,
    'cases',v_case_count,'contacts',v_contact_count,'specimens',v_specimen_count,
    'field_visits',v_visit_count,'public_surveys',v_survey_count,'survey_responses',v_response_count);
end;
$function$;

revoke all on function public.edge_create_registration_request(uuid,text,text,text,text,text,text) from public, anon, authenticated;
revoke all on function public.edge_activate_premium_7d(uuid,uuid) from public, anon, authenticated;
revoke all on function public.edge_reject_registration(uuid,uuid,text) from public, anon, authenticated;
revoke all on function public.edge_delete_investigation_bundle(uuid,text) from public, anon, authenticated;

grant execute on function public.edge_create_registration_request(uuid,text,text,text,text,text,text) to service_role;
grant execute on function public.edge_activate_premium_7d(uuid,uuid) to service_role;
grant execute on function public.edge_reject_registration(uuid,uuid,text) to service_role;
grant execute on function public.edge_delete_investigation_bundle(uuid,text) to service_role;

commit;
