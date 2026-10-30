
-- Keep retired registration/payment and public-survey endpoints closed in staging
-- until each workflow is separately reviewed and explicitly re-enabled.
REVOKE ALL ON FUNCTION public.create_registration_request(text,text,text,text,text,text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.activate_premium_7d(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reject_registration(uuid,text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_public_survey(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.submit_public_survey(text,jsonb,text,uuid) FROM PUBLIC, anon, authenticated;
