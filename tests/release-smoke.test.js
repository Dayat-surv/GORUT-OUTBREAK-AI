'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const index = read('index.html');
const manifest = JSON.parse(read('manifest.webmanifest'));
const sw = read('sw.js');

assert.match(index, /premium\.css\?v=158/, 'main page must load the premium release stylesheet');
assert.match(index, /favicon\.svg/, 'main page must declare the branded favicon');
assert.match(index, /app\.js\?v=184\.7/, 'main page must load the current cache-busted application script');
assert.match(sw, /gorut-outbreak-ai-final-v184\.7/, 'service worker cache version must match the current release');
assert.match(sw, /app\.js\?v=184\.7/, 'service worker must precache the exact current application script');
assert.match(sw, /premium\.css\?v=158/, 'service worker must precache premium styling');
const appJs = read('app.js');
assert.match(appJs, /functions\.invoke\('delete-investigation'/, 'investigation deletion must use the authenticated Edge Function');
assert.match(appJs, /if\(!serverSummary\|\|serverSummary.deleted!==true\)/, 'local investigation data must remain unchanged unless the server confirms deletion');
assert.match(appJs, /ID investigasi server belum tersedia/, 'server deletion must fail closed when the server ID mapping is missing');
assert.match(appJs, /functions\.invoke\('create-registration-request'/, 'legacy registration request handlers must use the authenticated Edge Function');
assert.match(appJs, /functions\.invoke\('activate-registration'/, 'registration activation must use the authenticated Edge Function');
assert.match(appJs, /functions\.invoke\('reject-registration'/, 'registration rejection must use the authenticated Edge Function');
assert.doesNotMatch(appJs, /\.rpc\('(delete_investigation_bundle|activate_premium_7d|reject_registration|create_registration_request)'/, 'browser code must not call legacy privileged RPCs directly');
const deleteStart = appJs.indexOf('window.deleteInvestigation=async function(id){');
const deleteEnd = appJs.indexOf('\n\n  /* Override list renderers', deleteStart);
const deleteHandler = appJs.slice(deleteStart, deleteEnd);
assert.ok(deleteStart >= 0 && deleteEnd > deleteStart, 'server-backed investigation delete handler must exist');
assert.ok(deleteHandler.indexOf('if(!serverSummary||serverSummary.deleted!==true)') < deleteHandler.indexOf('db.investigations=db.investigations.filter'), 'local deletion must occur only after explicit server confirmation');
const publicSurvey = read('public_survey.html');
const newInvestigationStart = appJs.indexOf('function newKlb(){');
const saveInvestigationStart = appJs.indexOf('async function saveKlb()', newInvestigationStart);
assert.ok(newInvestigationStart >= 0 && saveInvestigationStart > newInvestigationStart, 'new investigation and save handlers must exist');
const newInvestigationHandler = appJs.slice(newInvestigationStart, saveInvestigationStart);
assert.match(index, /onclick="newKlb\(\)">\+ Investigasi Baru/, 'dashboard must expose the new investigation action');
assert.match(newInvestigationHandler, /db\.active=null;/, 'starting a new investigation must clear the previously selected record');
assert.match(newInvestigationHandler, /save\(\);/, 'the cleared active selection must persist before the new form is saved');
assert.match(appJs, /from\('survey_responses'\)\.select\('id,payload'\)/, 'survey response hydration must select the real survey_responses primary key');
assert.match(appJs, /food_investigation:patch\.foodInvestigation\?\?inv\.foodInvestigation\?\?null/, 'food-poisoning investigation details must be persisted in investigation metadata on edit');
assert.match(appJs, /foodInvestigation:r\.metadata\?\.food_investigation\|\|null/, 'food-poisoning investigation details must be hydrated from server metadata after reload');
assert.match(appJs, /food_investigation:inv\.foodInvestigation\|\|null/, 'new food-poisoning investigations must persist their detail payload');
assert.match(appJs, /async function saveKlb\(\)/, 'investigation save handler must await server synchronization');
assert.match(appJs, /if\(activeId!=null&&existingIndex<0\)/, 'editing a missing investigation must abort instead of creating a duplicate');
assert.match(appJs, /if\(existingIndex>=0\)db\.investigations\[existingIndex\]=o;\s*else db\.investigations\.push\(o\)/, 'editing must replace the existing record while new investigations append once');
assert.match(appJs, /queueSync\('investigations'\)/, 'investigation changes must enter the sync queue');
assert.match(appJs, /server STAGING/, 'sync confirmation must identify the STAGING environment');
assert.match(appJs, /surveyAnswerByResponseId\.set\(String\(response\.id\),response\.payload\)/, 'stored questionnaire answers must be mapped to cases by exact response ID');
assert.doesNotMatch(appJs, /from\('survey_responses'\)\.select\('response_id,payload'\)/, 'app must not query a nonexistent response_id table column');

assert.match(appJs, /Inisial nama \(tanpa nama lengkap\)/, 'master questionnaire must request initials rather than full names');
assert.match(publicSurvey, /Isi inisial saja, jangan tuliskan nama lengkap\./, 'public questionnaire must guide respondents to enter initials');
assert.match(publicSurvey, /submit_public_survey/,'each public questionnaire submission must call the server persistence RPC');
assert.match(publicSurvey, /submissionId=newSubmissionId\(\)/,'each send attempt must have a stable unique submission ID');
assert.match(publicSurvey, /result\.data\.success!==true/,'the UI must not report success without explicit server confirmation');
assert.match(publicSurvey, /ID respons:/,'the respondent must receive a server response reference after successful save');
assert.match(publicSurvey, /readQueue\(\)/,'failed submissions must be queued locally for retry');
assert.match(publicSurvey, /if\(r\.error\|\|!r\.data\|\|r\.data\.success!==true\)remain\.push\(item\)/, 'offline queue entries must remain until the server confirms each response');
assert.match(publicSurvey, /Antrian offline berhasil dikirim dan dikonfirmasi server/, 'offline retry success message must require server confirmation');
const publicSurveyScripts = [...publicSurvey.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(match => !/\bsrc\s*=/i.test(match[1]))
  .map(match => match[2].trim()).filter(Boolean);
assert.ok(publicSurveyScripts.length > 0, 'public questionnaire must include its submission handler');
for (const [i, script] of publicSurveyScripts.entries()) {
  try { new Function(script); } catch (error) {
    throw new Error('Inline script #' + (i + 1) + ' in public_survey.html has a syntax error: ' + error.message);
  }
}
assert.match(manifest.name, /GORUT-OUTBREAK AI/, 'PWA manifest must name the application');
assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0, 'PWA manifest must declare at least one icon');


// Parse every inline JavaScript block so syntax errors in index.html fail CI.
// External scripts (which have a src attribute) are intentionally excluded.
const inlineScripts = [...index.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(match => !/\bsrc\s*=/i.test(match[1]))
  .map(match => match[2].trim())
  .filter(Boolean);
assert.ok(inlineScripts.length > 0, 'index.html must contain expected inline application handlers');
for (const [i, script] of inlineScripts.entries()) {
  try {
    // Compilation only: never execute page scripts in this test process.
    new Function(script);
  } catch (error) {
    throw new Error('Inline script #' + (i + 1) + ' in index.html has a syntax error: ' + error.message);
  }
}

// External inline scripts are syntax-checked above; browser behavior still needs manual QA.
const localRefs = [];
for (const m of index.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const raw = m[1];
  if (/^(?:https?:)?\/\//i.test(raw) || raw.startsWith('data:') || raw.startsWith('mailto:') || raw.startsWith('tel:')) continue;
  if (/^(?:javascript:)/i.test(raw)) continue;
  const clean = decodeURIComponent(raw.split('?')[0].split('#')[0]);
  if (!clean || clean.startsWith('blob:')) continue;
  localRefs.push(clean.replace(/^\.\//, ''));
}
for (const ref of localRefs) {
  const file = path.join(root, ref);
  assert.ok(fs.existsSync(file), 'local asset referenced by index.html must exist: ' + ref);
}
for (const icon of manifest.icons) {
  const iconPath = String(icon.src || '').replace(/^\.\//, '').split('?')[0];
  assert.ok(iconPath && fs.existsSync(path.join(root, iconPath)), 'PWA icon must exist: ' + iconPath);
}
for (const m of sw.matchAll(/['"]\.\/([^'"]+)['"]/g)) {
  const asset = m[1].split('?')[0].split('#')[0];
  if (asset === '') continue;
  assert.ok(fs.existsSync(path.join(root, asset)), 'service worker precache asset must exist: ' + asset);
}
const backend = read('backend-config.js').replace(/\/\/.*$/gm, '');
assert.doesNotMatch(backend, /(?:service_role|sb_secret_[A-Za-z0-9_-]+)/i, 'browser config must not contain a service-role or secret key');
assert.match(backend, /publicSurveyEnabled:\s*false/, 'public questionnaire must stay disabled until live Supabase authorization and schema checks pass');
assert.match(publicSurvey, /if\(c\.enabled!==true\|\|c\.publicSurveyEnabled!==true\|\|!window\.supabase\)/, 'public questionnaire must require both backend and explicit public-survey enablement; backend enabled alone must not bypass the fail-closed switch');
console.log('Release smoke checks passed: HTML references, local assets, PWA manifest/icons, service-worker cache, and frontend key hygiene.');
