begin;
alter table public.registration_requests add column if not exists rejection_reason text;
create or replace function public.create_registration_request(p_email text,p_full_name text,p_whatsapp text,p_institution text,p_payment_reference text,p_note text)
returns uuid language plpgsql security definer set search_path=''
as $function$
declare v_email text:=lower(trim(coalesce(p_email,''))); v_name text:=trim(coalesce(p_full_name,'')); v_user_id uuid:=auth.uid(); v_id uuid;
begin
 if v_email !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$' then raise exception 'Format email tidak valid'; end if;
 if length(v_name)<2 or length(v_name)>160 then raise exception 'Nama wajib diisi (2-160 karakter)'; end if;
 if length(coalesce(p_whatsapp,''))>40 or length(coalesce(p_institution,''))>200 or length(coalesce(p_payment_reference,''))>200 or length(coalesce(p_note,''))>2000 then raise exception 'Salah satu kolom melebihi batas panjang'; end if;
 if v_user_id is not null and lower(coalesce(auth.jwt()->>'email',''))<>v_email then raise exception 'Email permintaan harus sama dengan email akun yang sedang masuk'; end if;
 select r.id into v_id from public.registration_requests r where lower(r.email)=v_email and r.status='pending' and r.created_at>now()-interval '10 minutes' order by r.created_at desc limit 1;
 if v_id is not null then return v_id; end if;
 insert into public.registration_requests(user_id,full_name,email,whatsapp,institution,payment_reference,note,status)
 values(v_user_id,v_name,v_email,nullif(trim(coalesce(p_whatsapp,'')),''),nullif(trim(coalesce(p_institution,'')),''),nullif(trim(coalesce(p_payment_reference,'')),''),nullif(trim(coalesce(p_note,'')),''),'pending')
 returning id into v_id;
 return v_id;
end;
$function$;
create or replace function public.activate_premium_7d(p_registration_id uuid)
returns jsonb language plpgsql security definer set search_path=''
as $function$
declare v_req public.registration_requests%rowtype; v_user_id uuid; v_expires timestamptz; v_sub_id uuid;
begin
 if not private.is_current_user_admin() then raise exception 'Hanya administrator yang dapat mengaktifkan akses'; end if;
 select * into v_req from public.registration_requests where id=p_registration_id for update;
 if not found then raise exception 'Permintaan registrasi tidak ditemukan'; end if;
 if v_req.status<>'pending' then raise exception 'Permintaan bukan berstatus pending'; end if;
 v_user_id:=v_req.user_id;
 if v_user_id is null then select u.id into v_user_id from auth.users u where lower(u.email)=lower(v_req.email) order by u.created_at desc limit 1; end if;
 if v_user_id is null then raise exception 'Akun Auth untuk email ini belum tersedia; akses belum diaktifkan'; end if;
 v_expires:=now()+interval '7 days';
 update public.registration_requests set user_id=v_user_id,status='approved' where id=p_registration_id;
 insert into public.subscriptions(user_id,plan_code,status,starts_at,expires_at,activated_at) values(v_user_id,'premium_7d','active',now(),v_expires,now()) returning id into v_sub_id;
 insert into public.audit_log(actor_id,action,entity_type,entity_id,metadata) values(auth.uid(),'activate_premium_7d','registration_request',p_registration_id::text,jsonb_build_object('user_id',v_user_id,'subscription_id',v_sub_id,'expires_at',v_expires));
 return jsonb_build_object('success',true,'subscription_id',v_sub_id,'expires_at',v_expires);
end;
$function$;
create or replace function public.reject_registration(p_registration_id uuid,p_reason text)
returns jsonb language plpgsql security definer set search_path=''
as $function$
declare v_req public.registration_requests%rowtype;
begin
 if not private.is_current_user_admin() then raise exception 'Hanya administrator yang dapat menolak registrasi'; end if;
 select * into v_req from public.registration_requests where id=p_registration_id for update;
 if not found then raise exception 'Permintaan registrasi tidak ditemukan'; end if;
 if v_req.status<>'pending' then raise exception 'Permintaan bukan berstatus pending'; end if;
 if length(trim(coalesce(p_reason,'')))>1000 then raise exception 'Alasan terlalu panjang'; end if;
 update public.registration_requests set status='rejected',rejection_reason=nullif(trim(coalesce(p_reason,'')),'') where id=p_registration_id;
 insert into public.audit_log(actor_id,action,entity_type,entity_id,metadata) values(auth.uid(),'reject_registration','registration_request',p_registration_id::text,jsonb_build_object('reason',nullif(trim(coalesce(p_reason,'')),'')));
 return jsonb_build_object('success',true,'registration_id',p_registration_id,'status','rejected');
end;
$function$;
revoke all on function public.create_registration_request(text,text,text,text,text,text) from public;
grant execute on function public.create_registration_request(text,text,text,text,text,text) to anon,authenticated;
revoke all on function public.activate_premium_7d(uuid) from public,anon;
grant execute on function public.activate_premium_7d(uuid) to authenticated;
revoke all on function public.reject_registration(uuid,text) from public,anon;
grant execute on function public.reject_registration(uuid,text) to authenticated;
commit;
