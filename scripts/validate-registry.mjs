// Validates data/source-registry.json: structure, uniqueness, honest verification flags.
import { readFileSync } from 'node:fs';
const reg = JSON.parse(readFileSync(new URL('../data/source-registry.json', import.meta.url), 'utf8'));
const copy = readFileSync(new URL('../src/data/source-registry.json', import.meta.url), 'utf8');
const SECTORS = ['education','health','security','infrastructure','water-sanitation','employment','public-finance','governance','agriculture','environment'];
const KINDS = ['official-data','published-research','media-report','community-submission','independently-verified'];
const GEO = ['national','zone','state','lga','facility','point','varies'];
const URLS = ['confirmed','domain-confirmed','documented-not-reconfirmed','not-applicable'];
const errors = []; const ids = new Set();
for (const s of reg) {
  const at = `[${s.id}]`;
  for (const k of ['id','publisher','name','geographicCoverage','dataType','updateFrequency','licence','limitations','sectors','kind','geoLevel','urlStatus'])
    if (s[k] === undefined || s[k] === '' ) errors.push(`${at} missing ${k}`);
  if (ids.has(s.id)) errors.push(`${at} duplicate id`); ids.add(s.id);
  if (!KINDS.includes(s.kind)) errors.push(`${at} bad kind`);
  if (!GEO.includes(s.geoLevel)) errors.push(`${at} bad geoLevel`);
  if (!URLS.includes(s.urlStatus)) errors.push(`${at} bad urlStatus`);
  if (!Array.isArray(s.sectors) || s.sectors.length === 0 || s.sectors.some(x => !SECTORS.includes(x))) errors.push(`${at} bad sectors`);
  if (!Array.isArray(s.limitations) || s.limitations.length === 0) errors.push(`${at} needs at least one known limitation`);
  if (s.url !== null && !/^https?:\/\//.test(s.url)) errors.push(`${at} bad url`);
  if (s.urlStatus === 'not-applicable' && s.url !== null) errors.push(`${at} not-applicable must have null url`);
  const verified = s.urlStatus === 'confirmed' || s.urlStatus === 'domain-confirmed';
  if (verified && !/^\d{4}-\d{2}-\d{2}$/.test(s.lastChecked ?? '')) errors.push(`${at} verified entries need an ISO lastChecked`);
  if (!verified && s.lastChecked) errors.push(`${at} must not claim a lastChecked date without confirmation`);
  if (verified && !s.checkedHow) errors.push(`${at} verified entries must say how they were checked`);
}
if (copy !== JSON.stringify(reg, null, 1) && JSON.stringify(JSON.parse(copy)) !== JSON.stringify(reg)) errors.push('src/data/source-registry.json differs from data/source-registry.json (run: npm run sync:registry)');
if (errors.length) { console.error('Registry validation FAILED:\n' + errors.join('\n')); process.exit(1); }
console.log(`Registry OK: ${reg.length} sources, ${reg.filter(s=>s.urlStatus==='confirmed').length} confirmed, ${reg.filter(s=>s.urlStatus==='domain-confirmed').length} domain-confirmed, ${reg.filter(s=>s.urlStatus==='documented-not-reconfirmed').length} not re-confirmed.`);
