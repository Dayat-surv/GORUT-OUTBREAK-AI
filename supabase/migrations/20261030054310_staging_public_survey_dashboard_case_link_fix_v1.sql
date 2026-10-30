
-- Correct response-to-case linkage: submit_public_survey creates the case row
-- with id = survey_responses.id::text. Keep this function SECURITY INVOKER.
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
SECURITY INVOKER
SET search_path = ''
AS $function$
  SELECT
    sr.id AS response_id,
    sr.created_at AS submitted_at,
    i.id AS investigation_id,
    i.name AS investigation_name,
    COALESCE(NULLIF(sr.payload ->> 'disease_module', ''), '') AS disease_module,
    c.id AS case_id,
    COALESCE(c.case_code, NULLIF(sr.payload ->> 'case_code', ''), NULLIF(sr.payload ->> 'inisial', '')) AS case_code,
    COALESCE(c.full_name, NULLIF(sr.payload ->> 'nama_lengkap', ''), NULLIF(sr.payload ->> 'nama', ''), NULLIF(sr.payload ->> 'inisial', '')) AS full_name,
    COALESCE(
      c.age,
      CASE WHEN COALESCE(sr.payload ->> 'umur', '') ~ '^[0-9]{1,3}$'
        THEN (sr.payload ->> 'umur')::integer
        ELSE NULL
      END
    ) AS age,
    COALESCE(c.sex, NULLIF(sr.payload ->> 'jenis_kelamin', '')) AS sex,
    c.onset_date AS onset_date,
    COALESCE(c.status, NULLIF(sr.payload ->> 'status_kasus', '')) AS case_status,
    COALESCE(c.outcome, NULLIF(sr.payload ->> 'outcome', '')) AS outcome,
    c.latitude AS latitude,
    c.longitude AS longitude,
    sr.payload
  FROM public.survey_responses AS sr
  JOIN public.public_surveys AS ps ON ps.id = sr.survey_id
  JOIN public.investigations AS i ON i.id = ps.investigation_id
  LEFT JOIN public.cases AS c
    ON c.id = sr.id::text
   AND c.owner_id = (SELECT auth.uid())
  WHERE (SELECT auth.uid()) IS NOT NULL
    AND i.owner_id = (SELECT auth.uid())
    AND ps.created_by = (SELECT auth.uid())
  ORDER BY sr.created_at DESC;
$function$;

REVOKE ALL ON FUNCTION public.get_my_public_survey_submissions() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_public_survey_submissions() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_public_survey_submissions() TO authenticated;
