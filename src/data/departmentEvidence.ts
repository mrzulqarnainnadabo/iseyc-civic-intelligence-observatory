export type DepartmentId = 'education' | 'health' | 'software-technology' | 'civic';
export type DepartmentEvidenceStatus = 'integrated' | 'partial' | 'unavailable' | 'not-integrated';
export type DepartmentGeoLevel = 'national' | 'state' | 'lga' | 'ward' | 'facility';
export interface DepartmentEvidence {
  departmentId: DepartmentId; indicatorId: string; sourceId: string; publisher: string;
  sourceUrl: string; referencePeriod: string; retrievedAt: string;
  geography: { level: DepartmentGeoLevel; code: string | null; label: string };
  value: number | null; unit: string | null; evidenceStatus: DepartmentEvidenceStatus; limitations: string[];
}
const DEPARTMENTS: DepartmentId[] = ['education', 'health', 'software-technology', 'civic'];
const GEO_LEVELS: DepartmentGeoLevel[] = ['national', 'state', 'lga', 'ward', 'facility'];
const STATUSES: DepartmentEvidenceStatus[] = ['integrated', 'partial', 'unavailable', 'not-integrated'];
export function validateDepartmentEvidence(input: unknown): input is DepartmentEvidence {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
  const value = input as Record<string, unknown>;
  const keys = Object.keys(value).sort();
  const expected = ['departmentId','indicatorId','sourceId','publisher','sourceUrl','referencePeriod','retrievedAt','geography','value','unit','evidenceStatus','limitations'].sort();
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) return false;
  const geo = value.geography as Record<string, unknown> | null;
  return DEPARTMENTS.includes(value.departmentId as DepartmentId)
    && typeof value.indicatorId === 'string' && value.indicatorId.length > 0
    && typeof value.sourceId === 'string' && value.sourceId.length > 0
    && typeof value.publisher === 'string' && typeof value.sourceUrl === 'string'
    && typeof value.referencePeriod === 'string' && typeof value.retrievedAt === 'string'
    && !!geo && typeof geo === 'object' && !Array.isArray(geo)
    && Object.keys(geo).sort().join(',') === 'code,label,level'
    && GEO_LEVELS.includes(geo.level as DepartmentGeoLevel)
    && (geo.code === null || typeof geo.code === 'string') && typeof geo.label === 'string'
    && (value.value === null || (typeof value.value === 'number' && Number.isFinite(value.value)))
    && (value.unit === null || typeof value.unit === 'string')
    && STATUSES.includes(value.evidenceStatus as DepartmentEvidenceStatus)
    && Array.isArray(value.limitations) && value.limitations.every((item) => typeof item === 'string');
}
export const DEPARTMENT_EMPTY_STATE = 'No official figure integrated for this geography and indicator yet.';
export const KADUNA_SOUTH_FOCUS = 'Kaduna South · Kaduna State';
