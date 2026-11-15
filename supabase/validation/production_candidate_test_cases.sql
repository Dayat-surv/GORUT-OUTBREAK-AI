-- All records in this script are synthetic and rolled back at the end.
begin;

do $privileges$
begin
  if has_function_privilege('anon', 'public.edge_create_registration_request(uuid,text,text,text,text,text,text)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.edge_create_registration_request(uuid,text,text,text,text,text,text)', 'EXECUTE')
     or not has_function_privilege('service_role', 'public.edge_create_registration_request(uuid,text,text,text,text,text,text)', 'EXECUTE') then
    raise exception 'PRIVILEGE_TEST_FAILED: create registration RPC grants';
  end if;
  if has_function_privilege('anon', 'public.edge_activate_premium_7d(uuid,uuid)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.edge_activate_premium_7d(uuid,uuid)', 'EXECUTE')
     or not has_function_privilege('service_role', 'public.edge_activate_premium_7d(uuid,uuid)', 'EXECUTE') then
    raise exception 'PRIVILEGE_TEST_FAILED: activation RPC grants';
  end if;
  if has_function_privilege('anon', 'public.edge_reject_registration(uuid,uuid,text)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.edge_reject_registration(uuid,uuid,text)', 'EXECUTE')
     or not has_function_privilege('service_role', 'public.edge_reject_registration(uuid,uuid,text)', 'EXECUTE') then
    raise exception 'PRIVILEGE_TEST_FAILED: rejection RPC grants';
  end if;
  if has_function_privilege('anon', 'public.edge_delete_investigation_bundle(uuid,text)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.edge_delete_investigation_bundle(uuid,text)', 'EXECUTE')
     or not has_function_privilege('service_role', 'public.edge_delete_investigation_bundle(uuid,text)', 'EXECUTE') then
    raise exception 'PRIVILEGE_TEST_FAILED: delete RPC grants';
  end if;
end;
$privileges$;

set role service_role;

do $tests$
declare
  v_admin uuid := '00000000-0000-4000-8000-000000000001';
  v_petugas uuid := '00000000-0000-4000-8000-000000000002';
  v_unverified uuid := '00000000-0000-4000-8000-000000000003';
  v_request uuid;
  v_retry uuid;
  v_reject_request uuid;
  v_petugas_request uuid;
  v_result jsonb;
  v_survey uuid := '10000000-0000-4000-8000-000000000001';
