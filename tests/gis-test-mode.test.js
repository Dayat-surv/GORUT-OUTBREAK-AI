const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync(require('node:path').join(__dirname, '..', 'index.html'), 'utf8');
const match = html.match(/<script id="gisTestModeStaging">([\s\S]*?)<\/script>/);
assert.ok(match, 'staging GIS test-mode script must exist');

const elements = {
  gisTestStatus: { textContent: 'Mode uji nonaktif' },
  gisTestSummary: { innerHTML: '' }
};
const markers = [];
let layerRemoved = false;
let view = null;
const layer = {
  addTo(target) { assert.equal(target, mapObj); return this; },
  remove() { layerRemoved = true; }
};
const mapObj = {
  setView(coords, zoom) { view = { coords, zoom }; }
};
const L = {
  layerGroup() { return layer; },
  circleMarker(coords, options) {
    const marker = {
      coords, options, popup: '',
      bindPopup(value) { this.popup = value; return this; },
      addTo(target) { assert.equal(target, layer); markers.push(this); return this; }
    };
    return marker;
  }
};
const database = {
  cases: [{ id: 'OPERATIONAL-CASE-UNCHANGED' }],
  fieldVisits: [{ id: 'OPERATIONAL-VISIT-UNCHANGED' }]
};
const before = JSON.stringify(database);
const window = { addEventListener() {} };
const context = {
  window, document: { getElementById: id => elements[id] || null },
  mapObj, L, db: database,
  localStorage: { setItem() { throw new Error('GIS test mode must not write localStorage'); } },
  fetch() { throw new Error('GIS test mode must not call network services'); },
  alert(message) { throw new Error(message); },
  console
};

vm.runInNewContext(match[1], context, { timeout: 1000 });
assert.equal(window.GIS_TEST_MODE.sampleCount, 4);
window.GIS_TEST_MODE.enable();

assert.equal(markers.length, 4, 'enabling GIS test mode must add exactly four synthetic markers');
assert.ok(markers.every(marker => marker.popup.includes('DATA SINTETIS — BUKAN KASUS NYATA')));
assert.equal(JSON.stringify(view), JSON.stringify({ coords: [0.845, 122.907], zoom: 11 }));
assert.match(elements.gisTestStatus.textContent, /Aktif/);
assert.match(elements.gisTestSummary.innerHTML, /Titik sintetis/);
assert.match(elements.gisTestSummary.innerHTML, /<b>1<\/b>/, 'three nearby points must form one cluster');
assert.match(elements.gisTestSummary.innerHTML, /<b>3<\/b>/, 'the cluster must contain three points');
assert.equal(JSON.stringify(database), before, 'synthetic GIS points must not modify operational data');

window.GIS_TEST_MODE.clear();
assert.equal(layerRemoved, true, 'clear must remove the temporary Leaflet layer');
assert.match(elements.gisTestStatus.textContent, /nonaktif/);
assert.match(elements.gisTestSummary.innerHTML, /telah dihapus/);
assert.equal(JSON.stringify(database), before, 'clearing GIS test mode must leave operational data unchanged');

console.log('GIS test-mode regression tests passed.');
