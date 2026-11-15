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

// Case-form helpers are declared inside the v40 closure but are consumed by
// later questionnaire wrappers. Expose the helper explicitly to avoid a
// ReferenceError that prevents the Add/Edit Case modal from opening.
assert.match(app, /window\.addressFields=addressFields;/,
  'addressFields must be exposed for later case-form wrappers');
assert.match(app, /\+window\.addressFields\(\{\}\)\+extraFood\+extraPriority\+qPanel/,
  'Add Case questionnaire wrapper must call the exposed address helper');
assert.match(app, /\+window\.addressFields\(c\)\+extraFood\+extraPriority\+qPanel/,
  'Edit Case questionnaire wrapper must call the exposed address helper');

assert.match(app, /function ensureCaseQuestionnaire\(c=\{\}\)/,
  'case form must ensure a questionnaire is loaded for the active disease');
assert.match(app, /function questionnaireCasePanel\(c=\{\}\)\{ensureCaseQuestionnaire\(c\);/,
  'case panel must synchronize disease questionnaire before rendering');
assert.match(app, /loadedDisease!==diseaseId\|\|!Array\.isArray\(db\.questions\)\|\|!db\.questions\.length/,
  'case form must reload missing or mismatched questionnaire data');

console.log('Sync orphan-guard regression checks passed.');


// Public questionnaire creation must remain blocked while the explicit
// publicSurveyEnabled feature flag is false, without creating survey rows.
const publicQStart = app.indexOf('async function publicQ(){');
const publicQEnd = app.indexOf('\nfunction copyText', publicQStart + 30);
assert.ok(publicQStart >= 0 && publicQEnd > publicQStart, 'publicQ function must exist');
const publicQ = app.slice(publicQStart, publicQEnd);
assert.match(publicQ, /surveyConfig\.enabled!==true\|\|surveyConfig\.publicSurveyEnabled!==true/,
  'public questionnaire creation must require both backend and public survey flags');
assert.ok(publicQ.indexOf('surveyConfig.publicSurveyEnabled!==true') < publicQ.indexOf('await backendClient()'),
  'public survey feature gate must run before backend client access');
assert.ok(publicQ.indexOf('surveyConfig.publicSurveyEnabled!==true') < publicQ.indexOf("from('questionnaires').insert"),
  'public survey feature gate must run before questionnaire creation');
const publicSurveyHtml = fs.readFileSync(path.join(__dirname, '..', 'public_survey.html'), 'utf8');
assert.match(publicSurveyHtml, /Fitur kuesioner publik sedang dinonaktifkan selama audit keamanan/,
  'public survey page must accurately explain that the feature is disabled for security review');
assert.doesNotMatch(publicSurveyHtml, /Formulir online belum tersedia karena backend belum dikonfigurasi/,
  'public survey page must not misdiagnose a disabled feature as missing backend configuration');
