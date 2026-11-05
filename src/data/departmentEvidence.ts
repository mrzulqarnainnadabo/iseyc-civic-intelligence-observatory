export type DepartmentId = 'education' | 'health' | 'software-technology' | 'civic';

export type DepartmentEvidence = {
  departmentId: DepartmentId;
  indicatorId: string;
  sourceId: string;
  publisher: string;
  sourceUrl: string;
  referencePeriod: string;
  retrievedAt: string;
  geography: {
    level: 'national' | 'state' | 'lga' | 'ward' | 'facility';
    code: string | null;
    label: string;
  };
  value: number | null;
  unit: string | null;
  evidenceStatus: 'integrated' | 'partial' | 'unavailable' | 'not-integrated';
  limitations: string[];
};

export const DEPARTMENTS: Array<{ id: DepartmentId; label: string; summary: string }> = [
  { id: 'education', label: 'Education & Capacity Building', summary: 'Education access, participation and learning evidence.' },
  { id: 'health', label: 'Health & Well-being', summary: 'Health indicators, facility evidence and service limitations.' },
  { id: 'software-technology', label: 'Software & Technology', summary: 'Digital systems, technology access and software evidence.' },
  { id: 'civic', label: 'Civic Department', summary: 'Public institutions, civic participation and accountability.' },
];

export function indicatorBelongsToDepartment(indicatorSector: string, departmentId: DepartmentId): boolean {
  if (departmentId === 'education') return indicatorSector === 'education';
  if (departmentId === 'health') return indicatorSector === 'health';
  if (departmentId === 'software-technology') return indicatorSector === 'software-technology' || indicatorSector === 'digital-infrastructure';
  return indicatorSector === 'governance' || indicatorSector === 'public-finance';
}

function geographyLevel(raw: string | undefined, fallback: string): DepartmentEvidence['geography']['level'] {
  const value = raw || fallback;
  if (value === 'national' || value === 'state' || value === 'lga' || value === 'ward' || value === 'facility') return value;
  return 'national';
}

export function buildDepartmentEvidence(
  departmentId: DepartmentId,
  indicator: {
    id: string; sourceDatasetId: string; sourcePublisher: string; sourceUrl: string;
    unit: string; geoLevel: string; geographicCoverage: string; limitations: string[];
  },
  result: {
    status: 'ok' | 'empty' | 'error'; errorClass?: string; message?: string;
    observations: Array<{
      indicatorId: string; datasetId?: string; referencePeriod: string; value: number; unit?: string;
      sourcePublisher: string; sourceUrl?: string; retrievedAt: string;
      geoCode?: string; geoLevel?: string; qualityFlags?: string[];
    }>;
  },
  checkedAt: string,
): DepartmentEvidence[] {
  const baseLimitations = [...indicator.limitations];
  if (result.status === 'error') {
    return [{
      departmentId, indicatorId: indicator.id, sourceId: indicator.sourceDatasetId,
      publisher: indicator.sourcePublisher, sourceUrl: indicator.sourceUrl,
      referencePeriod: 'Not available', retrievedAt: checkedAt,
      geography: { level: geographyLevel(undefined, indicator.geoLevel), code: null, label: indicator.geographicCoverage },
      value: null, unit: indicator.unit, evidenceStatus: 'unavailable',
      limitations: [...baseLimitations, result.message || result.errorClass || 'Evidence Gateway unavailable.'],
    }];
  }
  if (!result.observations.length) {
    return [{
      departmentId, indicatorId: indicator.id, sourceId: indicator.sourceDatasetId,
      publisher: indicator.sourcePublisher, sourceUrl: indicator.sourceUrl,
      referencePeriod: 'No observation returned', retrievedAt: checkedAt,
      geography: { level: geographyLevel(undefined, indicator.geoLevel), code: null, label: indicator.geographicCoverage },
      value: null, unit: indicator.unit, evidenceStatus: 'not-integrated',
      limitations: [...baseLimitations, 'No official figure integrated for this geography and indicator yet.'],
    }];
  }
  return result.observations.map((observation) => ({
    departmentId, indicatorId: indicator.id, sourceId: observation.datasetId || indicator.sourceDatasetId,
    publisher: observation.sourcePublisher || indicator.sourcePublisher,
    sourceUrl: observation.sourceUrl || indicator.sourceUrl,
    referencePeriod: observation.referencePeriod, retrievedAt: observation.retrievedAt || checkedAt,
    geography: {
      level: geographyLevel(observation.geoLevel, indicator.geoLevel),
      code: observation.geoCode || null,
      label: observation.geoCode || indicator.geographicCoverage,
    },
    value: observation.value, unit: observation.unit || indicator.unit,
    evidenceStatus: observation.qualityFlags?.length ? 'partial' : 'integrated',
    limitations: [...baseLimitations, ...(observation.qualityFlags || [])],
  }));
}
