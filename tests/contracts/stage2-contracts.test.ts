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
  PUBLIC_MANDATE_OUTPUT_KEYS,
  PUBLIC_PULSE_FIELD_ALLOWLIST,
  PublicMandateContractError,
  pickPublicPulseFields,
  pulseVoiceToPublicMandate,
} from '../../contracts/stage2/pulse-to-public-mandate';

const root = join(process.cwd());
function loadJson(rel: string) {
  return JSON.parse(readFileSync(join(root, rel), 'utf8'));
}

const MASTER_DUTIES = [
  'Health', 'Education', 'Security', 'Jobs & Economic Opportunity', 'Power', 'Water',
  'Roads & Transport', 'Agriculture', 'Housing', 'Environment', 'Digital Infrastructure',
  'Youth Development', "Women's Development", 'Social Protection', 'Public Finance',
  'Anti-Corruption / Transparency', 'Justice', 'Other',
] as const;

const OBS_SECTORS_V11 = [
  'education', 'health', 'security', 'infrastructure', 'water-sanitation', 'employment',
  'public-finance', 'governance', 'agriculture', 'environment',
] as const;

const REQUIRED_MAPPING_KEYS = [
  'dutyId', 'sectorId', 'relationshipType', 'mappingVersion', 'effectiveDate', 'reviewStatus', 'note',
] as const;

describe('duty–sector crosswalk v1.1', () => {
  const doc = loadJson('contracts/stage2/duty-sector-crosswalk.v1.json');
  it('declares 10 sectors and preserves original eight ids', () => {
    expect(doc.facetTaxonomy.count).toBe(10);
    expect(doc.facetTaxonomy.addedInV1_1).toEqual(['agriculture', 'environment']);
    expect(doc.facetTaxonomy.preservedFromV1).toHaveLength(8);
  });
  it('represents all 18 Mandate duties with complete relationship fields', () => {
    const all = new Set(doc.mappings.map((m: { dutyId: string }) => m.dutyId));
    for (const d of MASTER_DUTIES) expect(all.has(d)).toBe(true);
    for (const m of doc.mappings) {
      for (const k of REQUIRED_MAPPING_KEYS) {
        expect(m[k], `${m.dutyId} missing ${k}`).toBeTruthy();
      }
      expect(OBS_SECTORS_V11.includes(m.sectorId)).toBe(true);
    }
  });
  it('maps Agriculture and Environment as primary', () => {
    expect(doc.mappings).toContainEqual(
      expect.objectContaining({ dutyId: 'Agriculture', sectorId: 'agriculture', relationshipType: 'primary' }),
    );
    expect(doc.mappings).toContainEqual(
      expect.objectContaining({ dutyId: 'Environment', sectorId: 'environment', relationshipType: 'primary' }),
    );
  });
  it('treats Youth as cross-cutting only', () => {
    const youth = doc.mappings.filter((m: { dutyId: string }) => m.dutyId === 'Youth Development');
    expect(youth.every((m: { relationshipType: string }) => m.relationshipType === 'cross-cutting')).toBe(true);
  });
  it('keeps Housing and Social Protection interim', () => {
    expect(doc.mappings.find((m: { dutyId: string }) => m.dutyId === 'Housing').relationshipType).toBe('interim');
    expect(doc.mappings.find((m: { dutyId: string }) => m.dutyId === 'Social Protection').relationshipType).toBe('interim');
  });
});

describe('geographic reference v1.1', () => {
  const geo = loadJson('contracts/stage2/geographic-reference.v1.json');
  it('freezes 36 states + FCT without invented LGA ids', () => {
    expect(geo.states).toHaveLength(37);
    expect(geo.v1Scope.notInScope).toEqual(
      expect.arrayContaining(['lga', 'ward', 'community', 'public_service_location']),
    );
  });
  it('resolves FCT and Federal Capital Territory; keeps Nassarawa legacy', () => {
    const by = Object.fromEntries(
      geo.aliases.map((a: { alias: string; stateId: string | null }) => [a.alias, a.stateId]),
    );
    expect(by['FCT']).toBe('ng-fct');
    expect(by['Federal Capital Territory']).toBe('ng-fct');
    expect(by['Nassarawa']).toBe('ng-nasarawa');
  });
  it('does not auto-resolve Abuja to FCT', () => {
    const abu = geo.aliases.find((a: { alias: string }) => a.alias === 'Abuja');
    expect(abu.stateId).toBeNull();
    expect(abu.confidence).toBe('ambiguous');
  });
});

