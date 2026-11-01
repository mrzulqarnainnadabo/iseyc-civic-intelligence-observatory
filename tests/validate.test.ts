import { describe, expect, it } from 'vitest';
import { findPrivateKeys, validateCivicRecord, validateEvidenceItem, validateDataset } from '../src/lib/validate';
import { SYNTHETIC_EVIDENCE, SYNTHETIC_RECORDS } from '../src/data/synthetic';
import { INSTITUTIONS } from '../src/data/synthetic/institutions';
import registry from '../src/data/source-registry.json';
import mapData from '../src/data/geo/nigeria-map.json';

const states = mapData.locations.map(({ id, name }) => ({ id, name }));

describe('data contract validation', () => {
  it('accepts every shipped synthetic record and evidence item', () => {
    for (const r of SYNTHETIC_RECORDS) expect(validateCivicRecord(r), r.id).toEqual({ ok: true, errors: [] });
    for (const e of SYNTHETIC_EVIDENCE) expect(validateEvidenceItem(e), e.id).toEqual({ ok: true, errors: [] });
  });
  it('labels every shipped record and evidence item as synthetic', () => {
    expect(SYNTHETIC_RECORDS.every(r => r.synthetic && r.origin === 'observatory-demo' && r.title.startsWith('Demonstration:'))).toBe(true);
    expect(SYNTHETIC_EVIDENCE.every(e => e.synthetic)).toBe(true);
  });
  it('rejects operator-only and personal fields at any depth', () => {
    const bad = { ...SYNTHETIC_RECORDS[0], deviceFingerprint: 'abc', nested: { ageBand: '18-24' } };
    expect(findPrivateKeys(bad)).toEqual(['$.deviceFingerprint', '$.nested.ageBand']);
    expect(validateCivicRecord(bad).ok).toBe(false);
  });
  it('rejects records that are not Published', () => {
    expect(validateCivicRecord({ ...SYNTHETIC_RECORDS[0], reviewStatus: 'new' }).ok).toBe(false);
  });
  it('rejects a community submission marked as verified', () => {
    const e = { ...SYNTHETIC_EVIDENCE[0], kind: 'community-submission', status: 'verified' };
    expect(validateEvidenceItem(e).errors.join()).toMatch(/cannot be marked verified/);
  });
  it('requires an explicit synthetic flag and all six stages', () => {
    const { synthetic: _s, ...rest } = SYNTHETIC_RECORDS[0]; void _s;
    expect(validateCivicRecord(rest).ok).toBe(false);
    expect(validateCivicRecord({ ...SYNTHETIC_RECORDS[0], stages: [] }).ok).toBe(false);
  });
  it('requires at least one limitation on every evidence item', () => {
    expect(validateEvidenceItem({ ...SYNTHETIC_EVIDENCE[0], limitations: [] }).ok).toBe(false);
  });
});

describe('adversarial public contract checks', () => {
  it('rejects private key spelling variations and nested secrets', () => {
    const x = { ...SYNTHETIC_RECORDS[0], metadata: { 'Submitter Name': 'x', device_fingerprint: 'x', API_TOKEN: 'x' } };
    expect(findPrivateKeys(x).length).toBeGreaterThanOrEqual(3);
    expect(validateCivicRecord(x).ok).toBe(false);
  });
  it('rejects unexpected fields under strict public allowlists', () => {
    expect(validateCivicRecord({ ...SYNTHETIC_RECORDS[0], arbitraryPublicField: 'x' }).ok).toBe(false);
    expect(validateEvidenceItem({ ...SYNTHETIC_EVIDENCE[0], internalStatus: 'approved' }).ok).toBe(false);
  });
  it('rejects malformed dates and invalid stage states', () => {
    expect(validateEvidenceItem({ ...SYNTHETIC_EVIDENCE[0], date: '2026-02-31' }).ok).toBe(false);
    const stages = SYNTHETIC_RECORDS[0].stages.map((s, i) => i === 0 ? { ...s, status: 'done' } : s);
    expect(validateCivicRecord({ ...SYNTHETIC_RECORDS[0], stages }).ok).toBe(false);
  });
});

describe('strict date and cross-entity integrity regressions', () => {
  it('rejects impossible calendar dates rather than normalising them', () => {
    expect(validateEvidenceItem({ ...SYNTHETIC_EVIDENCE[0], date: '2026-02-31' }).ok).toBe(false);
  });
  it('rejects evidence whose sector or state differs from its civic record', () => {
    const evidence = SYNTHETIC_EVIDENCE.map(e => ({ ...e }));
    evidence[0] = { ...evidence[0], sector: 'health' };
    expect(validateDataset(SYNTHETIC_RECORDS, evidence, INSTITUTIONS, registry, states).ok).toBe(false);
    const evidenceWithWrongState = SYNTHETIC_EVIDENCE.map(e => ({ ...e }));
    evidenceWithWrongState[0] = { ...evidenceWithWrongState[0], stateId: 'lagos' };
    expect(validateDataset(SYNTHETIC_RECORDS, evidenceWithWrongState, INSTITUTIONS, registry, states).ok).toBe(false);
  });
  it('rejects stage evidence attached to a different civic record', () => {
    const records = SYNTHETIC_RECORDS.map(r => ({ ...r, stages: r.stages.map(s => ({ ...s })) }));
    records[1].stages = records[1].stages.map(s => s.stage === 'referred' ? { ...s, status: 'evidenced' as const, evidenceId: 'ev-001' } : s);
    expect(validateDataset(records, SYNTHETIC_EVIDENCE, INSTITUTIONS, registry, states).ok).toBe(false);
  });
});

describe('source registry contract hardening', () => {
  it('accepts every shipped source registry entry', () => {
    for (const source of registry) {
      expect(validateDataset([], [], [], [source], states).ok, source.id).toBe(true);
    }
  });
  it('rejects malformed URLs, embedded credentials and inconsistent URL status', () => {
    const base = registry[0];
    expect(validateDataset([], [], [], [{ ...base, url: 'https://not a url' }], states).ok).toBe(false);
    expect(validateDataset([], [], [], [{ ...base, url: 'https://user:pass@example.org/path' }], states).ok).toBe(false);
    expect(validateDataset([], [], [], [{ ...base, url: null }], states).ok).toBe(false);
    expect(validateDataset([], [], [], [{ ...base, urlStatus: 'documented-not-reconfirmed', lastChecked: '2026-10-30' }], states).ok).toBe(false);
  });
  it('rejects empty sectors or limitations in source records', () => {
    const base = registry[0];
    expect(validateDataset([], [], [], [{ ...base, sectors: [] }], states).ok).toBe(false);
    expect(validateDataset([], [], [], [{ ...base, limitations: [] }], states).ok).toBe(false);
  });
});
