import { describe, it, expect, vi } from 'vitest';
import {
  listIndicators,
  fetchViaGateway,
  formatIndicatorValue,
  getIndicatorCatalog,
} from '../src/lib/indicators';

describe('indicator catalog', () => {
  it('loads pilot indicators with required metadata', () => {
    const cat = getIndicatorCatalog();
    expect(cat.schemaVersion).toBeTruthy();
    expect(cat.operator).toMatch(/ISEYC/);
    const inds = listIndicators();
    expect(inds.length).toBeGreaterThanOrEqual(3);
    for (const ind of inds) {
      expect(ind.sourcePublisher).toBeTruthy();
      expect(ind.limitations.length).toBeGreaterThan(0);
      expect(ind.definition).toBeTruthy();
      expect(ind.unit).toBeTruthy();
    }
  });

  it('formats values without inventing precision claims', () => {
    expect(formatIndicatorValue(12.34, 'percent (gross)')).toContain('%');
    expect(formatIndicatorValue(227882945, 'persons')).toMatch(/million|227/);
  });

  it('maps gateway payload into observations', async () => {
    const payload = {
      status: 'ok',
      observations: [
        {
          observationId: 'a',
          indicatorId: 'wb-nga-sp-pop-totl',
          referencePeriod: '2022',
          value: 100,
          sourceAttribution: 'World Bank',
          retrievedAt: '2026-11-03T00:00:00.000Z',
        },
        {
          observationId: 'b',
          indicatorId: 'wb-nga-sp-pop-totl',
          referencePeriod: '2023',
          value: 110,
          sourceAttribution: 'World Bank',
          retrievedAt: '2026-11-03T00:00:00.000Z',
        },
      ],
      receipt: { outcome: 'success' },
    };
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => payload,
    })) as unknown as typeof fetch;
    const r = await fetchViaGateway('wb-nga-sp-pop-totl', fetchImpl);
    expect(r.observations).toHaveLength(2);
    expect(r.observations.map((o) => o.referencePeriod)).toEqual(['2022', '2023']);
  });

  it('fails soft when gateway unreachable', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('network');
    }) as unknown as typeof fetch;
    const r = await fetchViaGateway('wb-nga-sp-pop-totl', fetchImpl);
    expect(r.observations).toEqual([]);
    expect(r.errorClass).toBe('GATEWAY_UNREACHABLE');
  });
});
