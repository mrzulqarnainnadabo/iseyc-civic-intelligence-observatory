import { describe, expect, it } from 'vitest';
import { createDemoAdapter } from '../src/adapters/demoAdapter';
import { createHttpAdapter, NotConfiguredError } from '../src/adapters/httpAdapter';
import { selectAdapter } from '../src/adapters';
import { SYNTHETIC_RECORDS } from '../src/data/synthetic';

const okFetch = (body: unknown): typeof fetch => (async () => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } })) as unknown as typeof fetch;
const env = (data: unknown) => ({ schemaVersion: '1.0', datasetMode: 'live', data });
const endpoints = { records: 'https://example.invalid/r', evidence: 'https://example.invalid/e', institutions: 'https://example.invalid/i' };

describe('demo adapter', () => {
  it('returns synthetic records and filters by sector and state', async () => {
    const a = createDemoAdapter({ latencyMs: 0 });
    expect((await a.getRecords()).length).toBe(SYNTHETIC_RECORDS.length);
    const h = await a.getRecords({ sector: 'health' }); expect(h.length).toBeGreaterThan(0); expect(h.every(r => r.sector === 'health')).toBe(true);
    const k = await a.getRecords({ stateId: 'kaduna' }); expect(k.every(r => r.stateId === 'kaduna')).toBe(true);
    expect((await a.getRecords({ text: 'borehole' })).length).toBeGreaterThan(0);
  });
  it('exposes the real registry and all 37 map areas regardless of behaviour', async () => {
    const a = createDemoAdapter({ latencyMs: 0 });
    expect((await a.getSources()).length).toBeGreaterThan(20); expect((await a.getStates()).length).toBe(37);
  });
  it('can simulate empty and error states', async () => {
    expect(await createDemoAdapter({ behaviour: 'empty', latencyMs: 0 }).getRecords()).toEqual([]);
    await expect(createDemoAdapter({ behaviour: 'error', latencyMs: 0 }).getRecords()).rejects.toThrow(/simulated failure/);
  });
  it('reads the behaviour switch from the URL', async () => {
    await expect(selectAdapter('?demo=error').getRecords()).rejects.toThrow();
  });
});

describe('live adapter contract', () => {
  it('refuses to run without explicitly supplied endpoints', async () => {
    await expect(createHttpAdapter().getRecords()).rejects.toBeInstanceOf(NotConfiguredError);
    await expect(createHttpAdapter({ endpoints: { records: '', evidence: '', institutions: '' } }).getRecords()).rejects.toBeInstanceOf(NotConfiguredError);
  });
  it('accepts a complete versioned empty live dataset', async () => {
    const f = (async () => new Response(JSON.stringify(env([])), { status: 200 })) as unknown as typeof fetch;
    const a = createHttpAdapter({ endpoints, fetchImpl: f });
    expect(await a.getRecords()).toEqual([]); expect(await a.getEvidence()).toEqual([]); expect(await a.getInstitutions()).toEqual([]);
  });
  it('refuses unversioned payloads rather than treating them as empty', async () => {
    const a = createHttpAdapter({ endpoints, fetchImpl: okFetch([]) });
    await expect(a.getRecords()).rejects.toThrow(/versioned|envelope/i);
  });
  it('surfaces HTTP failures', async () => {
    const f = (async () => ({ ok: false, status: 503, json: async () => ({}) })) as unknown as typeof fetch;
    const a = createHttpAdapter({ endpoints, fetchImpl: f });
    await expect(a.getRecords()).rejects.toThrow(/503/);
  });
});
