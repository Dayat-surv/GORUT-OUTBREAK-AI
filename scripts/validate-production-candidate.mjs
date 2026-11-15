import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const app = read("app.js");
const helper = read("supabase/functions/_shared/production-operation.ts");
const migration = read("supabase/migrations/20261115090000_production_edge_operations_candidate.sql");

const endpoints = [
  "delete-investigation",
  "create-registration-request",
  "activate-registration",
  "reject-registration",
];

for (const endpoint of endpoints) {
  assert.match(app, new RegExp("functions\\\\.invoke\\('"+endpoint+"'"), `Frontend must invoke ${endpoint}`);
}
assert.match(app, /serverSummary.*deleted!==true/s, "Delete must wait for server confirmation");
assert.match(app, /if\(!sign\.data\?\.session\)[\s\S]*Konfirmasikan email/, "Registration must handle email-confirmation flow");
assert.match(helper, /withSupabase\(\{ auth: "user" \}/, "Every operation must require a user JWT");
assert.match(helper, /ctx\.userClaims\?\.id \?\? ctx\.jwtClaims\?\.sub/, "Actor identity must come from verified claims");
assert.match(helper, /ctx\.supabaseAdmin\.rpc/, "Privileged RPC must be called server-side");
assert.match(helper, /npm:@supabase\/server@1\.9\.2/, "Supabase server dependency must be version-pinned");

const functionMap = {
  "edge_create_registration_request": "create-registration-request",
  "edge_activate_premium_7d": "activate-registration",
  "edge_reject_registration": "reject-registration",
  "edge_delete_investigation_bundle": "delete-investigation",
};
for (const [rpc, endpoint] of Object.entries(functionMap)) {
  assert.match(migration, new RegExp("create or replace function public\\\\."+rpc+"\\\\("), `Migration missing ${rpc}`);
  assert.match(migration, new RegExp("grant execute on function public\\\\."+rpc+"\\\\([^;]+ to service_role;"), `Missing service_role grant for ${rpc}`);
  assert.match(migration, new RegExp("revoke all on function public\\\\."+rpc+"\\\\([^;]+ from public, anon, authenticated;"), `Missing public revoke for ${rpc}`);
}
const securityDefinerCount = (migration.match(/security definer/gi) || []).length;
const searchPathCount = (migration.match(/set search_path\s*=\s*''/gi) || []).length;
assert.equal(securityDefinerCount, 4, "Exactly four candidate RPCs should be SECURITY DEFINER");
assert.equal(searchPathCount, 4, "Every SECURITY DEFINER RPC must set an empty search_path");
assert.match(migration, /pg_advisory_xact_lock/, "Registration retries must be serialized");
assert.match(migration, /for update/i, "Delete bundle must lock rows before integrity checks");
assert.match(migration, /RELATED_RECORD_OWNER_OR_INVESTIGATION_MISMATCH/, "Delete must fail closed on linked-record ownership/investigation mismatch");
assert.match(migration, /delete from public\.survey_responses[\s\S]*delete from public\.public_surveys/, "Survey responses must be deleted before surveys");
assert.match(migration, /commit;\s*$/i, "Migration must close its transaction");

function checkSqlBalance(source) {
  let state = "normal", dollarTag = "", depth = 0;
  for (let i = 0; i < source.length; i++) {
    const c = source[i], n = source[i + 1];
    if (state === "line") { if (c === "\\n") state = "normal"; continue; }
    if (state === "block") { if (c === "*" && n === "/") { state = "normal"; i++; } continue; }
    if (state === "single") { if (c === "'" && n === "'") { i++; continue; } if (c === "'") state = "normal"; continue; }
    if (state === "double") { if (c === '"' && n === '"') { i++; continue; } if (c === '"') state = "normal"; continue; }
    if (state === "dollar") { if (source.startsWith(dollarTag, i)) { i += dollarTag.length - 1; state = "normal"; } continue; }
    if (c === "-" && n === "-") { state = "line"; i++; continue; }
    if (c === "/" && n === "*") { state = "block"; i++; continue; }
    if (c === "'") { state = "single"; continue; }
    if (c === '"') { state = "double"; continue; }
    if (c === "$") { const m = source.slice(i).match(/^\\$[A-Za-z0-9_]*\\$/); if (m) { dollarTag = m[0]; state = "dollar"; i += dollarTag.length - 1; continue; } }
    if (c === "(") depth++;
    if (c === ")") { depth--; assert.ok(depth >= 0, "SQL has an unmatched closing parenthesis"); }
  }
  assert.equal(state, "normal", `SQL ends inside lexical state ${state}`);
  assert.equal(depth, 0, "SQL parentheses must be balanced");
}
checkSqlBalance(migration);
console.log("PASS: frontend-to-Edge-Function wiring");
console.log("PASS: JWT/actor/admin server-side guard patterns");
console.log("PASS: SECURITY DEFINER, search_path, and service_role-only grants");
console.log("PASS: registration idempotency and delete-bundle integrity guards");
console.log("PASS: SQL lexical balance");
