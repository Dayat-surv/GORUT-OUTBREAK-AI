begin;
drop policy if exists survey_responses_owner_select on public.survey_responses;
create policy survey_responses_owner_select on public.survey_responses for select to authenticated using (
 exists(select 1 from public.public_surveys ps join public.investigations i on i.id=ps.investigation_id where ps.id=survey_id and i.owner_id=(select auth.uid()))
 or private.is_current_user_admin()
);
grant select on public.survey_responses to authenticated;
commit;
