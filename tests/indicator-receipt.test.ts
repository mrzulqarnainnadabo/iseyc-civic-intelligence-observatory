import { describe, it, expect, vi } from 'vitest';
import { fetchViaGateway } from '../src/lib/indicators';

describe('evidence gateway receipt propagation', () => {
  it('preserves receipt identity, response hash and ephemeral-retention status', async () => {
    const payload = {
      status: 'ok',
      observations: [{
        indicatorId: 'wb-nga-sp-pop-totl',
        referencePeriod: '2023',
        value: 100,
        sourcePublisher: 'World Bank — World Development Indicators',
        retrievedAt: '2026-11-05T12:00:00.000Z',
      }],
      receipt: {
        receiptId: 'receipt-123',
        contentHash: 'a'.repeat(64),
        httpStatus: 200,
      },
      persistence: {
        mode: 'ephemeral',
        note: 'Receipts are returned in-response only. No database project is configured; durable storage is deferred.',
      },
    };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));

    const result = await fetchViaGateway(
      'wb-nga-sp-pop-totl',
      fetchMock as unknown as typeof fetch,
    );

    expect(result.status).toBe('ok');
    expect(result.receipt?.receiptId).toBe('receipt-123');
    expect(result.receipt?.contentHash).toBe('a'.repeat(64));
    expect(result.persistence?.mode).toBe('ephemeral');
    expect(result.persistence?.note).toContain('not configured');
    expect(result.observations).toHaveLength(1);
  });
});
