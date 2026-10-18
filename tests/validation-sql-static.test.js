'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'supabase', 'validation');
const preflight = fs.readFileSync(path.join(root, '20261019_read_only_preflight.sql'), 'utf8').toLowerCase();
const postflight = fs.readFileSync(path.join(root, '20261019_read_only_postflight.sql'), 'utf8').toLowerCase();
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');

function assertReadOnly(sql, label) {
  // Strip SQL comments before checking executable statements.
  const executable = sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(executable, /\b(insert\s+into|update\s+\w|delete\s+from|alter\s+table|drop\s+(table|function|index)|create\s+(table|index|function)|truncate\s+table)\b/i,
    label + ' must remain read-only');
  assert.match(executable, /\bselect\b/i, label + ' must contain inspection queries');
}

assertReadOnly(preflight, 'Supabase preflight');
assertReadOnly(postflight, 'Supabase postflight');
assert.match(preflight, /information_schema\.columns/, 'preflight must inspect schema columns');
assert.match(preflight, /pg_policies/, 'preflight must inspect RLS policies');
assert.match(preflight, /submit_public_survey/, 'preflight must inspect submission RPC');
assert.match(postflight, /submission_id_uuid_column_exists/, 'postflight must check submission_id column');
assert.match(postflight, /idempotency_index_exists/, 'postflight must check idempotency index');
assert.match(postflight, /duplicate_survey_submission_groups/, 'postflight must check duplicate submission groups');
assert.match(postflight, /sim-%/, 'postflight must check simulation guard');
assert.match(postflight, /test-%/, 'postflight must check test guard');
assert.match(readme, /publicSurveyEnabled: false/, 'instructions must keep public survey disabled until live validation passes');

console.log('Supabase validation SQL static checks passed: read-only queries, schema/RLS inspection, idempotency, linkage and test/simulation guard checks.');
