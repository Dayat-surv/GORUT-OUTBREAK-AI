# Staging: public survey end-to-end test (2026-10-19)

## Safety boundary

- This branch is isolated from `main`; it is not deployed by the current GitHub Pages workflow.
- Do not change production `backend-config.js`; keep `publicSurveyEnabled: false`.
- Use only synthetic data in a separate staging Supabase project.
- Never place a Supabase `service_role` or secret key in browser code, this branch, issues, or logs.
- Do not enable a public test survey until anonymous load, submit, retry/idempotency, invalid-token rejection, inactive-survey rejection, and postflight counts all pass.

## Current staging database result

The controlled SQL test reported:
- Investigation: `STAGE-CAMPAK-001`
- Survey: `UJI STAGING — SURVEI SINTETIS`
- Survey active after test: `false`
- Responses: `1`
- Cases: `1`

This proves the SQL-level transaction path only. The HTTP/browser path has not yet been verified.

## Required prerequisites for HTTP/browser testing

1. A staging Supabase project that is separate from production.
2. The staging project URL and its public anon/publishable key (never a service-role key).
3. The staging site URL or a separately hosted staging page wired only to that staging project.
4. A newly created synthetic test survey token, active only for the duration of the HTTP test.

The existing Pages workflow deploys only `main`. Do not deploy this branch through the existing Pages environment because it could replace the production site.

## Acceptance checklist

- [ ] Anonymous request can load the survey metadata while it is active.
- [ ] Invalid token does not reveal survey metadata.
- [ ] A single synthetic submission returns success.
- [ ] Retrying with the same submission UUID returns the same response/case IDs and creates no duplicate.
- [ ] Invalid token submission is rejected.
- [ ] Inactive or expired survey submission is rejected.
- [ ] Postflight counts show exactly one response and one case for the synthetic submission.
- [ ] The test survey is deactivated again.
- [ ] Production configuration and production data remain unchanged.