describe('PublicMandateRecord allowlist converter', () => {
  const fixture = loadJson('contracts/stage2/fixtures/pulse-public-sample.json');
  const base = fixture.voices[0] as Record<string, unknown>;

  it('converts published voices', () => {
    const first = pulseVoiceToPublicMandate(base as never);
    expect(first.schemaVersion).toBe(PUBLIC_MANDATE_RECORD_SCHEMA_VERSION);
    expect(first.publicationStatus).toBe('Published');
    expect(first.id).toBe(base.id);
  });

  it('rejects unpublished', () => {
    expect(() => pulseVoiceToPublicMandate(base as never, { publicationStatus: 'New' })).toThrow(
      PublicMandateContractError,
    );
  });

  it('constructs from allowlist only — unknown keys never appear in output', () => {
    const dirty = {
      ...base,
      secretInternalScore: 99,
      operatorQueue: 'fast-track',
    };
    const picked = pickPublicPulseFields(dirty);
    expect(Object.keys(picked).every((k) => (PUBLIC_PULSE_FIELD_ALLOWLIST as readonly string[]).includes(k))).toBe(true);
    expect(picked).not.toHaveProperty('secretInternalScore');

    const out = pulseVoiceToPublicMandate(dirty as never);
    const outKeys = Object.keys(out);
    for (const k of outKeys) {
      expect((PUBLIC_MANDATE_OUTPUT_KEYS as readonly string[]).includes(k)).toBe(true);
    }
    const json = JSON.stringify(out);
    expect(json).not.toContain('secretInternalScore');
    expect(json).not.toContain('fast-track');
  });

  it('rejects private fields and never leaks them', () => {
    for (const key of ['gender', 'deviceFingerprint', 'email', 'Age Band', 'Response Evidence']) {
      expect(() => pulseVoiceToPublicMandate({ ...base, [key]: 'x' } as never)).toThrow(/Private field/);
    }
  });

  it('marks Abuja ambiguous and preserves original text', () => {
    const rec = pulseVoiceToPublicMandate({ ...base, state: 'Abuja' } as never);
    expect(rec.geo?.stateId).toBeNull();
    expect(rec.geo?.resolution).toBe('ambiguous');
    expect(rec.geo?.originalSubmittedText).toBe('Abuja');
  });

  it('handles missing optional fields safely', () => {
    const minimal = { id: 'x1', sentence: 'Repair the market road.', created: '2026-10-01T00:00:00.000Z' };
    const rec = pulseVoiceToPublicMandate(minimal as never);
    expect(rec.duty).toBeNull();
    expect(rec.office).toBeNull();
    expect(rec.geo?.resolution).toBe('not_applicable');
  });

  it('errors on invalid records', () => {
    expect(() => pulseVoiceToPublicMandate({ sentence: 'x', created: '2026-01-01' } as never)).toThrow();
    expect(() => pulseVoiceToPublicMandate({ id: '1', created: '2026-01-01' } as never)).toThrow();
  });

  it('DEFAULT_STATE_RESOLVER policy', () => {
    expect(DEFAULT_STATE_RESOLVER('FCT').stateId).toBe('ng-fct');
    expect(DEFAULT_STATE_RESOLVER('Abuja').resolution).toBe('ambiguous');
    expect(DEFAULT_STATE_RESOLVER('Nassarawa').stateId).toBe('ng-nasarawa');
  });

  it('example has no denylisted keys', () => {
    const keys = Object.keys(EXAMPLE_VALID_PUBLIC_MANDATE_RECORD).map((k) => k.toLowerCase());
    expect(keys).not.toContain('gender');
    expect(PRIVATE_FIELD_DENYLIST.length).toBeGreaterThan(5);
  });
});
