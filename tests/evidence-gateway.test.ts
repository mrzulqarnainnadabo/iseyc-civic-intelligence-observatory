// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  retrieveObservations,
  resolvePilotRequest,
  clearGatewayCache,
  listPilotCatalog,
} from '../api/_lib/gateway.js';
import { isAllowedHost, buildWorldBankUrl, ALLOWED_HOSTS, MAX_RESPONSE_BYTES } from '../api/_lib/config.js';

describe('evidence gateway allowlist', () => {
  it('allows only world bank host', () => {
    expect(isAllowedHost('api.worldbank.org')).toBe(true);
    expect(isAllowedHost('evil.example')).toBe(false);
    expect(ALLOWED_HOSTS).not.toContain('example.com');
  });

  it('builds NGA-only World Bank URLs', () => {
    const u = buildWorldBankUrl('SP.POP.TOTL');
    expect(u).toContain('api.worldbank.org');
    expect(u).toContain('/country/NGA/');
    expect(u).toContain('SP.POP.TOTL');
  });

  it('rejects unknown indicator ids', () => {
    const r = resolvePilotRequest('not-a-real-id');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errorClass).toBe('NOT_ALLOWED');
  });

  it('accepts pilot ids', () => {
    expect(resolvePilotRequest('wb-nga-sp-pop-totl').ok).toBe(true);
  });

  it('lists only allowlisted catalog', () => {
    const list = listPilotCatalog();
    expect(list.length).toBe(3);
    expect(list.every((i) => i.geoLevel === 'national')).toBe(true);
  });
});

describe('retrieveObservations', () => {
  beforeEach(() => clearGatewayCache());

  it('maps valid upstream payload into observations + receipt', async () => {
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
      status: 200,
      body: null,
      text: async () => JSON.stringify(payload),
    })) as unknown as typeof fetch;

    const body = await retrieveObservations({
      indicatorId: 'wb-nga-sp-pop-totl',
      fetchImpl,
      bypassCache: true,
    });
    expect(body.status).toBe('ok');
    expect(body.observations).toHaveLength(2);
    expect(body.observations[0].referencePeriod).toBe('2022');
    expect(body.observations[0].geoLevel).toBe('national');
    expect(body.observations[0].geoCode).toBe('NGA');
    expect(body.observations[0].qualityFlags).toContain('national-only');
    expect(body.receipt?.outcome).toBe('success');
    expect(body.receipt?.contentHash).toBeTruthy();
    expect(body.receipt?.observationCount).toBe(2);
    expect(body.persistence?.mode).toBe('ephemeral');
  });

  it('does not invent data on HTTP failure', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: false,
      status: 503,
      body: null,
      text: async () => 'unavailable',
    })) as unknown as typeof fetch;
    const body = await retrieveObservations({
      indicatorId: 'wb-nga-se-prm-enrr',
      fetchImpl,
      bypassCache: true,
    });
    expect(body.observations).toEqual([]);
    expect(body.status).toBe('error');
    expect(body.receipt?.outcome).toBe('upstream_error');
  });

  it('classifies malformed JSON', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      body: null,
      text: async () => 'not-json',
    })) as unknown as typeof fetch;
    const body = await retrieveObservations({
      indicatorId: 'wb-nga-sh-dyn-mort',
      fetchImpl,
      bypassCache: true,
    });
    expect(body.observations).toEqual([]);
    expect(body.receipt?.outcome).toBe('malformed');
  });

  it('classifies empty series', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      body: null,
      text: async () => JSON.stringify([{ page: 1 }, []]),
    })) as unknown as typeof fetch;
    const body = await retrieveObservations({
      indicatorId: 'wb-nga-sp-pop-totl',
      fetchImpl,
      bypassCache: true,
    });
    expect(body.status).toBe('empty');
    expect(body.receipt?.outcome).toBe('empty');
  });

  it('caches successful responses', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      body: null,
      text: async () => JSON.stringify([{ page: 1 }, [{ date: '2023', value: 1 }]]),
    })) as unknown as typeof fetch;
    await retrieveObservations({ indicatorId: 'wb-nga-sp-pop-totl', fetchImpl });
    await retrieveObservations({ indicatorId: 'wb-nga-sp-pop-totl', fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('cancels an upstream stream that exceeds the response-size limit', async () => {
    const cancel = vi.fn(async () => undefined);
    const oversized = new Uint8Array(MAX_RESPONSE_BYTES + 1);
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      body: {
        getReader: () => ({
          read: async () => ({ done: false, value: oversized }),
          cancel,
        }),
      },
      text: async () => {
        throw new Error('text fallback must not be used for a streamed response');
      },
    })) as unknown as typeof fetch;

    const body = await retrieveObservations({
      indicatorId: 'wb-nga-sp-pop-totl',
      fetchImpl,
      bypassCache: true,
    });

    expect(body.status).toBe('error');
    expect(body.errorClass).toBe('RESPONSE_TOO_LARGE');
    expect(body.observations).toEqual([]);
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('requests only the allowlisted World Bank endpoint', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL) => ({
      ok: true,
      status: 200,
      body: null,
      text: async () => JSON.stringify([{ page: 1 }, [{ date: '2023', value: 1 }]]),
    }));
    const fetchImpl = fetchMock as unknown as typeof fetch;

    await retrieveObservations({
      indicatorId: 'wb-nga-sp-pop-totl',
      fetchImpl,
      bypassCache: true,
    });

    const requestedUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestedUrl.protocol).toBe('https:');
    expect(requestedUrl.hostname).toBe('api.worldbank.org');
    expect(requestedUrl.pathname).toContain('/v2/country/NGA/indicator/');
  });

  it('rejects missing indicatorId without calling fetch', async () => {
    const fetchImpl = vi.fn();
    const body = await retrieveObservations({ indicatorId: '', fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(body.errorClass).toBe('INVALID_INDICATOR');
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
