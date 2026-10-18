# Supabase release preflight (read-only)

This folder contains a **read-only** SQL checklist for validating the existing Supabase project before applying the public-survey migration.

## Run the checks

1. Open the Supabase project already used by GORUT-OUTBREAK-AI.
2. Open **SQL Editor** and create a new query.
3. Open `20261019_read_only_preflight.sql` in this repository and copy its contents into the SQL Editor.
4. Run the query statements one at a time. Review the results before changing anything.
5. Save/export only schema and security metadata if you need to share results. **Do not share patient names, case identifiers, survey tokens, response payloads, API keys, or screenshots containing them.**

## What to check

- The required tables and columns exist, including `survey_responses.id`, `survey_responses.survey_id`, `survey_responses.payload`, and the case fields used by the migration.
- Existing `submit_public_survey` overloads are understood before replacing permissions.
- RLS and table policies are present and consistent with the project's existing access model.
- Existing response row count is recorded for comparison; the query does not read response contents.
- No active public survey points to a `TEST-%` or `SIM-%` investigation.

## Important safety boundary

The preflight is read-only. It does **not** apply the migration, modify RLS, enable public data collection, or write/delete operational data.

The migration `../migrations/20261019_allow_validated_disease_module_metadata.sql` must be reviewed and applied separately by an authorized project administrator only after the preflight output confirms that the schema matches. Keep `publicSurveyEnabled: false` until the migration is applied and live end-to-end checks pass.

Do not use real patient data to test. Use a dedicated, non-production survey/investigation and synthetic records. Test that retries are idempotent, a response links to exactly one case, test/simulation investigations are rejected, and the client queue is retained unless the server confirms success.


## After the migration

Only after the migration finishes without SQL errors, run `20261019_read_only_postflight.sql` in SQL Editor. Review these outputs:

- `submission_id_uuid_column_exists` and `idempotency_index_exists` should both be `true`.
- The four-argument RPC should be `SECURITY DEFINER`, have an empty `search_path`, and be executable by `anon` and `authenticated` as intended. Review the preflight ACL output for accidental PUBLIC grants.
- Review the response-to-case linkage counts. Historical rows may need interpretation; do not repair them automatically.
- `duplicate_survey_submission_groups` should be zero.
- The function definition checks should show both test and simulation guards.

These are database metadata/integrity checks, **not** an end-to-end submission test. Do not enable public submissions until a separate synthetic-only acceptance test confirms successful insert, idempotent retry, correct case linkage, rejected test/simulation investigations, and retained client queue on failure.
