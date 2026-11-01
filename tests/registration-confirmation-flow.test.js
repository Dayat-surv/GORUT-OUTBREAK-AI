'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
new vm.Script(source, { filename: 'app.js' });

const helperStart = source.indexOf('async function v28ResumePendingRegistration');
const helperEnd = source.indexOf('const v28OriginalSubmitRegistration', helperStart);
assert.ok(helperStart >= 0 && helperEnd > helperStart, 'pending-registration helper must exist');
const helper = source.slice(helperStart, helperEnd);
assert.match(helper, /user\?\.email[\s\S]*pending\.email/,
  'pending request must only be submitted by the matching authenticated email');
assert.match(helper, /pending\.status==='uncertain'\|\|pending\.status==='sending'/,
  'uncertain/in-flight requests must not be submitted again automatically');
assert.match(helper, /sb\.rpc\('create_registration_request'/,
  'authenticated pending request must call the secured registration RPC');

const signupStart = source.indexOf('const v28FinalSubmitRegistration=window.submitRegistration');
const signupEnd = source.indexOf('/* Start selectors after DOM is ready. */', signupStart);
assert.ok(signupStart >= 0 && signupEnd > signupStart, 'final backend registration handler must exist');
const signup = source.slice(signupStart, signupEnd);
assert.match(signup, /sign\.data\?\.session/,
  'signup must check whether Supabase returned an authenticated session');
assert.ok(signup.indexOf('if(!sign.data?.session') < signup.indexOf('v28ResumePendingRegistration(sb,sign.data.user)'),
  'signup without a session must defer the RPC until later login');
assert.match(signup, /status:'waiting_session'/,
  'registration metadata must be retained while email confirmation is pending');
assert.doesNotMatch(signup, /password\s*[:,]/,
  'password must never be stored in pending registration metadata');
assert.match(signup, /localStorage\.setItem\(V28_PENDING_REG_KEY/,
  'pending metadata must be retained on the same browser for post-confirmation login');

const loginStart = source.indexOf('window.login=async function(){', source.indexOf('const v28FinalLoginBase'));
const loginEnd = source.indexOf('const v28FinalRenderBase', loginStart);
assert.ok(loginStart >= 0 && loginEnd > loginStart, 'final backend login handler must exist');
const login = source.slice(loginStart, loginEnd);
assert.ok(login.indexOf('v28ResumePendingRegistration(sb,r.data.user)') < login.indexOf('const access=await v28BackendAccess()'),
  'pending registration must be recorded immediately after login, before subscription/access gating');

console.log('Confirmed-email registration flow static tests passed.');
console.warn('LIVE CHECK REQUIRED: browser signup, email confirmation, and post-confirmation login must be tested with a dedicated non-operational account.');
