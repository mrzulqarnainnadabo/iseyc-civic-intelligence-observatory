import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  EXAMPLE_VALID_PUBLIC_MANDATE_RECORD,
  PRIVATE_FIELD_DENYLIST,
  PUBLIC_MANDATE_RECORD_SCHEMA_VERSION,
} from '../../contracts/stage2/public-mandate-record.v1';
import {
  DEFAULT_STATE_RESOLVER,
  PublicMandateContractError,
  pulseVoiceToPublicMandate,
} from '../../contracts/stage2/pulse-to-public-mandate';

const root = join(process.cwd());
function loadJson(rel: string) {
  return JSON.parse(readFileSync(join(root, rel), 'utf8'));
}

const MASTER_DUTIES = [
  'Health','Education','Security','Jobs & Economic Opportunity','Power','Water',
  'Roads & Transport','Agriculture','Housing','Environment','Digital Infrastructure',
  'Youth Development',"Women's Development",'Social Protection','Public Finance',
  'Anti-Corruption / Transparency','Justice','Other',
] as const;

const OBS_SECTORS_V11 = [
  'education','health','security','infrastructure','water-sanitation','employment',
  'public-finance','governance','agriculture','environment',
] as const;

describe('duty–sector crosswalk v1.1', () => {
  const doc = loadJson('contracts/stage2/duty-sector-crosswalk.v1.json');
  it('declares 10 sectors and preserves original eight ids', () => {
    expect(doc.facetTaxonomy.count).toBe(10);
    expect(doc.facetTaxonomy.addedInV1_1).toEqual(['agriculture', 'environment']);
    expect(doc.facetTaxonomy.preservedFromV1).toHaveLength(8);
  });
  it('maps Agriculture and Environment as primary', () => {
    expect(doc.mappings).toContainEqual(expect.objectContaining({ dutyId: 'Agriculture', sectorId: 'agriculture', relationshipType: 'primary' }));
    expect(doc.mappings).toContainEqual(expect.objectContaining({ dutyId: 'Environment', sectorId: 'environment', relationshipType: 'primary' }));
  });
  it('treats Youth as cross-cutting only', () => {
    const youth = doc.mappings.filter((m: { dutyId: string }) => m.dutyId === 'Youth Development');
    expect(youth.every((m: { relationshipType: string }) => m.relationshipType === 'cross-cutting')).toBe(true);
  });
  it('covers all 18 duties with known sector ids', () => {
    const all = new Set(doc.mappings.map((m: { dutyId: string }) => m.dutyId));
    for (const d of MASTER_DUTIES) expect(all.has(d)).toBe(true);
    for (const m of doc.mappings) expect(OBS_SECTORS_V11.includes(m.sectorId)).toBe(true);
  });
});

describe('geographic reference v1.1', () => {
  const geo = loadJson('contracts/stage2/geographic-reference.v1.json');
  it('freezes 37 units without LGA ids', () => {
    expect(geo.states).toHaveLength(37);
    expect(geo.v1Scope.notInScope).toEqual(expect.arrayContaining(['lga']));
  });
  it('does not auto-resolve Abuja to FCT', () => {
    const abu = geo.aliases.find((a: { alias: string }) => a.alias === 'Abuja');
    expect(abu.stateId).toBeNull();
    expect(abu.confidence).toBe('ambiguous');
  });
});

describe('PublicMandateRecord from Pulse fixtures', () => {
  const fixture = loadJson('contracts/stage2/fixtures/pulse-public-sample.json');
  it('converts published voices', () => {
    const first = pulseVoiceToPublicMandate(fixture.voices[0]);
    expect(first.schemaVersion).toBe(PUBLIC_MANDATE_RECORD_SCHEMA_VERSION);
    expect(first.publicationStatus).toBe('Published');
  });
  it('rejects unpublished', () => {
    expect(() => pulseVoiceToPublicMandate(fixture.voices[0], { publicationStatus: 'New' })).toThrow(PublicMandateContractError);
  });
  it('marks Abuja ambiguous', () => {
    const rec = pulseVoiceToPublicMandate({ ...fixture.voices[0], state: 'Abuja' });
    expect(rec.geo?.stateId).toBeNull();
    expect(rec.geo?.resolution).toBe('ambiguous');
  });
  it('rejects private fields', () => {
    expect(() => pulseVoiceToPublicMandate({ ...fixture.voices[0], gender: 'Female' })).toThrow(/Private field/);
  });
  it('DEFAULT_STATE_RESOLVER policy', () => {
    expect(DEFAULT_STATE_RESOLVER('FCT').stateId).toBe('ng-fct');
    expect(DEFAULT_STATE_RESOLVER('Abuja').resolution).toBe('ambiguous');
  });
  it('example has no denylisted keys', () => {
    const keys = Object.keys(EXAMPLE_VALID_PUBLIC_MANDATE_RECORD).map((k) => k.toLowerCase());
    expect(keys).not.toContain('gender');
    expect(PRIVATE_FIELD_DENYLIST.length).toBeGreaterThan(5);
  });
});
