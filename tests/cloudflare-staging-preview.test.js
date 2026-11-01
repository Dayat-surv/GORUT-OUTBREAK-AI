'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const worker = fs.readFileSync(path.join(__dirname, '..', '_worker.js'), 'utf8');
assert.match(worker, /url\.pathname === '\/backend-config\.js'/,
  'runtime backend config route must be intercepted');
assert.match(worker, /environment === 'staging'/,
  'runtime backend config must require explicit staging environment');
assert.match(worker, /https:\/\/xeqdhwqylutntphlkmqe\.supabase\.co/,
  'runtime config must be pinned to the staging Supabase project');
assert.match(worker, /publishableKey\\.startsWith\\('sb_publishable_'\\)/,
  'publishable key prefix must be validated');
assert.match(worker, /publicSurveyEnabled: false/,
  'public survey must remain disabled');
assert.match(worker, /enabled: false/,
  'missing/invalid runtime variables must fail closed');
assert.match(worker, /return env\.ASSETS\.fetch\(request\)/,
  'non-config requests must continue to static assets');

const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
assert.match(sw, /backend-config\.js'\)\)return/,
  'service worker must not cache runtime backend configuration');
console.log('Cloudflare staging preview isolation static tests passed.');
