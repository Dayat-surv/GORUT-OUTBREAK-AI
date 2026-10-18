'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261010_public_survey_dashboard_rpc.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');
const normalized = sql.replace(/\s+/g, ' ').toLowerCase();

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

console.log('Supabase RPC static security contract passed (7 checks).');

// This static check cannot prove the live schema or row-level access behavior.
// Keep the known response-to-case join visible until it is verified against
// the deployed foreign keys and tested with separate owner/non-owner accounts.
if (/left join public\.cases c on c\.id\s*=\s*sr\.id::text/.test(normalized)) {
  console.warn('REVIEW REQUIRED: response-to-case JOIN uses response ID as case ID; verify against the live schema before operational use.');
}
