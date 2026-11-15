'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const start = app.indexOf('async function syncNow(){');
const end = app.indexOf('\nfunction ', start + 30);
assert.ok(start >= 0 && end > start, 'syncNow function must exist');
const sync = app.slice(start, end);

// Child records must use the actual server ID of their parent. Never fabricate
// a foreign key from a local ID when the parent upsert has not succeeded.
assert.match(sync, /const invForCase=db\.investigations\.find\(i=>String\(i\.id\)===String\(c\.investigationId\)\);if\(!invForCase\?\.serverId\)\{fail\+\+;continue;\}/,
  'cases must match local parent IDs as strings and require the real server investigation ID');
assert.match(sync, /const invForContact=db\.investigations\.find\(i=>String\(i\.id\)===String\(c\.investigationId\)\);const linkedCase=c\.caseId\?db\.cases\.find\(x=>String\(x\.id\)===String\(c\.caseId\)\):null;if\(!invForContact\?\.serverId\|\|\(c\.caseId&&!linkedCase\?\.serverId\)\)\{fail\+\+;continue;\}/,
  'contacts must require real server IDs for their investigation and any linked case');
assert.match(sync, /const invForSpecimen=db\.investigations\.find\(i=>String\(i\.id\)===String\(s\.investigationId\)\);const linkedSpecimenCase=s\.caseId\?db\.cases\.find\(x=>String\(x\.id\)===String\(s\.caseId\)\):null;if\(!invForSpecimen\?\.serverId\|\|\(s\.caseId&&!linkedSpecimenCase\?\.serverId\)\)\{fail\+\+;continue;\}/,
  'specimens must require real server IDs for their investigation and any linked case');
assert.match(sync, /const invForVisit=db\.investigations\.find\(i=>String\(i\.id\)===String\(v\.investigationId\)\);if\(!invForVisit\?\.serverId\)\{fail\+\+;continue;\}/,
  'field visits must match local parent IDs as strings and require the real server investigation ID');
assert.match(sync, /index_case_id:c\.caseId\?linkedCase\.serverId:null/,
  'contacts must not fabricate a foreign key when the linked case has no server ID');
assert.match(sync, /case_id:s\.caseId\?linkedSpecimenCase\.serverId:null/,
  'specimens must not fabricate a foreign key when the linked case has no server ID');
assert.match(sync, /if\(fail===0\)\{syncQueue=\[\];/,
  'the sync queue may only be cleared when there are no failed or skipped records');


assert.match(sync, /const auth=await sb\.auth\.getUser\(\);[\s\S]*?if\(auth\.error\|\|!auth\.data\?\.user\)/,
  'syncNow must validate the Supabase auth result before reading user.id');
assert.match(sync, /catch\(error\)[\s\S]*?Antrean lokal dipertahankan/,
  'unexpected auth/network exceptions must be caught and report that the local queue is preserved');

console.log('Sync orphan-guard regression checks passed.');
