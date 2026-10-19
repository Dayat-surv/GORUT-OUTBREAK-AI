# Staging: public survey end-to-end test (2026-10-19)

## Safety boundary

- This branch is isolated from `main`; it is not deployed by the current GitHub Pages workflow.
- The branch's `backend-config.js` has been changed to placeholders with `enabled: false` and `publicSurveyEnabled: false`. It must not be published as-is.
- Do not change production `backend-config.js`; keep production `publicSurveyEnabled: false`.
- Use only synthetic data in the separate `GORUT-OUTBREAK-AI-STAGING` Supabase project.
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

1. The separate staging Supabase project `GORUT-OUTBREAK-AI-STAGING`.
2. Its project URL and public anon/publishable key (never a service-role key).
3. A separately hosted staging page wired only to this staging project. The existing Pages workflow deploys only `main`; do not deploy this branch through the existing Pages environment because it could replace the production site.
4. A new synthetic test survey token, active only for the duration of the HTTP test.

After receiving the staging URL and public key, replace the placeholders in this branch's `backend-config.js` with those staging-only values. Keep both flags false while checking the target project and page isolation. Enable the public survey only on the isolated staging copy for the short test window, then set it back to false and deactivate the survey.

## Acceptance checklist

- [ ] Confirm staging config URL points to the staging project, not production.
- [ ] Confirm the staging page is hosted separately from production.
- [ ] Anonymous request can load survey metadata while it is active.
- [ ] Invalid token does not reveal survey metadata.
- [ ] A single synthetic submission returns success.
- [ ] Retrying with the same submission UUID returns the same response/case IDs and creates no duplicate.
- [ ] Invalid token submission is rejected.
- [ ] Inactive or expired survey submission is rejected.
- [ ] Postflight counts show exactly one response and one case for the synthetic submission.
- [ ] The test survey is deactivated again and public survey flag is disabled.
- [ ] Production configuration and production data remain unchanged.
