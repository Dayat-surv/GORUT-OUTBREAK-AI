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
const caseFormStart = app.indexOf('function answerByLabels45');
const caseFormEnd = app.indexOf('const oldLoad=window.loadDiseaseQuestions', caseFormStart);
assert.ok(caseFormStart >= 0 && caseFormEnd > caseFormStart, 'final integrated Add/Edit Case wrapper must exist');
const caseFormWrapper = app.slice(caseFormStart, caseFormEnd);
assert.doesNotMatch(caseFormWrapper, /f\('ID','cid'|f\('Nama','cn'|f\('Umur','ca'|f\('Jenis kelamin','cs'|f\('Onset','co'|f\('Status','ct'|f\('Outcome','cu'|window\.addressFields/,
  'identity, onset, status, outcome, and address fields must not be duplicated before the integrated questionnaire');
assert.match(caseFormWrapper, /questionnaireCasePanel\(draft\)/,
  'Add Case must render the integrated questionnaire as the single source of core case fields');
assert.match(caseFormWrapper, /questionnaireCasePanel\(c\)/,
  'Edit Case must render the integrated questionnaire as the single source of core case fields');
assert.match(caseFormWrapper, /bridgeQuestionnaireAnswers45\(answers,\{\},'add'\)/,
  'Add Case must bridge integrated answers to legacy structured case fields before save');
assert.match(caseFormWrapper, /bridgeQuestionnaireAnswers45\(answers,c,'edit'\)/,
  'Edit Case must bridge integrated answers to legacy structured case fields before update');

assert.match(app, /function resolveCaseDiseaseId\(value\)/,
  'case form must normalize disease IDs and disease display names');
assert.match(app, /resolveCaseDiseaseId\(act\(\)\?\.disease\)/,
  'active investigation disease must be resolved before questionnaire loading');
assert.match(app, /String\(d\.name\)\.trim\(\)\.toLowerCase\(\)===raw\.toLowerCase\(\)/,
  'display-name disease values must map to canonical questionnaire IDs');
assert.match(app, /function ensureCaseQuestionnaire\(c=\{\}\)/,
  'case form must ensure a questionnaire is loaded for the active disease');
assert.match(app, /function questionnaireCasePanel\(c=\{\}\)\{[\s\S]*?ensureCaseQuestionnaire\(c\);ensureQuestionIds\(\)/,
  'case panel must synchronize disease questionnaire before rendering');
assert.match(app, /function questionnaireAnswersForCase\(c=\{\}\)/,
  'integrated core fields must be prefilled from existing structured case data when editing');
assert.match(app, /function bridgeQuestionnaireAnswers45\(answers,c=\{\},mode='add'\)/,
  'integrated answers must bridge to legacy case persistence fields without duplicate visible inputs');
assert.match(app, /function nextCaseId45\(\)/,
  'new case ID must be generated in the integrated ID question');
assert.match(app, /const idQuestion=\(db\.questions\|\|\[\]\)\.find\(q=>questionLabelKey45\(q\.label\)==='idkasus'\);[\s\S]*?answers\[idQuestion\.id\]=id/,
  'a generated case ID must also be stored in case.answers if the user clears the ID input');
assert.match(app, /function modal\(x\)\{modalbox\.innerHTML='<div class="modal-close-row"><button type="button" class="modal-close-btn" onclick="closeAppModal\(\)"/,
  'all modal forms must expose a close button that closes the modal');
assert.match(fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8'), /\.modal-close-row\{position:sticky/,
  'modal close control must remain visible while scrolling long forms');
assert.match(app, /const canonical=\[\s*\.\.\.baseQ\.map\(q=>buildQuestion\(q\[1\],q\[0\]\)\)[\s\S]*?filterIntegratedCoreQuestions\(\(Array\.isArray\(disease\.q\)/,
  'case form must retain all integrated base questions while filtering only generic duplicates from disease-specific questions');
assert.match(app, /const integratedCoreQuestionLabels=new Set\(\[[\s\S]*?'id kasus'[\s\S]*?'nama lengkap'[\s\S]*?'umur'[\s\S]*?'jenis kelamin'[\s\S]*?'tanggal onset gejala'[\s\S]*?'puskesmas'[\s\S]*?'latitude'[\s\S]*?'longitude'/,
  'generic identity, onset, status/outcome, address, and coordinate fields must be filtered from disease-specific questions');
assert.doesNotMatch(app, /db\.questions=filterIntegratedCoreQuestions\(db\.questions\)/,
  'the disease questionnaire loader must not remove integrated base questions from case.answers');
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
  for (const label of normalized) {
    if (Object.hasOwn(duplicateCounts, label)) duplicateCounts[label]++;
    assert.ok(!integratedGenericLabels.has(label), diseaseId + ' must not store integrated generic fields in its disease-specific catalogue');
  }
}
assert.deepEqual(duplicateCounts, {'tanggal onset':0,'status kasus':0,'outcome':0},
  'generic onset, case status, and outcome must be removed from every disease-specific catalogue');
const campakQuestions = diseaseCatalogue.campak.q;
for (const label of ['Tanggal onset demam','Tanggal onset ruam','Klasifikasi kasus','Spesimen serum','Hasil laboratorium']) {
  assert.ok(campakQuestions.includes(label), 'measles-specific question must be preserved: ' + label);
}
for (const label of ['Tanggal onset kelumpuhan','Spesimen tinja pertama','Spesimen tinja kedua','Klasifikasi akhir']) {
  assert.ok(diseaseCatalogue.afp.q.includes(label), 'AFP-specific investigation question must be preserved: ' + label);
}
assert.doesNotMatch(app, /db\.questions=filterIntegratedCoreQuestions\(db\.questions\)/,
  'the actual questionnaire loader must preserve integrated base questions');
assert.match(app, /!m\|\|m\.querySelector\('#v46RiskHint'\)/,
  'risk-factor hint insertion must be idempotent for a case modal');
assert.equal((app.match(/id='v46RiskHint'/g) || []).length, 1,
  'the case modal must define only one risk-factor hint element');
console.log('Disease catalogue semantic duplicate checks passed (34 diseases; generic onset/status/outcome removed).');


// Core identity, clinical status/outcome, and administrative location fields
// must remain inside the integrated questionnaire so every response is saved
// in case.answers and included in questionnaire_response synchronization.
const baseStart = app.indexOf('const baseQ=[');
const baseEnd = app.indexOf('\n];', baseStart);
assert.ok(baseStart >= 0 && baseEnd > baseStart, 'integrated base question catalogue must exist');
const baseLiteral = app.slice(baseStart + 'const baseQ='.length, baseEnd + 2);
const baseQuestions = vm.runInNewContext('(' + baseLiteral + ')');
const baseLabels = new Set(baseQuestions.map(q => q[1]));

// Cross-catalogue overlap audit: where a disease-specific question has the
// same meaning/label as a general field, retain the disease-specific item and
// suppress only the duplicate general copy for that disease.
const overlapCounts = {};
for (const [diseaseId, disease] of diseaseEntries) {
  for (const label of disease.q) {
    const key = String(label).trim().toLowerCase();
    if (baseLabels.has(label)) overlapCounts[key] = (overlapCounts[key] || 0) + 1;
  }
}
assert.deepEqual(overlapCounts, {
  'hasil laboratorium':29,
  'sekolah/tempat kerja':1,
  'tanggal lahir':1,
  'jenis spesimen':1
}, 'all exact general-vs-disease overlaps must be accounted for');
assert.match(app, /function buildCaseQuestionList45\(diseaseId\)[\s\S]*?const specificKeys=new Set\(specific\.map\(q=>questionLabelKey45\(q\.label\)\)\)[\s\S]*?const general=baseQ\.map\(q=>buildQuestion\(q\[1\],q\[0\]\)\)\.filter\(q=>!specificKeys\.has\(questionLabelKey45\(q\.label\)\)\)/,
  'disease-specific questions must take precedence over identical general questionnaire labels');
assert.match(app, /const canonical=buildCaseQuestionList45\(diseaseId\)/,
  'case questionnaire reconstruction must use the cross-catalogue deduplicated list');
assert.match(app, /db\.questions=buildCaseQuestionList45\(db\.selectedDisease\)/,
  'manual questionnaire loading must also use the deduplicated list');
assert.match(app, /const complete=canonical\.map\(q=>\{const old=existingByLabel\.get\(normLabel\(q\.label\)\);return old\?\{\.\.\.q,\.\.\.old,label:q\.label,cat:q\.cat\}:q\}\)/,
  'existing answer IDs and settings must be preserved while canonical disease-specific category/label takes precedence');
for (const [diseaseId, disease] of diseaseEntries) {
  const specific = disease.q.filter(label => !integratedGenericLabels.has(String(label).trim().toLowerCase()));
  const specificKeys = new Set(specific.map(label => String(label).trim().toLowerCase().replace(/[^a-z0-9]+/g,'')));
  const general = baseQuestions.map(q => q[1]).filter(label => !specificKeys.has(String(label).trim().toLowerCase().replace(/[^a-z0-9]+/g,'')));
  const merged = [...general, ...specific].map(label => String(label).trim().toLowerCase().replace(/[^a-z0-9]+/g,''));
  assert.equal(new Set(merged).size, merged.length, diseaseId + ' integrated general + specific list must not contain duplicate labels');
}

for (const label of [
  'ID Kasus','Nama lengkap','Umur','Jenis kelamin','Tanggal onset gejala',
  'Status kasus','Status kesehatan','Outcome','Alamat lengkap','Provinsi',
  'Kabupaten','Kecamatan','Desa/Kelurahan','Puskesmas','Latitude','Longitude'
]) assert.ok(baseLabels.has(label), 'integrated questionnaire must retain core field: ' + label);
assert.match(app, /'Outcome':\{type:'choice',options:\['Rawat jalan','Dirawat','Sembuh','Meninggal','Belum diketahui'\]\}/,
  'integrated Outcome must preserve the user-facing epidemiological options');
assert.match(app, /function coreFromAnswers\(c,a\)[\s\S]*?find\('Outcome','Keadaan akhir'\)/,
  'integrated Outcome must populate the structured case outcome field');
assert.doesNotMatch(app, /const outcome=pick\('Outcome','Keadaan akhir'\)\|\|pick\('Status kesehatan'\)/,
  'current health status must not be silently conflated with case outcome');
assert.match(app, /c\.answers=answers;coreFromAnswers\(c,c\.answers\)/,
  'all integrated questionnaire answers must be retained on each case');
assert.match(app, /questionnaire_response:\{\.\.\.\(c\.answers\|\|\{\}\)/,
  'all integrated answers must be included in backend case synchronization');
assert.match(app, /resolveQuestionnaireRBI\(\)/,
  'RBI location identification must remain available from the integrated questionnaire');
const v70Start = app.indexOf('/* ==================== v70 — OTOMATISASI DESA');
const v70End = app.indexOf('/* ==================== v72 — DEMOGRAPHY', v70Start);
assert.ok(v70Start >= 0 && v70End > v70Start, 'village-to-Puskesmas integration module must exist');
const v70 = app.slice(v70Start, v70End);
assert.match(v70, /questionInput\('Desa\/Kelurahan'\)/,
  'village master selection must target the integrated Desa/Kelurahan question');
assert.match(v70, /questionInput\('Kecamatan'\)[\s\S]*?questionInput\('Puskesmas'\)/,
  'village selection must populate integrated Kecamatan and Puskesmas fields');
assert.match(v70, /window\.resolveQuestionnaireRBI=async function\(\)/,
  'RBI must populate integrated administrative fields from integrated coordinates');
assert.doesNotMatch(v70, /field\('cdesa'\)|field\('ckec'\)|field\('cpkm'\)/,
  'village mapping must not depend on removed duplicate outer-form fields');
assert.match(app, /!m\|\|m\.querySelector\('#v46RiskHint'\)/,
  'risk-factor notice insertion must be idempotent');
assert.equal((app.match(/id='v46RiskHint'/g) || []).length, 1,
  'only one risk-factor notice element may be defined');
console.log('Integrated questionnaire core-field retention and single-form regression checks passed.');
