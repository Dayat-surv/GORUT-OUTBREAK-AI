-- STAGING ONLY: secure registration-request creation through an authenticated Edge Function.
-- The actor ID is derived from the verified JWT by the Edge Function, never from client input.
-- The function rejects unverified email accounts and keeps the existing 10-minute idempotency window.

create or replace function public.edge_create_registration_request(
  p_actor_id uuid,
  p_email text,
  p_full_name text,
  p_whatsapp text,
  p_institution text,
  p_payment_reference text,
  p_note text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_name text := trim(coalesce(p_full_name, ''));
  v_auth_email text;
  v_email_confirmed_at timestamptz;
  v_id uuid;
begin
  if p_actor_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select lower(u.email), u.email_confirmed_at
    into v_auth_email, v_email_confirmed_at
  from auth.users u
  where u.id = p_actor_id;

  if not found then
    raise exception 'AUTH_REQUIRED';
  end if;
  if v_auth_email is distinct from v_email then
    raise exception 'EMAIL_MISMATCH';
  end if;
  if v_email_confirmed_at is null then
    raise exception 'EMAIL_NOT_VERIFIED';
  end if;

  if v_email !~* '^[A-Z0-9._%+%-]+@[A-Z0-9.-]+[.][A-Z]{2,}$' then
    raise exception 'INVALID_EMAIL';
  end if;
  if length(v_name) < 2 or length(v_name) > 160 then
    raise exception 'INVALID_FULL_NAME';
  end if;
  if length(coalesce(p_whatsapp,'')) > 40
     or length(coalesce(p_institution,'')) > 200
     or length(coalesce(p_payment_reference,'')) > 200
     or length(coalesce(p_note,'')) > 2000 then
    raise exception 'INVALID_FIELD_LENGTH';
  end if;

  select r.id into v_id
  from public.registration_requests r
  where lower(r.email) = v_email
    and r.status = 'pending'
    and r.created_at > now() - interval '10 minutes'
  order by r.created_at desc
  limit 1;

  if v_id is not null then
    return v_id;
  end if;

  insert into public.registration_requests
    (user_id, full_name, email, whatsapp, institution, payment_reference, note, status)
  values
    (p_actor_id, v_name, v_email,
     nullif(trim(coalesce(p_whatsapp,'')), ''),
     nullif(trim(coalesce(p_institution,'')), ''),
     nullif(trim(coalesce(p_payment_reference,'')), ''),
     nullif(trim(coalesce(p_note,'')), ''),
     'pending')
  returning id into v_id;

  return v_id;
end;
$function$;

revoke all on function public.edge_create_registration_request(uuid, text, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.edge_create_registration_request(uuid, text, text, text, text, text, text)
  to service_role;

revoke all on function public.create_registration_request(text, text, text, text, text, text)
  from public, anon, authenticated;
