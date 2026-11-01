import { describe, expect, it } from 'vitest';
import registry from '../src/data/source-registry.json';
import { KINDS, SECTORS } from '../src/data/types';

describe('source registry integrity', () => {
  const R = registry as unknown as import('../src/data/types').SourceRecord[];
  it('has unique ids and required fields', () => {
    expect(new Set(R.map(s => s.id)).size).toBe(R.length);
    for (const s of R) { expect(s.publisher, s.id).toBeTruthy(); expect(s.limitations.length, s.id).toBeGreaterThan(0); expect(s.licence, s.id).toBeTruthy(); }
  });
  it('never claims a check date for an unconfirmed source', () => {
    for (const s of R) {
      const confirmed = s.urlStatus === 'confirmed' || s.urlStatus === 'domain-confirmed';
      if (confirmed) { expect(s.lastChecked, s.id).toMatch(/^\d{4}-\d{2}-\d{2}$/); expect(s.checkedHow, s.id).toBeTruthy(); }
      else expect(s.lastChecked, s.id).toBeNull();
    }
  });
  it('covers all eight sectors and all five evidence classes', () => {
    for (const sec of SECTORS) expect(R.some(s => s.sectors.includes(sec)), sec).toBe(true);
    for (const k of KINDS) expect(R.some(s => s.kind === k), k).toBe(true);
  });
  it('does not present the planned verification workflow as a live source', () => {
    const v = R.find(s => s.kind === 'independently-verified')!;
    expect(v.url).toBeNull(); expect(v.urlStatus).toBe('not-applicable'); expect(v.lastChecked).toBeNull();
  });
});
