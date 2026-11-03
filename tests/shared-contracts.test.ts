import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '..');

function loadJson(rel: string) {
  return JSON.parse(readFileSync(resolve(root, rel), 'utf8'));
}

describe('shared civic evidence contracts', () => {
  it('ownership map lists ten entities', () => {
    const map = loadJson('contracts/shared/entities-ownership.v0.1.json');
    expect(map.contractVersion).toBe('0.1.0');
    expect(map.entities).toHaveLength(10);
    const names = map.entities.map((e: { name: string }) => e.name);
    expect(names).toContain('CommunityRecord');
    expect(names).toContain('IndicatorObservation');
    expect(names).toContain('IntelligenceBrief');
    expect(names).toContain('RetrievalReceipt');
  });

  it('CommunityRecord schema forces published-only public status', () => {
    const s = loadJson('contracts/shared/community-record.v0.1.schema.json');
    expect(s.properties.publicationStatus.const).toBe('published');
    expect(s.additionalProperties).toBe(false);
  });

  it('ResponseRecord requires humanConfirmed', () => {
    const s = loadJson('contracts/shared/response-record.v0.1.schema.json');
    expect(s.required).toContain('humanConfirmed');
    expect(s.properties.humanConfirmed.const).toBe(true);
  });

  it('IntelligenceBrief allows draft and blocks silent publish as only state', () => {
    const s = loadJson('contracts/shared/intelligence-brief.v0.1.schema.json');
    expect(s.properties.publicationStatus.enum).toContain('draft');
    expect(s.properties.publicationStatus.enum).toContain('published');
  });

  it('observation v1 schema remains the gateway observation contract', () => {
    const s = loadJson('contracts/evidence/observation.v1.schema.json');
    expect(s.properties.contractVersion.const).toBe('1.0.0');
    expect(s.required).toContain('referencePeriod');
    expect(s.required).toContain('retrievedAt');
  });
});
