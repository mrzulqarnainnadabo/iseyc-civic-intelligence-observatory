import { describe, it, expect, vi } from 'vitest';
import {
  listIndicators,
  fetchIndicatorObservations,
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

  it('maps World Bank payload into observations', async () => {
    const ind = listIndicators()[0];
    const payload = [
      { page: 1 },
      [
        { date: '2022', value: 100 },
        { date: '2023', value: 110 },
        { date: '2021', value: null },
      ],
    ];
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => payload,
    })) as unknown as typeof fetch;
    const { observations, error } = await fetchIndicatorObservations(ind, fetchImpl);
    expect(error).toBeUndefined();
    expect(observations).toHaveLength(2);
    expect(observations.map((o) => o.date)).toEqual(['2022', '2023']);
  });

  it('fails soft on HTTP error', async () => {
    const ind = listIndicators()[0];
    const fetchImpl = vi.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({}),
    })) as unknown as typeof fetch;
    const { observations, error } = await fetchIndicatorObservations(ind, fetchImpl);
    expect(observations).toEqual([]);
    expect(error).toBe('HTTP_503');
  });
});
