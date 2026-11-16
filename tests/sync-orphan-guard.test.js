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

assert.match(app, /function resolveCaseDiseaseId\(value\)/,
  'case form must normalize disease IDs and disease display names');
assert.match(app, /resolveCaseDiseaseId\(act\(\)\?\.disease\)/,
  'active investigation disease must be resolved before questionnaire loading');
assert.match(app, /String\(d\.name\)\.trim\(\)\.toLowerCase\(\)===raw\.toLowerCase\(\)/,
  'display-name disease values must map to canonical questionnaire IDs');
assert.match(app, /function ensureCaseQuestionnaire\(c=\{\}\)/,
  'case form must ensure a questionnaire is loaded for the active disease');
assert.match(app, /function questionnaireCasePanel\(c=\{\}\)\{ensureCaseQuestionnaire\(c\);/,
  'case panel must synchronize disease questionnaire before rendering');
assert.match(app, /function modal\(x\)\{modalbox\.innerHTML='<div class="modal-close-row"><button type="button" class="modal-close-btn" onclick="closeAppModal\(\)"/,
  'all modal forms must expose a close button that closes the modal');
assert.match(fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8'), /\.modal-close-row\{position:sticky/,
  'modal close control must remain visible while scrolling long forms');
assert.match(app, /const canonical=filterIntegratedCoreQuestions\(\[\s*\.\.\.baseQ\.map\(q=>buildQuestion\(q\[1\],q\[0\]\)\)/,
  'case form must reconstruct the standard instrument while excluding integrated core fields');
assert.match(app, /'id kasus','nama lengkap','umur','jenis kelamin','tanggal onset gejala'[\s\S]*?'puskesmas','latitude','longitude'/,
  'integrated identity, clinical status/outcome, administrative address, and coordinates must be excluded from disease questions');
assert.match(app, /db\.questions=filterIntegratedCoreQuestions\(db\.questions\)/,
  'the disease questionnaire menu must also exclude fields handled by the integrated case form');
assert.match(app, /!m\|\|m\.querySelector\('#v46RiskHint'\)/,
  'the automatic risk-factor explanation must be inserted at most once per case form');
assert.match(app, /const complete=canonical\.map\(q=>existingByLabel\.get\(normLabel\(q\.label\)\)\|\|q\)/,
  'case form must restore missing canonical questions even when a partial questionnaire is already stored');
assert.match(app, /const extras=existing\.filter\(q=>q&&q\.label&&!isIntegratedCoreQuestion\(q\)&&!canonicalKeys\.has\(normLabel\(q\.label\)\)\)/,
  'case form must preserve custom questions while excluding duplicates handled by integrated fields');
assert.match(app, /db\.questions=next;/,
  'the completed questionnaire must be the list used to render and collect case answers');

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


// Full disease-catalogue semantic regression: generic onset/status/outcome are
// owned by the integrated case form; disease-specific onset/clinical criteria,
// exposure, specimen, laboratory, and classification questions must remain.
const vm = require('node:vm');
const diseaseStart = app.indexOf('const diseases={');
const diseaseEnd = app.indexOf('\n};', diseaseStart);
assert.ok(diseaseStart >= 0 && diseaseEnd > diseaseStart, 'disease catalogue must exist');
const diseaseLiteral = app.slice(diseaseStart + 'const diseases='.length, diseaseEnd + 2);
const diseaseCatalogue = vm.runInNewContext('(' + diseaseLiteral + ')');
const integratedGenericLabels = new Set([
  'id kasus','nama lengkap','umur','jenis kelamin','tanggal onset gejala',
  'tanggal onset','status kasus','status kesehatan','outcome',
  'alamat lengkap','alamat lengkap tempat tinggal/kejadian',
  'provinsi','kabupaten','kabupaten/kota','kecamatan','desa/kelurahan',
  'puskesmas','latitude','longitude'
]);
const diseaseEntries = Object.entries(diseaseCatalogue);
assert.equal(diseaseEntries.length, 34, 'audit must cover all 34 configured diseases/syndromes');
const duplicateCounts = {'tanggal onset':0,'status kasus':0,'outcome':0};
for (const [diseaseId, disease] of diseaseEntries) {
  assert.ok(Array.isArray(disease.q) && disease.q.length > 0, diseaseId + ' must retain disease-specific questions');
  const normalized = disease.q.map(q => String(q).trim().toLowerCase());
  assert.equal(new Set(normalized).size, normalized.length, diseaseId + ' must not contain repeated question labels');
  for (const label of normalized) if (Object.hasOwn(duplicateCounts, label)) duplicateCounts[label]++;
  const effectiveQuestions = disease.q.filter(q => !integratedGenericLabels.has(String(q).trim().toLowerCase()));
  assert.ok(effectiveQuestions.every(q => !integratedGenericLabels.has(String(q).trim().toLowerCase())),
    diseaseId + ' must exclude integrated generic fields from the rendered disease questionnaire');
}
assert.deepEqual(duplicateCounts, {'tanggal onset':27,'status kasus':18,'outcome':34},
  'catalogue duplicate baseline must remain explicit and filtered by the integrated-field layer');
const campakQuestions = diseaseCatalogue.campak.q;
for (const label of ['Tanggal onset demam','Tanggal onset ruam','Klasifikasi kasus','Spesimen serum','Hasil laboratorium']) {
  assert.ok(campakQuestions.includes(label), 'measles-specific question must be preserved: ' + label);
}
for (const label of ['Tanggal onset kelumpuhan','Spesimen tinja pertama','Spesimen tinja kedua','Klasifikasi akhir']) {
  assert.ok(diseaseCatalogue.afp.q.includes(label), 'AFP-specific investigation question must be preserved: ' + label);
}
assert.match(app, /db\.questions=filterIntegratedCoreQuestions\(db\.questions\)/,
  'the actual questionnaire loader must apply the integrated-field filter');
assert.match(app, /!m\|\|m\.querySelector\('#v46RiskHint'\)/,
  'risk-factor hint insertion must be idempotent for a case modal');
assert.equal((app.match(/id='v46RiskHint'/g) || []).length, 1,
  'the case modal must define only one risk-factor hint element');
console.log('Disease catalogue semantic duplicate checks passed (34 diseases; 79 generic duplicate entries filtered).');
