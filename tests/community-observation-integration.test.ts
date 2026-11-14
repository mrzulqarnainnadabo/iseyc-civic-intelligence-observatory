import { describe, expect, it, vi } from 'vitest';
import { createMandatePulseAdapter } from '../src/adapters/mandatePulseAdapter';

const demandResponse = {
  contractVersion: '0.1.0',
  publicationBoundary: 'published-only',
  verificationNote: 'Publication after human review is not independent verification.',
  prevalenceNote: 'Published records are not a measure of national need.',
  page: 1,
  pageSize: 50,
  total: 0,
  totalPages: 1,
  truncatedUpstream: false,
  filters: { state: null, lga: null, duty: null, sector: null, since: null, until: null },
  records: [],
};

const observationResponse = {
  contractVersion: '0.1.0',
  publicationBoundary: 'published-only',
  page: 1,
  pageSize: 50,
  total: 0,
  totalPages: 1,
  truncatedUpstream: false,
  records: [],
};

describe('Mandate adapter observation feed separation', () => {
  it('loads observations independently from demand records', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/v1/community-observations')) return new Response(JSON.stringify(observationResponse), { status: 200 });
      if (url.includes('/api/v1/community-records')) return new Response(JSON.stringify(demandResponse), { status: 200 });
      throw new Error('Unexpected fallback endpoint');
    }) as unknown as typeof fetch;
    const adapter = createMandatePulseAdapter({ fetchImpl });
    const observations = await adapter.getCommunityObservations?.();
    expect(observations?.status).toBe('empty');
    expect(observations?.records).toEqual([]);
    expect(await adapter.getRecords()).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('keeps demand records available when the observation feed is unavailable', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/v1/community-observations')) return new Response(JSON.stringify({ error: 'unavailable' }), { status: 503 });
      if (url.includes('/api/v1/community-records')) return new Response(JSON.stringify(demandResponse), { status: 200 });
      throw new Error('Unexpected fallback endpoint');
    }) as unknown as typeof fetch;
    const adapter = createMandatePulseAdapter({ fetchImpl });
    const observations = await adapter.getCommunityObservations?.();
    expect(observations?.status).toBe('unavailable');
    expect(observations?.records).toEqual([]);
    expect(await adapter.getRecords()).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
