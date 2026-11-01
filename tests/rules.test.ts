import { describe, expect, it } from 'vitest';
import { claimStrength, countBy, implementationEstablished, registryGaps, stageCounts } from '../src/lib/rules';
import { SYNTHETIC_EVIDENCE, SYNTHETIC_RECORDS } from '../src/data/synthetic';
import type { CivicRecord, EvidenceItem, SourceRecord } from '../src/data/types';
import { STAGES } from '../src/data/types';

const base = (over: Partial<CivicRecord> = {}): CivicRecord => ({
  id: 'T-1', origin: 'observatory-demo', synthetic: true, title: 't', summary: 's', sector: 'health', stateId: 'kaduna',
  kind: 'community-submission', reviewStatus: 'published', publishedMonth: '2026-01', institutionIds: [], unknowns: [], nextSteps: [],
  stages: STAGES.map(stage => ({ stage, status: 'not-reached' as const })), ...over,
});
const ev = (over: Partial<EvidenceItem>): EvidenceItem => ({ id: 'e1', synthetic: true, recordId: 'T-1', kind: 'media-report', status: 'unverified', title: 't', excerpt: 'x', publisherLabel: 'p', date: '2026-01-01', sector: 'health', stateId: 'kaduna', limitations: ['l'], ...over });
const withStage = (r: CivicRecord, stage: string, status: 'evidenced' | 'claimed' | 'unknown', evidenceId?: string) =>
  ({ ...r, stages: r.stages.map(s => (s.stage === stage ? { ...s, status, ...(evidenceId ? { evidenceId } : {}) } : s)) });

describe('accountability rules', () => {
  it('never treats a referral, announcement or funding as implementation', () => {
    let r = base(); for (const s of ['published', 'referred', 'announced', 'funded']) r = withStage(r, s, 'evidenced', 'e1');
    expect(implementationEstablished(r, [ev({})])).toBe(false);
    expect(claimStrength(r, [ev({})])).toBe('announced-only');
  });
  it('treats a claimed implementation as claimed only', () => {
    const r = withStage(base(), 'implemented', 'claimed');
    expect(claimStrength(r, [])).toBe('implementation-claimed');
  });
  it('establishes delivery only with independently-verified, verified evidence for the same record', () => {
    const r = withStage(base(), 'verified', 'evidenced', 'e1');
    expect(implementationEstablished({ ...r, synthetic: false }, [ev({ synthetic: false, kind: 'independently-verified', status: 'verified', verification: { reviewerId: 'reviewer-1', reviewedAt: '2026-10-01', method: 'document-and-site-check' } })])).toBe(true);
    expect(implementationEstablished(r, [ev({ kind: 'media-report', status: 'verified' })])).toBe(false);
    expect(implementationEstablished(r, [ev({ kind: 'independently-verified', status: 'unverified' })])).toBe(false);
    expect(implementationEstablished(r, [ev({ kind: 'independently-verified', status: 'verified', recordId: 'OTHER' })])).toBe(false);
    expect(implementationEstablished(r, [])).toBe(false);
  });
  it('does not count a verified stage cited with non-independent evidence in the funnel', () => {
    const r = withStage(base(), 'verified', 'evidenced', 'e1');
    expect(stageCounts([r], [ev({})]).find(c => c.stage === 'verified')!.reached).toBe(0);
  });
  it('reports "no institutional action" for a record that has only been published', () => {
    expect(claimStrength(base(), [])).toBe('not-yet-acted-on');
  });
  it('keeps the shipped demo data consistent with the rules', () => {
    for (const r of SYNTHETIC_RECORDS) {
      const verified = implementationEstablished(r, SYNTHETIC_EVIDENCE);
      const stage = r.stages.find(s => s.stage === 'verified')!;
      if (stage.status === 'evidenced') expect(verified, r.id).toBe(false);
    }
    expect(SYNTHETIC_RECORDS.filter(r => implementationEstablished(r, SYNTHETIC_EVIDENCE)).length).toBe(0);
  });
  it('countBy counts', () => { expect(countBy(['a', 'b', 'a'], x => x)).toEqual({ a: 2, b: 1 }); });
  it('derives registry gaps without inventing facts', () => {
    const only: SourceRecord[] = [{ id: 'x', publisher: 'p', name: 'n', url: null, urlStatus: 'not-applicable', sectors: ['health'], kind: 'official-data', geographicCoverage: '', geoLevel: 'national', dataType: '', updateFrequency: '', licence: '', lastChecked: null, checkedHow: '', limitations: ['l'], notes: '' }];
    const g = registryGaps(only);
    expect(g.some(x => x.includes('education') && x.includes('No official data source'))).toBe(true);
    expect(g.some(x => /^health/i.test(x) && x.includes('national only'))).toBe(true);
    expect(g.some(x => x.includes('independent verification'))).toBe(true);
  });
});
