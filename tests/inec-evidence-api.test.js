import { describe, expect, it } from 'vitest';
import handler from '../api/evidence/inec.js';

function request(url, method = 'GET') {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(name, value) { this.headers[name] = value; },
    end(body = '') { this.body = body; },
  };
  handler({ method, url }, res);
  return { statusCode: res.statusCode, headers: res.headers, body: res.body ? JSON.parse(res.body) : null };
}

describe('INEC evidence endpoint', () => {
  it('publishes an allowlisted dataset catalogue with provenance', () => {
    const response = request('/api/evidence/inec?catalog=1');
    expect(response.statusCode).toBe(200);
    expect(response.body.contractVersion).toBe('1.0.0');
    expect(response.body.publisher).toContain('INEC');
    expect(response.body.datasets.map((x) => x.datasetId)).toEqual([
      'inec-2023-registered-voters-pvc-collection',
      'inec-ekiti-2026-election-register-snapshot',
      'inec-osun-2026-pvc-collection',
      'inec-cvr-2025-26-phase-one-reported-counts',
    ]);
    expect(response.body.note).toContain('Not a live INEC API');
  });

  it('returns all source snapshots without combining their measures', () => {
    const response = request('/api/evidence/inec?dataset=all');
    expect(response.statusCode).toBe(200);
    expect(response.body.datasets).toHaveLength(4);
    const ekiti = response.body.datasets.find((x) => x.datasetId.includes('ekiti'));
    expect(ekiti.records[0].registeredVotersForElection).toBe(1059360);
    const osun = response.body.datasets.find((x) => x.datasetId.includes('osun'));
    expect(osun.records[0].collectedPVCs).toBe(1518485);
    const cvr = response.body.datasets.find((x) => x.datasetId.includes('cvr'));
    expect(cvr.records.map((x) => x.newEligibleVotersReported)).toEqual([2782587, 2782589]);
    expect(cvr.reconciliation.phaseOneCountDifference).toBe(2);
    expect(cvr.nationalFinalPostCvrRegister).toBeNull();
  });

  it('filters the 2023 dataset to an exact state name', () => {
    const response = request('/api/evidence/inec?dataset=2023-pvc&state=Kaduna');
    expect(response.statusCode).toBe(200);
    expect(response.body.records).toHaveLength(1);
    expect(response.body.records[0].state).toBe('Kaduna');
    expect(response.body.records[0].registeredVoters).toBe(4335208);
  });

  it('keeps a valid no-match result empty rather than inventing a zero row', () => {
    const response = request('/api/evidence/inec?dataset=2023-pvc&state=Atlantis');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('empty');
    expect(response.body.records).toEqual([]);
  });

  it('rejects unrecognised datasets', () => {
    const response = request('/api/evidence/inec?dataset=latest-national-total');
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('DATASET_NOT_FOUND');
  });

  it('is read-only and sets public cache/CORS headers', () => {
    const response = request('/api/evidence/inec?dataset=2023-pvc', 'POST');
    expect(response.statusCode).toBe(405);
    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(response.headers['Cache-Control']).toContain('s-maxage=3600');
  });
});
