'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const appSource = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'research-valid-case.json'), 'utf8'));

function extractFunction(source, name) {
  const marker = new RegExp('function\\s+' + name + '\\s*\\(');
  const match = marker.exec(source);
  assert.ok(match, 'Function ' + name + ' must exist in app.js');
  const start = match.index;
  const open = source.indexOf('{', match.index);
  assert.ok(open >= 0, 'Function ' + name + ' must have a body');
  let depth = 0, quote = null, escaped = false, lineComment = false, blockComment = false;
  for (let i = open; i < source.length; i++) {
    const ch = source[i], next = source[i + 1];
    if (lineComment) { if (ch === '\n') lineComment = false; continue; }
    if (blockComment) { if (ch === '*' && next === '/') { blockComment = false; i++; } continue; }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '/' && next === '/') { lineComment = true; i++; continue; }
    if (ch === '/' && next === '*') { blockComment = true; i++; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth++;
    if (ch === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error('Could not find end of function ' + name);
}

const names = [
  'diseaseName126',
  'snapshotObject126',
  'buildResearchSnapshotRows126',
  'excludedResearchRecord126',
  'eligibleUniqueCaseCount126',
  'isInvalidTestCaseForDashboard128',
  'isInvalidResearchRow128',
  'researchDatasetRows',
  'researchDatasetExcludedCount128',
  'researchCases'
];
const declarations = names.map(name => extractFunction(appSource, name)).join('\n');
const windowStub = { diseases: { campak: { name: 'Tersangka Campak' } } };
let activeResearchState = { dataSource: 'dataset', dataset: { rows: [] } };
let currentCasesCalls = 0;
const api = new Function('window', 'researchState', 'currentCases', declarations + '\\nreturn {' + names.join(',') + '};')(windowStub, activeResearchState, () => { currentCasesCalls++; return [{ id: 'LIVE-OPERATIONAL-CASE' }]; });

const valid = fixture.validRecord;
const invalid = fixture.invalidRecords;
assert.equal(api.excludedResearchRecord126(valid), false, 'valid synthetic record must not be excluded');
assert.equal(api.excludedResearchRecord126(invalid[0]), true, 'known invalid source record 1 must remain excluded');
assert.equal(api.excludedResearchRecord126(invalid[1]), true, 'known invalid source record 2 must remain excluded');
activeResearchState.dataset.rows = [invalid[0], invalid[1], valid];
assert.equal(api.isInvalidTestCaseForDashboard128(invalid[0]), true, 'production filter must exclude invalid source record 1');
assert.equal(api.isInvalidTestCaseForDashboard128(invalid[1]), true, 'production filter must exclude invalid source record 2');
assert.deepEqual(api.researchDatasetRows(), [valid], 'dataset preview must return only the valid selected record');
assert.equal(api.researchDatasetExcludedCount128(), 2, 'dataset preview must count both excluded test records');
assert.deepEqual(api.researchCases(), [valid], 'analysis source must return the same valid rows as dataset preview');
activeResearchState.dataset.rows = [invalid[0], invalid[1]];
assert.deepEqual(api.researchDatasetRows(), [], 'dataset preview must be empty when all source rows are invalid');
assert.equal(api.researchDatasetExcludedCount128(), 2, 'empty valid dataset must retain exclusion count for both source records');
assert.deepEqual(api.researchCases(), [], 'explicitly selected empty dataset must remain empty and must not fall back to operational cases');
assert.equal(currentCasesCalls, 0, 'empty selected dataset must not call currentCases');
activeResearchState.dataset.rows = [valid];
assert.deepEqual(api.researchCases(), [valid], 'selected dataset must return its valid selected rows');
activeResearchState.dataSource = 'operational';
assert.deepEqual(api.researchCases(), [{ id: 'LIVE-OPERATIONAL-CASE' }], 'operational source must continue to return operational cases');
assert.equal(currentCasesCalls, 1, 'operational source should call currentCases exactly once');
assert.equal(api.eligibleUniqueCaseCount126([...invalid, valid]), 1, 'one valid unique case should be counted');

const built = api.buildResearchSnapshotRows126(
  [{ record: valid, index: 2, caseId: valid.id }],
  fixture.investigation
);
assert.equal(built.rows.length, 1, 'snapshot should contain exactly one selected valid case');
const row = built.rows[0];
assert.equal(row['ID Kasus'], valid.id);
assert.equal(row['ID Rekaman Sumber'], valid.serverId);
assert.equal(row['ID Investigasi'], fixture.investigation.id);
assert.equal(row['Nama Investigasi'], fixture.investigation.name);
assert.equal(row['Penyakit'], 'Tersangka Campak');
assert.equal(row['Nama'], valid.name);
assert.equal(row['Tanggal onset demam'], '2026-01-05');
assert.equal(row['variabelValid'], 'JAWABAN_VALID_SIMULASI');
assert.equal('jawabanSumber1' in row, false, 'source 1 test answers must not leak into snapshot');
assert.equal('jawabanSumber2' in row, false, 'source 2 test answers must not leak into snapshot');

const jsonRow = api.buildResearchSnapshotRows126([{
  record: {
    id: 'SIM-JSON-001',
    serverId: 'SIM-JSON-SOURCE-001',
    answers: '{"jawabanJson":"JAWABAN_JSON_SIMULASI"}',
    foodCase: '{"makanan":"NASI_SIMULASI"}',
    priority: '{"tingkat":"TINGGI_SIMULASI"}'
  },
  index: 0,
  caseId: 'SIM-JSON-001'
}], fixture.investigation).rows[0];
assert.equal(jsonRow.jawabanJson, 'JAWABAN_JSON_SIMULASI');
assert.equal(jsonRow['Keracunan pangan: makanan'], 'NASI_SIMULASI');
assert.equal(jsonRow['Prioritas: tingkat'], 'TINGGI_SIMULASI');

console.log('LULUS: fixture valid lolos filter dan menghasilkan 1 baris snapshot.');
console.log('LULUS: filter produksi, preview dataset, dan sumber analisis sepakat pada satu baris valid; kedua rekaman uji tetap dikecualikan.');
console.log('LULUS: ID sumber/investigasi/penyakit dan jawaban JSON tetap dipertahankan.');
console.log('AMAN: pengujian hanya menjalankan fungsi murni di memori; tidak menyentuh localStorage, Supabase, atau data operasional.');
