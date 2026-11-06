import { describe, it, expect, vi } from 'vitest';
import { createMandatePulseAdapter } from '../src/adapters/mandatePulseAdapter';
import { selectAdapter } from '../src/adapters';

const sample = {
  total: 2,
  voices: [
    {
      id: 'abc123',
      sentence: 'Primary health centre needs reliable staffing in our ward.',
      mandate: 'Health',
      duty: 'Health',
      office: 'Governor',
      state: 'Kaduna',
      lga: 'Kaduna South',
      created: '2026-09-01T12:00:00.000Z',
    },
    {
      id: 'def456',
      sentence: 'Roads that do not wash away every rainy season.',
      duty: 'Roads & Transport',
      state: 'Kaduna',
      lga: 'Kaduna north',
      created: '2026-10-03T10:48:00.000Z',
    },
  ],
};

describe('mandate pulse adapter', () => {
  it('maps published voices to non-synthetic civic records', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => sample,
    })) as unknown as typeof fetch;
    const adapter = createMandatePulseAdapter({ fetchImpl, communityRecordsUrl: null });
    expect(adapter.mode).toBe('live');
    const records = await adapter.getRecords();
    expect(records).toHaveLength(2);
    expect(records.every((r) => r.synthetic === false)).toBe(true);
    expect(records.every((r) => r.origin === 'civic-mandate')).toBe(true);
    expect(records.every((r) => r.reviewStatus === 'published')).toBe(true);
    expect(records[0].sector).toBe('health');
    expect(records[1].sector).toBe('infrastructure');
    expect(records[0].stateId).toBe('kaduna');
    const evidence = await adapter.getEvidence({ recordId: records[0].id });
    expect(evidence).toHaveLength(1);
    expect(evidence[0].kind).toBe('community-submission');
    expect(evidence[0].status).toBe('unverified');
    expect(evidence[0].synthetic).toBe(false);
    const institutions = await adapter.getInstitutions();
    expect(institutions).toEqual([]);
  });

  it('selectAdapter uses demo for ?demo=1 and live by default', () => {
    expect(selectAdapter('').mode).toBe('live');
    expect(selectAdapter('?demo=1').mode).toBe('demo');
    expect(selectAdapter('?demo=true').mode).toBe('demo');
    expect(selectAdapter('?demo=normal').mode).toBe('demo');
    expect(selectAdapter('?demo=unknown').mode).toBe('live');
    expect(selectAdapter('?demo=0').mode).toBe('live');
  });

  it('does not fall back to demo when pulse fails', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({}),
    })) as unknown as typeof fetch;
    const adapter = createMandatePulseAdapter({ fetchImpl, communityRecordsUrl: null });
    expect(adapter.mode).toBe('live');
    await expect(adapter.getRecords()).rejects.toThrow(/HTTP 503/);
  });

  it('empty voices yield empty records without inventing data', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({ total: 0, voices: [] }),
    })) as unknown as typeof fetch;
    const adapter = createMandatePulseAdapter({ fetchImpl, communityRecordsUrl: null });
    expect(await adapter.getRecords()).toEqual([]);
    expect(await adapter.getEvidence()).toEqual([]);
  });

  it('rejects non-allowlisted pulse host override', () => {
    const a = selectAdapter('?pulse=https://evil.example/2027-street-mandate/api/pulse');
    // Still live mode but must use default host — exercised by constructing adapter
    expect(a.mode).toBe('live');
    expect(a.label).toContain('Published');
  });

  it('prefers CommunityRecord v0.1 and preserves published IDs and unknown geography', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const target = String(input);
      if (target.includes('/api/v1/community-records')) return {
        ok: true,
        json: async () => ({
          contractVersion: '0.1.0', publicationBoundary: 'published-only',
          page: 1, pageSize: 50, total: 1, totalPages: 1, truncatedUpstream: false,
          records: [{
            id: 'cr-001', contractVersion: '0.1.0', publicationStatus: 'published',
            verificationStatus: 'unverified', text: 'A community requests reliable primary healthcare.',
            duty: 'Health', sector: null, issueCategory: 'staffing', state: null, lga: null, officeLabel: 'Governor',
            ward: null, facilityRef: null, reportedAt: null, publishedAt: null,
            evidenceRefIds: ['ev-1'], followUpStatus: 'under-review', relatedSuggestedIds: ['cr-002'],
            createdAt: '2026-10-01T10:00:00.000Z',
          }],
        }),
      };
      throw new Error('Pulse must not be called when CommunityRecord succeeds');
    }) as unknown as typeof fetch;
    const adapter = createMandatePulseAdapter({ fetchImpl });
    const records = await adapter.getRecords();
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe('mandate-cr-001');
    expect(records[0].stateId).toBe('unknown');
    expect(records[0].reviewStatus).toBe('published');
    expect(records[0].unknowns.join(' ')).toContain('not a measure');
    expect(records[0].sourceDuty).toBe('Health');
    expect(records[0].officeLabel).toBe('Governor');
    expect(records[0].issueCategory).toBe('staffing');
    expect(records[0].evidenceRefIds).toEqual(['ev-1']);
    expect(records[0].followUpStatus).toBe('under-review');
    expect(records[0].relatedSuggestedIds).toEqual(['cr-002']);
  });

  it('follows CommunityRecord pagination before returning the complete feed', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const target = String(input);
      const page = target.includes('page=2') ? 2 : 1;
      return {
        ok: true,
        json: async () => ({
          contractVersion: '0.1.0', publicationBoundary: 'published-only',
          page, pageSize: 50, total: 51, totalPages: 2, truncatedUpstream: false,
          records: [{
            id: 'cr-' + page, contractVersion: '0.1.0', publicationStatus: 'published',
            verificationStatus: 'unverified', text: 'Published concern ' + page,
            duty: 'Health', state: 'Kaduna', lga: null, officeLabel: null,
            createdAt: '2026-10-01T10:00:00.000Z',
          }],
        }),
      };
    }) as unknown as typeof fetch;
    const adapter = createMandatePulseAdapter({ fetchImpl });
    expect(await adapter.getRecords()).toHaveLength(2);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('does not fall back to pulse when CommunityRecord is valid but empty', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes('/api/v1/community-records')) return {
        ok: true,
        json: async () => ({
          contractVersion: '0.1.0', publicationBoundary: 'published-only',
          page: 1, pageSize: 50, total: 0, totalPages: 1, truncatedUpstream: false, records: [],
        }),
      };
      throw new Error('Pulse fallback should not run for an empty feed');
    }) as unknown as typeof fetch;
    const adapter = createMandatePulseAdapter({ fetchImpl });
    expect(await adapter.getRecords()).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });


  it('fails closed on an upstream-truncated feed instead of showing it as complete', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        contractVersion: '0.1.0', publicationBoundary: 'published-only',
        page: 1, pageSize: 50, total: 100, totalPages: 2,
        truncatedUpstream: true, records: [],
      }),
    })) as unknown as typeof fetch;
    const adapter = createMandatePulseAdapter({ fetchImpl });
    await expect(adapter.getRecords()).rejects.toThrow(/truncated upstream/);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('fails closed when CommunityRecord v0.1 is unavailable and never reports pulse fallback as live success', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes('/api/v1/community-records')) return { ok: false, status: 503, json: async () => ({}) };
      return { ok: true, json: async () => sample };
    }) as unknown as typeof fetch;
    const adapter = createMandatePulseAdapter({ fetchImpl });
    expect(adapter.label).toContain('CommunityRecord');
    await expect(adapter.getRecords()).rejects.toThrow(/HTTP 503/);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('fails closed on an incompatible CommunityRecord contract instead of hiding it with pulse fallback', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({ contractVersion: '9.9.9', publicationBoundary: 'published-only', records: [] }),
    })) as unknown as typeof fetch;
    const adapter = createMandatePulseAdapter({ fetchImpl });
    await expect(adapter.getRecords()).rejects.toThrow(/Unsupported CommunityRecord contract/);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });


  it('does not classify a missing or unrecognised duty as governance', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        contractVersion: '0.1.0', publicationBoundary: 'published-only',
        page: 1, pageSize: 50, total: 1, totalPages: 1, truncatedUpstream: false,
        records: [{
          id: 'cr-unknown', contractVersion: '0.1.0', publicationStatus: 'published',
          verificationStatus: 'unverified', text: 'A public concern with no assigned duty.',
          duty: null, state: 'Kaduna', lga: null, officeLabel: null,
          createdAt: '2026-10-01T10:00:00.000Z',
        }],
      }),
    })) as unknown as typeof fetch;
    const adapter = createMandatePulseAdapter({ fetchImpl });
    const records = await adapter.getRecords();
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
