-- Secure read path for public questionnaire submissions.
-- Apply in Supabase SQL Editor. Requires the app user to sign in through Supabase Auth.
BEGIN;

CREATE OR REPLACE FUNCTION public.get_my_public_survey_submissions()
RETURNS TABLE (
  response_id uuid,
  submitted_at timestamptz,
  investigation_id text,
  investigation_name text,
  disease_module text,
  case_id text,
  case_code text,
  full_name text,
  age integer,
  sex text,
  onset_date date,
  case_status text,
  outcome text,
  latitude double precision,
  longitude double precision,
  payload jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT
    sr.id AS response_id,
    sr.created_at AS submitted_at,
    i.id AS investigation_id,
    i.name AS investigation_name,
    COALESCE(sr.payload ->> 'disease_module', '') AS disease_module,
    c.id AS case_id,
    c.case_code,
    c.full_name,
    c.age,
    c.sex,
    c.onset_date,
    c.status AS case_status,
    c.outcome,
    c.latitude,
    c.longitude,
    sr.payload
  FROM public.survey_responses sr
  JOIN public.public_surveys ps ON ps.id = sr.survey_id
  JOIN public.investigations i ON i.id = ps.investigation_id
  LEFT JOIN public.cases c ON c.id = sr.id::text
  WHERE auth.uid() IS NOT NULL
    AND i.owner_id = auth.uid()
  ORDER BY sr.created_at DESC;
$function$;

REVOKE ALL ON FUNCTION public.get_my_public_survey_submissions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_public_survey_submissions() TO authenticated;

COMMIT;
