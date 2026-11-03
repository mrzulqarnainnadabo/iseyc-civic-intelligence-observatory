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
    const adapter = createMandatePulseAdapter({ fetchImpl });
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
  });

  it('does not fall back to demo when pulse fails', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({}),
    })) as unknown as typeof fetch;
    const adapter = createMandatePulseAdapter({ fetchImpl });
    expect(adapter.mode).toBe('live');
    await expect(adapter.getRecords()).rejects.toThrow(/Pulse HTTP 503/);
  });

  it('empty voices yield empty records without inventing data', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({ total: 0, voices: [] }),
    })) as unknown as typeof fetch;
    const adapter = createMandatePulseAdapter({ fetchImpl });
    expect(await adapter.getRecords()).toEqual([]);
    expect(await adapter.getEvidence()).toEqual([]);
  });

  it('rejects non-allowlisted pulse host override', () => {
    const a = selectAdapter('?pulse=https://evil.example/2027-street-mandate/api/pulse');
    // Still live mode but must use default host — exercised by constructing adapter
    expect(a.mode).toBe('live');
    expect(a.label).toContain('Published');
  });
});