begin
  insert into auth.users(id,email,email_confirmed_at) values
    (v_admin,'admin@example.test',now()),
    (v_petugas,'petugas@example.test',now()),
    (v_unverified,'unverified@example.test',null);
  insert into public.profiles(id,role) values (v_admin,'admin'),(v_petugas,'petugas');

  -- Verified registration is idempotent for the same account/email.
  v_request := public.edge_create_registration_request(
    v_admin,'admin@example.test','Admin Test',null,'Dinkes',null,'uji'
  );
  v_retry := public.edge_create_registration_request(
    v_admin,'admin@example.test','Admin Test',null,'Dinkes',null,'uji ulang'
  );
  if v_request is distinct from v_retry then
    raise exception 'REGISTRATION_IDEMPOTENCY_TEST_FAILED';
  end if;

  -- Admin activation updates request, creates subscription and audit entry.
  v_result := public.edge_activate_premium_7d(v_admin,v_request);
  if v_result->>'expires_at' is null
     or not exists (select 1 from public.registration_requests where id=v_request and status='verified' and reviewed_by=v_admin)
     or not exists (select 1 from public.subscriptions where user_id=v_admin and plan_code='premium_7d' and status='active')
     or not exists (select 1 from public.audit_log where action='activate_premium_7d' and entity_id=v_request::text) then
    raise exception 'ACTIVATION_POSITIVE_TEST_FAILED';
  end if;

  -- Admin rejection changes only the pending request and records reason.
  v_reject_request := public.edge_create_registration_request(
    v_petugas,'petugas@example.test','Petugas Test',null,'Puskesmas',null,'uji penolakan'
  );
  v_result := public.edge_reject_registration(v_admin,v_reject_request,'dokumen belum lengkap');
  if v_result->>'status' <> 'rejected'
     or not exists (select 1 from public.registration_requests where id=v_reject_request and status='rejected' and reviewed_by=v_admin)
     or not exists (select 1 from public.audit_log where action='reject_registration' and details->>'reason'='dokumen belum lengkap') then
    raise exception 'REJECTION_POSITIVE_TEST_FAILED';
  end if;

  -- Unverified email must not be able to create a request.
  begin
    perform public.edge_create_registration_request(
      v_unverified,'unverified@example.test','Unverified Test',null,null,null,null
    );
    raise exception 'EXPECTED_EMAIL_NOT_VERIFIED_ERROR_NOT_RAISED';
  exception when others then
    if sqlerrm <> 'EMAIL_NOT_VERIFIED' then raise; end if;
  end;

  -- Non-admin cannot activate or reject, even with service-role RPC access.
  v_petugas_request := public.edge_create_registration_request(
    v_petugas,'petugas@example.test','Petugas Test',null,'Puskesmas',null,'uji hak akses'
  );
  begin
    perform public.edge_activate_premium_7d(v_petugas,v_petugas_request);
    raise exception 'EXPECTED_ADMIN_ONLY_ACTIVATION_ERROR_NOT_RAISED';
  exception when others then
    if sqlerrm <> 'Hanya administrator yang dapat mengaktifkan akses' then raise; end if;
  end;
  begin
    perform public.edge_reject_registration(v_petugas,v_petugas_request,'uji');
    raise exception 'EXPECTED_ADMIN_ONLY_REJECTION_ERROR_NOT_RAISED';
  exception when others then
    if sqlerrm <> 'Hanya administrator yang dapat menolak registrasi' then raise; end if;
  end;
  if not exists (select 1 from public.registration_requests where id=v_petugas_request and status='pending') then
    raise exception 'NON_ADMIN_MUTATED_REGISTRATION';
  end if;

  -- Owner deletes a full bundle, including contact/specimen linked only via case.
  insert into public.investigations(id,owner_id) values ('INV-DELETE',v_admin);
  insert into public.cases(id,investigation_id,owner_id) values ('CASE-DELETE','INV-DELETE',v_admin);
  insert into public.contacts(id,investigation_id,owner_id,index_case_id) values
    ('CONTACT-DIRECT','INV-DELETE',v_admin,null),
    ('CONTACT-INDIRECT',null,v_admin,'CASE-DELETE');
  insert into public.specimens(id,investigation_id,owner_id,case_id) values
    ('SPECIMEN-DIRECT','INV-DELETE',v_admin,null),
    ('SPECIMEN-INDIRECT',null,v_admin,'CASE-DELETE');
  insert into public.field_visits(id,investigation_id,owner_id) values ('VISIT-DELETE','INV-DELETE',v_admin);
  insert into public.public_surveys(id,investigation_id,created_by) values (v_survey,'INV-DELETE',v_admin);
  insert into public.survey_responses(id,survey_id) values ('20000000-0000-4000-8000-000000000001',v_survey);

  v_result := public.edge_delete_investigation_bundle(v_admin,'INV-DELETE');
  if v_result->>'deleted' <> 'true'
     or (v_result->>'cases')::int <> 1
     or (v_result->>'contacts')::int <> 2
     or (v_result->>'specimens')::int <> 2
     or (v_result->>'field_visits')::int <> 1
     or (v_result->>'public_surveys')::int <> 1
     or (v_result->>'survey_responses')::int <> 1 then
    raise exception 'DELETE_POSITIVE_TEST_FAILED: %',v_result;
  end if;
  if exists (select 1 from public.investigations where id='INV-DELETE')
     or exists (select 1 from public.cases where id='CASE-DELETE')
     or exists (select 1 from public.contacts where id in ('CONTACT-DIRECT','CONTACT-INDIRECT'))
     or exists (select 1 from public.specimens where id in ('SPECIMEN-DIRECT','SPECIMEN-INDIRECT'))
     or exists (select 1 from public.field_visits where id='VISIT-DELETE')
     or exists (select 1 from public.public_surveys where id=v_survey)
     or exists (select 1 from public.survey_responses where survey_id=v_survey) then
    raise exception 'DELETE_LEFT_LINKED_RECORDS';
  end if;

  -- Another owner cannot delete an investigation.
  insert into public.investigations(id,owner_id) values ('INV-OWNER',v_admin);
  begin
    perform public.edge_delete_investigation_bundle(v_petugas,'INV-OWNER');
    raise exception 'EXPECTED_NOT_AUTHORIZED_ERROR_NOT_RAISED';
  exception when others then
    if sqlerrm <> 'NOT_AUTHORIZED' then raise; end if;
  end;
  if not exists (select 1 from public.investigations where id='INV-OWNER') then
    raise exception 'UNAUTHORIZED_DELETE_CHANGED_PARENT';
  end if;

  -- Owner mismatch in a child record fails closed and preserves the bundle.
  insert into public.investigations(id,owner_id) values ('INV-CHILD-MISMATCH',v_admin);
  insert into public.cases(id,investigation_id,owner_id) values ('CASE-OTHER-OWNER','INV-CHILD-MISMATCH',v_petugas);
  begin
    perform public.edge_delete_investigation_bundle(v_admin,'INV-CHILD-MISMATCH');
    raise exception 'EXPECTED_CHILD_OWNER_MISMATCH_NOT_RAISED';
  exception when others then
    if sqlerrm <> 'RELATED_RECORD_OWNER_OR_INVESTIGATION_MISMATCH' then raise; end if;
  end;
  if not exists (select 1 from public.investigations where id='INV-CHILD-MISMATCH')
     or not exists (select 1 from public.cases where id='CASE-OTHER-OWNER') then
    raise exception 'CHILD_OWNER_MISMATCH_DID_NOT_PRESERVE_DATA';
  end if;

  -- A contact whose case and investigation disagree also fails closed.
  insert into public.investigations(id,owner_id) values ('INV-A',v_admin),('INV-B',v_admin);
  insert into public.cases(id,investigation_id,owner_id) values ('CASE-A','INV-A',v_admin);
  insert into public.contacts(id,investigation_id,owner_id,index_case_id) values ('CONTACT-CROSS-INV','INV-B',v_admin,'CASE-A');
  begin
    perform public.edge_delete_investigation_bundle(v_admin,'INV-A');
    raise exception 'EXPECTED_CROSS_INVESTIGATION_MISMATCH_NOT_RAISED';
  exception when others then
    if sqlerrm <> 'RELATED_RECORD_OWNER_OR_INVESTIGATION_MISMATCH' then raise; end if;
  end;
  if not exists (select 1 from public.investigations where id='INV-A')
     or not exists (select 1 from public.contacts where id='CONTACT-CROSS-INV') then
    raise exception 'CROSS_INVESTIGATION_MISMATCH_DID_NOT_PRESERVE_DATA';
  end if;
end;
$tests$;

reset role;
rollback;
