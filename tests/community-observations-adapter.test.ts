import { describe, expect, it, vi } from 'vitest';
import { fetchCommunityObservations } from '../src/adapters/communityObservationsAdapter';

const record = {
  id: 'abc-123',
  displayId: 'CR-1',
  contractVersion: '0.1.0',
  publicationStatus: 'published',
  verificationStatus: 'unverified',
  title: 'Primary health centre has no running water',
  reportType: 'Service access gap',
  sector: 'Health',
  state: 'Kaduna',
  lga: 'Kaduna South',
  ward: 'Television',
  placeOrFacility: 'Primary Health Centre A',
  observedOn: '2026-10-22',
  description: 'A published report describes an interruption in water access at the named facility.',
  evidenceTypes: ['First-hand observation'],
  evidenceLink: 'https://example.gov.ng/public-report',
  submittedAt: '2026-10-23T10:00:00.000Z',
  publishedAt: '2026-10-25',
};

function page(records: unknown[], overrides: Record<string, unknown> = {}) {
  return {
    contractVersion: '0.1.0',
    publicationBoundary: 'published-only',
    page: 1,
    pageSize: 50,
    total: records.length,
    totalPages: 1,
    truncatedUpstream: false,
    records,
    ...overrides,
  };
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json' },
});

describe('Community Observation v0.1 adapter', () => {
  it('maps a published observation without turning it into a demand or verified fact', async () => {
    const fetchImpl = vi.fn(async () => json(page([record]))) as unknown as typeof fetch;
    const result = await fetchCommunityObservations({ fetchImpl });
    expect(result.status).toBe('ready');
    expect(result.records).toHaveLength(1);
    expect(result.records[0]).toMatchObject({
      id: 'observation-abc-123',
      synthetic: false,
      publicationStatus: 'published',
      verificationStatus: 'unverified',
      sector: 'health',
      stateId: 'kaduna',
      stateName: 'Kaduna',
      lga: 'Kaduna South',
      ward: 'Television',
      evidenceLink: 'https://example.gov.ng/public-report',
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('treats a valid empty feed as empty and never substitutes demo or demand data', async () => {
    const fetchImpl = vi.fn(async () => json(page([], { total: 0 }))) as unknown as typeof fetch;
    const result = await fetchCommunityObservations({ fetchImpl });
    expect(result.status).toBe('empty');
    expect(result.records).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('follows all pages and checks the final record count', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const pageNumber = new URL(String(input)).searchParams.get('page');
      return pageNumber === '1'
        ? json(page([record], { total: 2, totalPages: 2 }))
        : json({ ...page([{ ...record, id: 'def-456', displayId: 'CR-2' }]), page: 2, total: 2, totalPages: 2 });
    }) as unknown as typeof fetch;
    const result = await fetchCommunityObservations({ fetchImpl });
    expect(result.status).toBe('ready');
    expect(result.records).toHaveLength(2);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('fails closed on an upstream-truncated feed', async () => {
    const fetchImpl = vi.fn(async () => json(page([record], { total: 2, totalPages: 2, truncatedUpstream: true }))) as unknown as typeof fetch;
    const result = await fetchCommunityObservations({ fetchImpl });
    expect(result.status).toBe('incomplete');
    expect(result.records).toEqual([]);
  });

  it('fails closed when retrieved records do not match the advertised total', async () => {
    const fetchImpl = vi.fn(async () => json(page([record], { total: 2 }))) as unknown as typeof fetch;
    const result = await fetchCommunityObservations({ fetchImpl });
    expect(result.status).toBe('incomplete');
    expect(result.records).toEqual([]);
  });

  it('rejects an unsupported contract', async () => {
    const fetchImpl = vi.fn(async () => json(page([record], { contractVersion: '9.9.9' }))) as unknown as typeof fetch;
    const result = await fetchCommunityObservations({ fetchImpl });
    expect(result.status).toBe('invalid');
    expect(result.records).toEqual([]);
  });

  it('rejects private fields rather than silently accepting an expanded public payload', async () => {
    const fetchImpl = vi.fn(async () => json(page([{ ...record, sourceContext: 'private reviewer note' }]))) as unknown as typeof fetch;
    const result = await fetchCommunityObservations({ fetchImpl });
    expect(result.status).toBe('invalid');
    expect(result.records).toEqual([]);
  });

  it('rejects non-HTTPS evidence links', async () => {
    const fetchImpl = vi.fn(async () => json(page([{ ...record, evidenceLink: 'http://example.gov.ng/report' }]))) as unknown as typeof fetch;
    const result = await fetchCommunityObservations({ fetchImpl });
    expect(result.status).toBe('invalid');
    expect(result.records).toEqual([]);
  });

  it('reports upstream outages without falling back to the pulse feed', async () => {
    const fetchImpl = vi.fn(async () => json({ message: 'unavailable' }, 503)) as unknown as typeof fetch;
    const result = await fetchCommunityObservations({ fetchImpl });
    expect(result.status).toBe('unavailable');
    expect(result.records).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('rejects duplicate IDs', async () => {
    const fetchImpl = vi.fn(async () => json(page([record, record]))) as unknown as typeof fetch;
    const result = await fetchCommunityObservations({ fetchImpl });
    expect(result.status).toBe('invalid');
    expect(result.records).toEqual([]);
  });
});
