'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261010_public_survey_dashboard_rpc.sql');
const submitMigrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261010_submit_public_survey_idempotency.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');
const submitSql = fs.readFileSync(submitMigrationPath, 'utf8');
const normalized = sql.replace(/\\s+/g, ' ').toLowerCase();
const normalizedSubmit = submitSql.replace(/\\s+/g, ' ').toLowerCase();

assert.match(normalized, /create or replace function public\\.get_my_public_survey_submissions\\(\\)/,
  'dashboard RPC must be explicitly declared');
assert.match(normalized, /security definer/,
  'RPC must retain its reviewed SECURITY DEFINER declaration');
assert.match(normalized, /set search_path\\s*=\\s*''/,
  'SECURITY DEFINER function must pin search_path to an empty path');
assert.match(normalized, /where auth\\.uid\\(\\) is not null/,
  'RPC must reject anonymous sessions');
assert.match(normalized, /i\\.owner_id\\s*=\\s*auth\\.uid\\(\\)/,
  'RPC must scope returned investigations to the authenticated owner');
assert.match(normalized, /revoke all on function public\\.get_my_public_survey_submissions\\(\\) from public/,
  'RPC execution must be revoked from PUBLIC');
assert.match(normalized, /grant execute on function public\\.get_my_public_survey_submissions\\(\\) to authenticated/,
  'RPC execution should be granted only to authenticated role');
assert.match(normalized, /left join public\\.cases c on c\\.id\\s*=\\s*sr\\.id::text/,
  'dashboard RPC must retain the documented response-ID-to-case-ID join convention');
assert.match(normalizedSubmit, /v_case_id\\s*:=\\s*v_response_id::text/,
  'submission RPC must derive the case ID from the newly inserted response ID');
assert.match(normalizedSubmit, /insert into public\\.cases \\( id, owner_id, investigation_id, case_code, full_name, age, sex, onset_date, status, outcome, latitude, longitude, questionnaire_response \\) values \\( v_case_id,/,
  'submission RPC must insert the case using the response-derived case ID');

console.log('Supabase RPC static contract passed (10 checks).');
console.warn('LIVE CHECK STILL REQUIRED: static tests cannot confirm that these migrations are applied or that deployed rows match the ID convention.');
