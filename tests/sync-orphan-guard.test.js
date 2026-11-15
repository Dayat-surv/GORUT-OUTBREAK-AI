'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const start = app.indexOf('async function syncNow(){');
const end = app.indexOf('\nfunction ', start + 30);
assert.ok(start >= 0 && end > start, 'syncNow function must exist');
const sync = app.slice(start, end);

// Every child collection must report an orphan as a failed sync item.
// Otherwise syncNow could clear its queue and claim success while silently
// skipping data that has no corresponding parent investigation.
const orphanGuards = [
  'if(!db.investigations.find(i=>i.id===c.investigationId)){fail++;continue;}',
  'if(!db.investigations.find(i=>String(i.id)===String(s.investigationId))){fail++;continue;}',
  'if(!db.investigations.find(i=>i.id==v.investigationId)){fail++;continue;}'
];
assert.equal(sync.split(orphanGuards[0]).length - 1, 2,
  'cases and contacts must each count an orphan as a sync failure');
assert.equal(sync.split(orphanGuards[1]).length - 1, 1,
  'specimens must count an orphan as a sync failure');
assert.equal(sync.split(orphanGuards[2]).length - 1, 1,
  'field visits must count an orphan as a sync failure');
assert.equal((sync.match(/fail\+\+;continue;/g) || []).length, 4,
  'all four child collection skip paths must increment the failure count');
assert.match(sync, /if\(fail===0\)\{syncQueue=\[\];/,
  'the sync queue may only be cleared when there are no failed or skipped records');

console.log('Sync orphan-guard regression checks passed.');
