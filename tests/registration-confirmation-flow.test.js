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
const pendingStart = signup.indexOf('const pending={');
const pendingEnd = signup.indexOf('};', pendingStart);
assert.ok(pendingStart >= 0 && pendingEnd > pendingStart, 'pending metadata object must exist');
assert.doesNotMatch(signup.slice(pendingStart, pendingEnd), /password/i,
  'password must never be stored in pending registration metadata');
assert.match(signup, /localStorage\.setItem\(V28_PENDING_REG_KEY/,
  'pending metadata must be retained on the same browser for post-confirmation login');

const loginStart = source.indexOf('window.login=async function(){', source.indexOf('const v28FinalLoginBase'));
const loginEnd = source.indexOf('const v28FinalRenderBase', loginStart);
assert.ok(loginStart >= 0 && loginEnd > loginStart, 'final backend login handler must exist');
const login = source.slice(loginStart, loginEnd);
assert.ok(login.indexOf('v28ResumePendingRegistration(sb,r.data.user)') < login.indexOf('const access=await v28BackendAccess()'),
  'pending registration must be recorded immediately after login, before subscription/access gating');


const finalRegistrationRoutingStart = source.lastIndexOf('const v45LocalSubmit=window.v45Register;');
assert.ok(finalRegistrationRoutingStart >= 0, 'final registration routing override must exist');
const finalRegistrationRouting = source.slice(finalRegistrationRoutingStart);
assert.match(finalRegistrationRouting, /window\.v45ShowRegister=function\(\)[\s\S]*GORUT_BACKEND\?\.enabled[\s\S]*v45ShowSupabaseRegister/,
  'registration button must open the Supabase registration form when backend is enabled');
assert.match(finalRegistrationRouting, /window\.submitRegistration=async function\(\)[\s\S]*GORUT_BACKEND\?\.enabled[\s\S]*v45SupabaseSubmit/,
  'registration submission must use the confirmed-email Supabase flow when backend is enabled');
for (const field of ['regName','regEmail','regPassword','regWhatsapp','regInstitution','registerMsg']) {
  assert.ok(finalRegistrationRouting.includes('id="' + field + '"'),
    'Supabase registration form must render field ' + field);
}

console.log('Confirmed-email registration flow static tests passed.');
console.warn('LIVE CHECK REQUIRED: browser signup, email confirmation, and post-confirmation login must be tested with a dedicated non-operational account.');

const recoveryStart = source.indexOf('/* STAGING-ONLY password recovery flow.');
assert.ok(recoveryStart >= 0, 'STAGING password recovery feature must exist');
const recovery = source.slice(recoveryStart);
assert.match(recovery, /window\.GORUT_BACKEND\?\.enabled[\s\S]*xeqdhwqylutntphlkmqe\.supabase\.co/,
  'password recovery must be gated behind the enabled STAGING backend');
assert.match(recovery, /resetPasswordForEmail\(email,\{redirectTo\}\)/,
  'forgot-password action must call Supabase Auth resetPasswordForEmail with a redirect');
assert.match(recovery, /onAuthStateChange\(function\(event\)[\s\S]*PASSWORD_RECOVERY/,
  'recovery callback must be handled through the Supabase Auth event');
assert.match(recovery, /updateUser\(\{password:p\}\)/,
  'new password must be saved through Supabase Auth updateUser');
assert.match(recovery, /gorutForgotPassword/,
  'login view must expose a Lupa Kata Sandi action');
assert.doesNotMatch(recovery, /localStorage\.setItem\([^\n]*password/i,
  'recovery feature must never persist a password in local storage');
assert.match(source, /publicSurveyEnabled: false/,
  'STAGING runtime backend must keep public survey disabled');
assert.doesNotMatch(recovery, /service_role|sb_secret_/i,
  'recovery feature must not introduce privileged server keys');
