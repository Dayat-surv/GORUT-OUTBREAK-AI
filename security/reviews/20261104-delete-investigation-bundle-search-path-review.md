# Review proposal — harden delete_investigation_bundle search_path

**Status: PROPOSAL ONLY — DO NOT EXECUTE OR APPLY.**

Scope: STAGING review branch only. This document proposes a minimal hardening of the existing
`public.delete_investigation_bundle(text)` function. It does not change the database, application
runtime, backend configuration, or operational records.

## Finding

The current function is `SECURITY DEFINER` and sets:

```sql
SET search_path = pg_catalog, public, auth
```

The inspected function body already schema-qualifies application objects:
- `auth.uid()`
- `public.investigations`, `public.cases`, `public.contacts`,
  `public.specimens`, `public.field_visits`, `public.public_surveys`,
  `public.survey_responses`, and `public.audit_log`
- `information_schema.columns`

Built-in PostgreSQL functions/operators remain available from the implicit
`pg_catalog` lookup. Therefore an empty search path is compatible with the
currently inspected function body and reduces the chance of resolving an
unqualified object from a writable schema.

## Proposed minimal SQL change

Only after independent review and explicit approval, apply this single statement
to the **STAGING** project:

```sql
ALTER FUNCTION public.delete_investigation_bundle(text)
  SET search_path = '';
```

This changes the function configuration only. It does not replace the function
body or alter its ownership/authorization logic. Preserve the existing ACL:
- revoke execution from `PUBLIC`
- revoke execution from `anon`
- grant execution to `authenticated`

Do not broaden these grants.

## Read-only preflight and post-change verification

Before applying, confirm the function signature, owner, body, and existing grants
still match the reviewed version. After an approved STAGING-only change, verify:

```sql
select
  p.prosecdef as security_definer,
  p.proconfig as function_settings,
  p.proacl as function_acl,
  pg_get_userbyid(p.proowner) as function_owner,
  pg_get_functiondef(p.oid) as function_definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'delete_investigation_bundle'
  and pg_get_function_identity_arguments(p.oid) = 'p_investigation_id text';

select
  has_function_privilege('anon',
    'public.delete_investigation_bundle(text)', 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated',
    'public.delete_investigation_bundle(text)', 'EXECUTE') as authenticated_can_execute;
```

Expected: `search_path=""`, `SECURITY DEFINER` remains true, owner remains
`postgres`, anon cannot execute, and authenticated can execute.

The Supabase Security Advisor may continue to report this function because it
remains a callable `SECURITY DEFINER` RPC. This proposal does not suppress or
misrepresent that warning; the owner check and privileged deletion behavior
still require explicit security acceptance.

## Rollback proposal

If the empty search path causes an unexpected issue, the inspected previous
setting can be restored with:

```sql
ALTER FUNCTION public.delete_investigation_bundle(text)
  SET search_path = pg_catalog, public, auth;
```

## Required tests after separate approval

1. Re-run the static review and verify the function body has not changed.
2. Test unauthenticated execution is denied.
3. Test a different authenticated user is denied for an investigation they do not own.
4. Test owner deletion only against a newly approved synthetic STAGING investigation.
5. Verify the audit row and dependent-row counts; confirm the public-survey feature flag remains false.
6. Re-run the Security Advisor and document the remaining `SECURITY DEFINER` warning.

## Explicit safety boundaries

- This is a review note, **not a Supabase migration**; it is deliberately outside
  `supabase/migrations/`.
- No SQL has been applied by adding this file.
- Do not merge this review branch into production or deploy it.
- Do not change production configuration or data.
- Keep `publicSurveyEnabled: false`; do not enable surveys or global sync.
- Preserve the existing synthetic investigation; do not delete it for testing.
