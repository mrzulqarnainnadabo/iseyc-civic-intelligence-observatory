import fs from 'node:fs';
import assert from 'node:assert/strict';

const data = JSON.parse(fs.readFileSync('data/indicators/national-source-snapshots.json', 'utf8'));
const registry = JSON.parse(fs.readFileSync('src/data/source-registry.json', 'utf8'));
const api = fs.readFileSync('api/evidence/snapshots.js', 'utf8');
const overview = fs.readFileSync('src/pages/Overview.tsx', 'utf8');
const departments = fs.readFileSync('src/pages/Departments.tsx', 'utf8');
const component = fs.readFileSync('src/components/NationalSnapshots.tsx', 'utf8');

assert.equal(data.schemaVersion, '1.0.0');
assert.ok(data.observations.length >= 20, 'national source snapshots must cover multiple institutions and departments');
const sourceIds = new Set(registry.map((item) => item.id));
for (const item of data.observations) {
  assert.ok(item.id && item.title, 'snapshot needs a stable id and title');
  assert.equal(typeof item.value, 'number', 'snapshot values must be numeric');
  assert.ok(Number.isFinite(item.value), 'snapshot value must be finite');
  assert.ok(item.unit && item.referencePeriod, 'snapshot must preserve unit and reference period');
  assert.ok(item.sourceUrl.startsWith('https://'), 'snapshot source URL must be HTTPS');
  assert.ok(sourceIds.has(item.sourceId), 'snapshot source must exist in the source registry: ' + item.sourceId);
  assert.ok(Array.isArray(item.limitations) && item.limitations.length, 'snapshot limitations are required');
  assert.ok(Array.isArray(item.departments) && item.departments.length, 'snapshot must be assigned to a department');
}
for (const item of data.catalogOnlySources) {
  assert.ok(sourceIds.has(item.id), 'catalogue-only source must exist in registry: ' + item.id);
}
for (const id of ['who-gho-nigeria','nitda-dl4all-dashboard','nimc-nin-enrolment-2025','imf-article-iv-2026','nbs-cpi-catalog','naseni-innovation-hub','isn-innovation-hub-assessment','ondi-innovation','fme-education-emis-asc-2024-25']) {
  assert.ok(sourceIds.has(id), 'national registry is missing ' + id);
}
assert.match(api, /validObservation/);
assert.match(api, /manually transcribed source snapshots, not live feeds/);
assert.match(overview, /NationalSnapshots/);
assert.match(departments, /NationalSnapshots departmentId=\{config.id\}/);
assert.match(component, /Reference period/);
assert.match(component, /Original source/);
assert.match(component, /Catalogue only/);
assert.ok(data.observations.some((item) => item.id === 'fme-asc-reporting-rate-2024-25' && item.value === 57.9));
assert.ok(data.observations.some((item) => item.id === 'fme-asc-kaduna-learner-teacher-ratio-2024-25' && item.value === 51.3 && item.geographicCoverage === 'Kaduna State'));
console.log('National source snapshots and department evidence checks passed.');
