'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261030054310_staging_public_survey_dashboard_case_link_fix_v1.sql');
const submitMigrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261010_submit_public_survey_idempotency.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');
const submitSql = fs.readFileSync(submitMigrationPath, 'utf8');
const normalized = sql.replace(/\s+/g, ' ').toLowerCase();
const normalizedSubmit = submitSql.replace(/\s+/g, ' ').toLowerCase();

assert.match(normalized, /create or replace function public\.get_my_public_survey_submissions\(\)/,
  'dashboard RPC must be explicitly declared');
assert.match(normalized, /security definer/,
  'RPC must retain its reviewed SECURITY DEFINER declaration');
assert.match(normalized, /set search_path\s*=\s*''/,
  'SECURITY DEFINER function must pin search_path to an empty path');
assert.match(normalized, /where auth\.uid\(\) is not null/,
  'RPC must reject anonymous sessions');
assert.match(normalized, /i\.owner_id\s*=\s*auth\.uid\(\)/,
  'RPC must scope returned investigations to the authenticated owner');
assert.match(normalized, /revoke all on function public\.get_my_public_survey_submissions\(\) from public/,
  'RPC execution must be revoked from PUBLIC');
assert.match(normalized, /grant execute on function public\.get_my_public_survey_submissions\(\) to authenticated/,
  'RPC execution should be granted only to authenticated role');
assert.match(normalized, /left join public\.cases c on c\.id\s*=\s*sr\.id::text/,
  'dashboard RPC must retain the documented response-ID-to-case-ID join convention');
assert.match(normalizedSubmit, /v_case_id\s*:=\s*v_response_id::text/,
  'submission RPC must derive the case ID from the newly inserted response ID');
assert.match(normalizedSubmit, /insert into public\.cases \( id, owner_id, investigation_id, case_code, full_name, age, sex, onset_date, status, outcome, latitude, longitude, questionnaire_response \) values \( v_case_id,/,
  'submission RPC must insert the case using the response-derived case ID');


const persistenceMigrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261019_allow_validated_disease_module_metadata.sql');
const persistenceSql = fs.readFileSync(persistenceMigrationPath, 'utf8');
const normalizedPersistence = persistenceSql.replace(/\s+/g, ' ').toLowerCase();
assert.match(normalizedPersistence, /insert into public\.survey_responses \( survey_id, submission_id, respondent_device, payload \)/,
  'each successful submission must be stored as its own survey_responses row');
assert.match(normalizedPersistence, /insert into public\.cases \( id, owner_id, investigation_id, case_code, full_name, age, sex, onset_date, status, outcome, latitude, longitude, questionnaire_response \)/,
  'each survey response must create a linked initial case record for line listing');
assert.match(normalizedPersistence, /input_key\.key = 'disease_module'/,
  'disease module metadata must be recognized separately from question IDs');
assert.match(normalizedPersistence, /module\.item ->> 'id' = p_payload ->> 'disease_module'/,
  'only a disease module declared in the questionnaire schema may be submitted');
assert.match(normalizedPersistence, /upper\(s\.investigation_id\) not like 'test-%' and upper\(s\.investigation_id\) not like 'sim-%'/, 'public submission RPC must reject test and simulation investigations regardless of ID casing');
assert.match(normalizedPersistence, /create unique index if not exists survey_responses_survey_submission_uidx/,
  'submission retries must be idempotent and not duplicate a response');

console.log('Supabase RPC and questionnaire persistence static contract passed.');
console.warn('LIVE CHECK STILL REQUIRED: static tests cannot confirm that these migrations are applied or that deployed rows match the ID convention.');
