import { describe, expect, it, vi } from 'vitest';
import { fetchEvidenceVaultRecords } from '../src/adapters/evidenceVaultAdapter';

const record = {
  id: 'evidence-1',
  displayId: 'EV-1',
  contractVersion: '0.1.0',
  publicationStatus: 'published',
  verificationStatus: 'content_corroborated',
  evidenceType: 'official',
  evidenceScope: 'statistical-observation',
  title: 'Nigeria population total — 2024',
  sourceTitle: 'Population, total',
  sourceUrl: 'https://api.worldbank.org/v2/country/NGA/indicator/SP.POP.TOTL?format=json',
  sourceId: 'worldbank-wdi-population',
  publisher: 'World Bank',
  indicatorCode: 'SP.POP.TOTL',
  measure: 'Population, total',
  unit: 'persons',
  observedValue: 232679478,
  valueStatus: 'estimated',
  geographicLevel: 'national',
  geographicUnit: 'Nigeria',
  referencePeriod: '2024',
  retrievedAt: '2026-11-04',
  methodology: 'Official WDI API response.',
  limitations: 'National estimate only.',
  dataStatus: 'ingested',
  evidenceLinkReview: 'content-checked',
  evidenceRelation: 'corroborates',
  linkedCommunityObservationId: 'abc-123',
  linkedDemandId: null,
  createdAt: '2026-11-04T10:00:00.000Z',
};

function page(records: unknown[], overrides: Record<string, unknown> = {}) {
  return {
    contractVersion: '0.1.0',
    publicationBoundary: 'published-and-dual-reviewed-only',
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

describe('Evidence Vault v0.1 adapter', () => {
  it('accepts a dual-reviewed, content-corroborated evidence relation', async () => {
    const fetchImpl = vi.fn(async () => json(page([record]))) as unknown as typeof fetch;
    const result = await fetchEvidenceVaultRecords({ fetchImpl });
    expect(result.status).toBe('ready');
    expect(result.records).toHaveLength(1);
    expect(result.records[0]).toMatchObject({
      displayId: 'EV-1',
      verificationStatus: 'content_corroborated',
      evidenceRelation: 'corroborates',
      linkedCommunityObservationId: 'abc-123',
      observedValue: 232679478,
      geographicLevel: 'national',
    });
  });

  it('treats a valid empty feed as empty', async () => {
    const fetchImpl = vi.fn(async () => json(page([], { total: 0 }))) as unknown as typeof fetch;
    const result = await fetchEvidenceVaultRecords({ fetchImpl });
    expect(result.status).toBe('empty');
    expect(result.records).toEqual([]);
  });

  it('rejects a corroboration relation without a linked observation', async () => {
    const fetchImpl = vi.fn(async () => json(page([{ ...record, linkedCommunityObservationId: null }]))) as unknown as typeof fetch;
    const result = await fetchEvidenceVaultRecords({ fetchImpl });
    expect(result.status).toBe('invalid');
    expect(result.records).toEqual([]);
  });

  it('rejects corroboration when only the source link is confirmed', async () => {
    const fetchImpl = vi.fn(async () => json(page([{ ...record, verificationStatus: 'source_confirmed' }]))) as unknown as typeof fetch;
    const result = await fetchEvidenceVaultRecords({ fetchImpl });
    expect(result.status).toBe('invalid');
    expect(result.records).toEqual([]);
  });

  it('rejects contradictory relations without disputed status', async () => {
    const fetchImpl = vi.fn(async () => json(page([{ ...record, evidenceRelation: 'contradicts' }]))) as unknown as typeof fetch;
    const result = await fetchEvidenceVaultRecords({ fetchImpl });
    expect(result.status).toBe('invalid');
    expect(result.records).toEqual([]);
  });

  it('rejects private reviewer fields', async () => {
    const fetchImpl = vi.fn(async () => json(page([{ ...record, primaryReviewer: 'person-id' }]))) as unknown as typeof fetch;
    const result = await fetchEvidenceVaultRecords({ fetchImpl });
    expect(result.status).toBe('invalid');
    expect(result.records).toEqual([]);
  });

  it('rejects non-HTTPS source links', async () => {
    const fetchImpl = vi.fn(async () => json(page([{ ...record, sourceUrl: 'http://example.com' }]))) as unknown as typeof fetch;
    const result = await fetchEvidenceVaultRecords({ fetchImpl });
    expect(result.status).toBe('invalid');
    expect(result.records).toEqual([]);
  });

  it('fails closed on truncated source retrieval', async () => {
    const fetchImpl = vi.fn(async () => json(page([record], { total: 2, totalPages: 2, truncatedUpstream: true }))) as unknown as typeof fetch;
    const result = await fetchEvidenceVaultRecords({ fetchImpl });
    expect(result.status).toBe('incomplete');
    expect(result.records).toEqual([]);
  });

  it('does not substitute source registry or demo records on an outage', async () => {
    const fetchImpl = vi.fn(async () => json({ message: 'unavailable' }, 503)) as unknown as typeof fetch;
    const result = await fetchEvidenceVaultRecords({ fetchImpl });
    expect(result.status).toBe('unavailable');
    expect(result.records).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
