import { describe, it, expect } from 'vitest';
import { DEPARTMENTS } from '../src/data/department-evidence';

describe('ISEYC department evidence contract', () => {
  it('exposes only the four official departments', () => {
    expect(Object.keys(DEPARTMENTS)).toEqual(['education', 'health', 'software-technology', 'civic']);
  });

  it('keeps Software & Technology explicitly not integrated', () => {
    expect(DEPARTMENTS['software-technology'].sourceIds).toEqual([]);
    expect(DEPARTMENTS['software-technology'].indicatorSectors).toEqual([]);
    expect(DEPARTMENTS['software-technology'].recordSectors).toEqual([]);
  });

  it('uses registered Education and Health sources without claiming local coverage', () => {
    expect(DEPARTMENTS.education.sourceIds).toContain('ubec-npa-2022-23');
    expect(DEPARTMENTS.education.indicatorSectors).toContain('education');
    expect(DEPARTMENTS.health.sourceIds).toContain('hfr');
    expect(DEPARTMENTS.health.sourceIds).toContain('kaduna-ksphcb-recruitment-plan-2025');
    expect(DEPARTMENTS.health.indicatorSectors).toContain('health');
  });

  it('keeps civic accountability and INEC source identifiers in the Civic Department', () => {
    expect(DEPARTMENTS.civic.sourceIds).toContain('inec-voter-register-pvc');
    expect(DEPARTMENTS.civic.sourceIds).toContain('inec-cvr-2025-26');
    expect(DEPARTMENTS.civic.recordSectors).toContain('governance');
  });
});
