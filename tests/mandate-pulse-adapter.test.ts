import { describe, it, expect, vi } from 'vitest';
import { createMandatePulseAdapter } from '../src/adapters/mandatePulseAdapter';
import { selectAdapter } from '../src/adapters';

const makeRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 'cr-001', contractVersion: '0.1.0', publicationStatus: 'published',
  verificationStatus: 'unverified', text: 'A community requests reliable primary healthcare.',
  duty: 'Health', sector: null, issueCategory: 'staffing', state: 'Kaduna',
  lga: 'Kaduna South', officeLabel: 'Governor', ward: null, facilityRef: null,
  reportedAt: null, publishedAt: null, evidenceRefIds: ['ev-1'],
  followUpStatus: 'under-review', relatedSuggestedIds: ['cr-002'],
  createdAt: '2026-10-01T10:00:00.000Z', ...overrides,
});
const makePage = (records: ReturnType<typeof makeRecord>[], overrides: Record<string, unknown> = {}) => ({
  contractVersion: '0.1.0', publicationBoundary: 'published-only',
  page: 1, pageSize: 50, total: records.length, totalPages: 1,
  truncatedUpstream: false, records, ...overrides,
});

describe('mandate CommunityRecord adapter', () => {
  it('uses demo only for explicit recognised query values', () => {
    expect(selectAdapter('').mode).toBe('live');
    expect(selectAdapter('?demo=1').mode).toBe('demo');
    expect(selectAdapter('?demo=true').mode).toBe('demo');
    expect(selectAdapter('?demo=normal').mode).toBe('demo');
    expect(selectAdapter('?demo=unknown').mode).toBe('live');
    expect(selectAdapter('?demo=0').mode).toBe('live');
  });

  it('preserves source identity, duty, office, geography and verification status', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true, json: async () => makePage([makeRecord()]),
    })) as unknown as typeof fetch;
    const adapter = createMandatePulseAdapter({ fetchImpl });
    const records = await adapter.getRecords();
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe('mandate-cr-001');
    expect(records[0].sourceRecordId).toBe('cr-001');
    expect(records[0].stateId).toBe('kaduna');
    expect(records[0].lga).toBe('Kaduna South');
    expect(records[0].reviewStatus).toBe('published');
    expect(records[0].verificationStatus).toBe('unverified');
    expect(records[0].sourceDuty).toBe('Health');
    expect(records[0].officeLabel).toBe('Governor');
    expect(records[0].issueCategory).toBe('staffing');
    expect(records[0].evidenceRefIds).toEqual(['ev-1']);
    expect(records[0].followUpStatus).toBe('under-review');
    expect(records[0].relatedSuggestedIds).toEqual(['cr-002']);
    const evidence = await adapter.getEvidence({ recordId: records[0].id });
    expect(evidence).toHaveLength(1);
    expect(evidence[0].status).toBe('unverified');
    expect(await adapter.getInstitutions()).toEqual([]);
  });

  it('preserves unknown geography without inventing a state', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true, json: async () => makePage([makeRecord({ state: null, lga: null })]),
    })) as unknown as typeof fetch;
    const records = await createMandatePulseAdapter({ fetchImpl }).getRecords();
    expect(records[0].stateId).toBe('unknown');
    expect(records[0].lga).toBeUndefined();
  });

  it('rejects additional/private properties and invalid verification states', async () => {
    for (const bad of [
      makeRecord({ email: 'private@example.test' }),
      makeRecord({ verificationStatus: 'verified' }),
    ]) {
      const fetchImpl = vi.fn(async () => ({
        ok: true, json: async () => makePage([bad]),
      })) as unknown as typeof fetch;
      await expect(createMandatePulseAdapter({ fetchImpl }).getRecords()).rejects.toThrow(/allowlist or field contract/);
    }
  });

  it('keeps valid empty feeds empty', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true, json: async () => makePage([]),
    })) as unknown as typeof fetch;
    const adapter = createMandatePulseAdapter({ fetchImpl });
    expect(await adapter.getRecords()).toEqual([]);
    expect(await adapter.getEvidence()).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('fails closed on an upstream outage', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) })) as unknown as typeof fetch;
    await expect(createMandatePulseAdapter({ fetchImpl }).getRecords()).rejects.toThrow(/HTTP 503/);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('fails closed on an upstream-truncated feed', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true, json: async () => makePage([], { total: 100, totalPages: 2, truncatedUpstream: true }),
    })) as unknown as typeof fetch;
    await expect(createMandatePulseAdapter({ fetchImpl }).getRecords()).rejects.toThrow(/truncated/);
  });

  it('rejects an incompatible contract instead of switching to legacy Pulse', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true, json: async () => ({ contractVersion: '9.9.9', publicationBoundary: 'published-only', records: [] }),
    })) as unknown as typeof fetch;
    await expect(createMandatePulseAdapter({ fetchImpl }).getRecords()).rejects.toThrow(/Unsupported/);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('follows all pages and requires the declared complete record count', async () => {
    const first = Array.from({ length: 50 }, (_, i) => makeRecord({ id: 'page-1-' + i }));
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const n = Number(new URL(String(input)).searchParams.get('page') || 1);
      return {
        ok: true,
        json: async () => makePage(
          n === 1 ? first : [makeRecord({ id: 'page-2-1' })],
          { page: n, total: 51, totalPages: 2 },
        ),
      };
    }) as unknown as typeof fetch;
    const records = await createMandatePulseAdapter({ fetchImpl }).getRecords();
    expect(records).toHaveLength(51);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('rejects a feed that returns fewer records than its declared total', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const n = Number(new URL(String(input)).searchParams.get('page') || 1);
      return {
        ok: true,
        json: async () => makePage([makeRecord({ id: 'short-' + n })], { page: n, total: 51, totalPages: 2 }),
      };
    }) as unknown as typeof fetch;
    await expect(createMandatePulseAdapter({ fetchImpl }).getRecords()).rejects.toThrow(/declared complete record count/);
  });

  it('does not classify missing duty as governance', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true, json: async () => makePage([makeRecord({ duty: null })]),
    })) as unknown as typeof fetch;
    const records = await createMandatePulseAdapter({ fetchImpl }).getRecords();
    expect(records[0].sector).toBeNull();
  });
});

import { adapterSearchFromLocation } from '../src/lib/adapter-search';

describe('adapter search from location', () => {
  it('reads demo from hash query used by HashRouter', () => {
    expect(adapterSearchFromLocation('', '#/?demo=1')).toContain('demo=1');
    expect(selectAdapter(adapterSearchFromLocation('', '#/?demo=1')).mode).toBe('demo');
    expect(selectAdapter(adapterSearchFromLocation('', '#/')).mode).toBe('live');
  });
});
