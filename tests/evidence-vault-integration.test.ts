import { describe, expect, it, vi } from 'vitest';
import { createMandatePulseAdapter } from '../src/adapters/mandatePulseAdapter';

const emptyPage = (boundary: string) => ({
  contractVersion: '0.1.0',
  publicationBoundary: boundary,
  page: 1,
  pageSize: 50,
  total: 0,
  totalPages: 1,
  truncatedUpstream: false,
  records: [],
});

describe('Evidence Vault feed separation', () => {
  it('loads the Evidence Vault independently from Civic Mandate demands', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/v1/evidence-records')) return new Response(JSON.stringify(emptyPage('published-and-dual-reviewed-only')), { status: 200 });
      if (url.includes('/api/v1/community-records')) return new Response(JSON.stringify(emptyPage('published-only')), { status: 200 });
      throw new Error('Unexpected fallback endpoint');
    }) as unknown as typeof fetch;
    const adapter = createMandatePulseAdapter({ fetchImpl });
    const vault = await adapter.getEvidenceVaultRecords?.();
    expect(vault?.status).toBe('empty');
    expect(vault?.records).toEqual([]);
    expect(await adapter.getRecords()).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('keeps the demand feed available when the Evidence Vault is unavailable', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/v1/evidence-records')) return new Response(JSON.stringify({ error: 'unavailable' }), { status: 503 });
      if (url.includes('/api/v1/community-records')) return new Response(JSON.stringify(emptyPage('published-only')), { status: 200 });
      throw new Error('Unexpected fallback endpoint');
    }) as unknown as typeof fetch;
    const adapter = createMandatePulseAdapter({ fetchImpl });
    const vault = await adapter.getEvidenceVaultRecords?.();
    expect(vault?.status).toBe('unavailable');
    expect(vault?.records).toEqual([]);
    expect(await adapter.getRecords()).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
