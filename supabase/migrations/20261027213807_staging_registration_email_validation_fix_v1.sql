create or replace function public.create_registration_request(p_email text,p_full_name text,p_whatsapp text,p_institution text,p_payment_reference text,p_note text)
returns uuid language plpgsql security definer set search_path=''
as $function$
declare v_email text:=lower(trim(coalesce(p_email,''))); v_name text:=trim(coalesce(p_full_name,'')); v_user_id uuid:=auth.uid(); v_id uuid;
begin
 if v_email !~* '^[A-Z0-9._%+\\-]+@[A-Z0-9.\\-]+\\.[A-Z]{2,}$' then raise exception 'Format email tidak valid'; end if;
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
revoke all on function public.create_registration_request(text,text,text,text,text,text) from public;
grant execute on function public.create_registration_request(text,text,text,text,text,text) to anon,authenticated;
