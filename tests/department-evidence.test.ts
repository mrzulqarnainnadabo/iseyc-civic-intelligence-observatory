import { describe, expect, it } from 'vitest';
import { buildDepartmentEvidence, indicatorBelongsToDepartment } from '../src/data/departmentEvidence';

const indicator = {
  id: 'wb-nga-se-prm-enrr',
  sourceDatasetId: 'world-bank-wdi',
  sourcePublisher: 'World Bank — World Development Indicators',
  sourceUrl: 'https://data.worldbank.org/indicator/SE.PRM.ENRR?locations=NG',
  unit: 'percent (gross)',
  geoLevel: 'national',
  geographicCoverage: 'Nigeria (national aggregate)',
  limitations: ['National aggregate only.'],
};

describe('DepartmentEvidence contract', () => {
  it('does not zero-fill an empty gateway response', () => {
    const [item] = buildDepartmentEvidence('education', indicator, {
      status: 'empty', observations: [],
    }, '2026-11-05T12:00:00.000Z');
    expect(item.value).toBeNull();
    expect(item.evidenceStatus).toBe('not-integrated');
    expect(item.referencePeriod).toBe('No observation returned');
    expect(item.geography.label).toBe('Nigeria (national aggregate)');
    expect(item.limitations).toContain('No official figure integrated for this geography and indicator yet.');
  });

  it('preserves source, period, geography and retrieval time for integrated values', () => {
    const [item] = buildDepartmentEvidence('education', indicator, {
      status: 'ok',
      observations: [{
        indicatorId: indicator.id, referencePeriod: '2022', value: 86.2,
        unit: 'percent (gross)', sourcePublisher: 'World Bank',
        sourceUrl: indicator.sourceUrl, retrievedAt: '2026-11-05T11:00:00.000Z',
        geoLevel: 'national', geoCode: 'NGA',
      }],
    }, '2026-11-05T12:00:00.000Z');
    expect(item.value).toBe(86.2);
    expect(item.referencePeriod).toBe('2022');
    expect(item.geography.code).toBe('NGA');
    expect(item.retrievedAt).toBe('2026-11-05T11:00:00.000Z');
    expect(item.evidenceStatus).toBe('integrated');
  });

  it('marks gateway errors unavailable instead of substituting values', () => {
    const [item] = buildDepartmentEvidence('health', {
      ...indicator, id: 'wb-nga-sh-dyn-mort',
    }, { status: 'error', errorClass: 'UPSTREAM_UNAVAILABLE', observations: [] }, '2026-11-05T12:00:00.000Z');
    expect(item.value).toBeNull();
    expect(item.evidenceStatus).toBe('unavailable');
  });

  it('keeps software technology empty until a dedicated source is registered', () => {
    expect(indicatorBelongsToDepartment('education', 'software-technology')).toBe(false);
    expect(indicatorBelongsToDepartment('health', 'software-technology')).toBe(false);
    expect(indicatorBelongsToDepartment('software-technology', 'software-technology')).toBe(true);
  });
});
