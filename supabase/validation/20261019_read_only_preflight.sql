-- READ-ONLY preflight for GORUT-OUTBREAK-AI.
-- Run this in Supabase SQL Editor BEFORE applying any migration.
-- These statements inspect schema/security metadata and counts only.
-- They do not INSERT, UPDATE, DELETE, ALTER, or reveal patient-identifying fields.

-- 1) Confirm required tables and their columns exist.
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'survey_responses', 'public_surveys', 'questionnaires',
    'investigations', 'cases'
  )
ORDER BY table_name, ordinal_position;

-- 2) Inspect current submit_public_survey overloads and their security settings.
SELECT
  p.oid::regprocedure AS function_signature,
  p.prosecdef AS security_definer,
  p.proconfig AS function_settings,
  pg_get_userbyid(p.proowner) AS owner_name
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'submit_public_survey'
ORDER BY p.oid::regprocedure::text;

-- 3) Inspect grants for all submit_public_survey overloads.
SELECT
  p.oid::regprocedure AS function_signature,
  grantee.rolname AS grantee,
  privilege.privilege_type
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
CROSS JOIN LATERAL aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) AS privilege
JOIN pg_roles grantee ON grantee.oid = privilege.grantee
WHERE n.nspname = 'public'
  AND p.proname = 'submit_public_survey'
ORDER BY function_signature::text, grantee.rolname, privilege.privilege_type;

-- 4) Inspect RLS enabled/forced status for relevant tables.
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'p')
  AND c.relname IN (
    'survey_responses', 'public_surveys', 'questionnaires',
    'investigations', 'cases'
  )
ORDER BY c.relname;

-- 5) List policies only (no row data).
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'survey_responses', 'public_surveys', 'questionnaires',
    'investigations', 'cases'
  )
ORDER BY tablename, policyname;

-- 6) Count active public surveys and test/simulation investigation links.
-- Counts only; does not display tokens, names, case details, or payloads.
SELECT
  count(*) FILTER (WHERE s.is_active IS TRUE
    AND (s.expires_at IS NULL OR s.expires_at > now())) AS active_unexpired_surveys,
  count(*) FILTER (WHERE s.investigation_id LIKE 'TEST-%') AS test_linked_surveys,
  count(*) FILTER (WHERE s.investigation_id LIKE 'SIM-%') AS simulation_linked_surveys
FROM public.public_surveys s;

-- 7) Count historical response records only; no payload or identifiers shown.
SELECT count(*) AS existing_survey_response_rows
FROM public.survey_responses;
