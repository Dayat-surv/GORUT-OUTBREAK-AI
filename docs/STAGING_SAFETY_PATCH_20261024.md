# Staging safety patch — 2026-10-24

## Scope
- Branch: `staging/safety-preflight-20261024`
- Base: `staging/public-survey-e2e-20261019`
- This patch is staging-only. It does not modify Supabase schema, rows, production branches, or production configuration.

## Changes in `app.js`
1. `syncNow()` now checks that all six operational tables are queryable before the first upsert: `investigations`, `alerts`, `cases`, `contacts`, `specimens`, and `field_visits`. If any check fails, sync aborts before writes and reports the blocked tables.
2. `publicQ()` checks access to `investigations`, `questionnaires`, and `public_surveys` before its first write. If any check fails, survey creation aborts before creating an investigation or questionnaire.
3. New `public_surveys` rows explicitly set `is_active: true`; the public survey still cannot be used unless the database function's other validity conditions pass.

## Verification status
- Static patch anchors verified before write.
- GitHub accepted the updated file on this branch.
- No browser/runtime tests have been run from this change.
- No Supabase SQL was executed and no database records were written.
- Do not enable backend or public surveys yet.

## Required next tests
1. Run JavaScript syntax check and app smoke test in staging preview.
2. Confirm the preflight aborts cleanly when any required table is absent or inaccessible.
3. Confirm no rows are created when survey-table preflight fails.
4. Confirm survey creation sets `is_active=true` only after all preflight checks pass.
5. Test the RPC using synthetic data only after a separate explicit approval; verify retry idempotency and the response/case ID relationship.
6. Fix/verify schema and RLS policies for the six operational tables before enabling operational sync.
7. Verify public survey access, RLS, and data minimization before enabling public submissions.
