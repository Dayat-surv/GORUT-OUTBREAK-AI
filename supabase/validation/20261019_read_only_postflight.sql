-- READ-ONLY postflight for GORUT-OUTBREAK-AI.
-- Run only AFTER the reviewed migration has been applied successfully.
-- No data is modified; queries return schema/security metadata and aggregate counts only.

-- 1) Verify the submission_id column and idempotency index exist.
SELECT
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'survey_responses'
      AND column_name = 'submission_id'
      AND data_type = 'uuid'
  ) AS submission_id_uuid_column_exists,
  EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'survey_responses'
      AND indexname = 'survey_responses_survey_submission_uidx'
  ) AS idempotency_index_exists;

-- 2) Verify the four-argument RPC exists, is SECURITY DEFINER, and pins search_path.
SELECT
  p.oid::regprocedure AS function_signature,
  p.prosecdef AS security_definer,
  p.proconfig AS function_settings,
  has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_can_execute,
  has_function_privilege('public', p.oid, 'EXECUTE') AS public_role_can_execute
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'submit_public_survey'
ORDER BY p.oid::regprocedure::text;

-- Expected for the four-argument overload:
-- security_definer=true, search_path="", anon_can_execute=true,
-- authenticated_can_execute=true. The PUBLIC pseudo-role grant is best
-- inspected in the preflight ACL query; has_function_privilege('public', ...)
-- may not represent the pseudo-role as intended on all PostgreSQL versions.

-- 3) Aggregate integrity check for response-to-case linkage.
-- Historical responses may predate this workflow; review counts, do not auto-fix.
SELECT
  count(*) AS total_response_rows,
  count(*) FILTER (WHERE c.id IS NOT NULL) AS responses_with_matching_case,
  count(*) FILTER (WHERE c.id IS NULL) AS responses_without_matching_case
FROM public.survey_responses sr
LEFT JOIN public.cases c ON c.id = sr.id::text;

-- 4) Check duplicate non-null submission IDs per survey.
-- The unique partial index should prevent any returned groups.
SELECT count(*) AS duplicate_survey_submission_groups
FROM (
  SELECT survey_id, submission_id
  FROM public.survey_responses
  WHERE submission_id IS NOT NULL
  GROUP BY survey_id, submission_id
  HAVING count(*) > 1
) duplicates;

-- 5) Confirm the function definition contains the simulation/test guard.
-- This reports only a boolean and does not expose tokens or patient data.
SELECT
  position('SIM-%' IN pg_get_functiondef(p.oid)) > 0 AS blocks_simulation_investigations,
  position('TEST-%' IN pg_get_functiondef(p.oid)) > 0 AS blocks_test_investigations
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'submit_public_survey'
  AND pg_get_function_identity_arguments(p.oid) = 'p_token text, p_payload jsonb, p_respondent_device text, p_submission_id uuid';
