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
assert.match(index, /app\.js\?v=162/, 'main page must use the release cache-busted application script');
assert.match(sw, /gorut-outbreak-ai-final-v162/, 'service worker cache version must match the release');
assert.match(sw, /app\.js\?v=162/, 'service worker must precache the release application script');
assert.match(sw, /premium\.css\?v=158/, 'service worker must precache premium styling');
const appJs = read('app.js');
const publicSurvey = read('public_survey.html');
assert.match(appJs, /from\('survey_responses'\)\.select\('id,payload'\)/, 'survey response hydration must select the real survey_responses primary key');
assert.match(appJs, /surveyAnswerByResponseId\.set\(String\(response\.id\),response\.payload\)/, 'stored questionnaire answers must be mapped to cases by exact response ID');
assert.doesNotMatch(appJs, /from\('survey_responses'\)\.select\('response_id,payload'\)/, 'app must not query a nonexistent response_id table column');

assert.match(appJs, /Inisial nama \(tanpa nama lengkap\)/, 'master questionnaire must request initials rather than full names');
assert.match(publicSurvey, /Isi inisial saja, jangan tuliskan nama lengkap\./, 'public questionnaire must guide respondents to enter initials');
assert.match(publicSurvey, /submit_public_survey/,'each public questionnaire submission must call the server persistence RPC');
assert.match(publicSurvey, /submissionId=newSubmissionId\(\)/,'each send attempt must have a stable unique submission ID');
assert.match(publicSurvey, /result\.data\.success!==true/,'the UI must not report success without explicit server confirmation');
assert.match(publicSurvey, /ID respons:/,'the respondent must receive a server response reference after successful save');
assert.match(publicSurvey, /readQueue\(\)/,'failed submissions must be queued locally for retry');
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
console.log('Release smoke checks passed: HTML references, local assets, PWA manifest/icons, service-worker cache, and frontend key hygiene.');
