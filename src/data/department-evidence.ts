import type { Sector } from './types';

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

export interface DepartmentDefinition {
  id: DepartmentId;
  name: string;
  summary: string;
  sourceSectors: Sector[];
  indicatorSectors: string[];
  recordSectors: Sector[];
  sourceIds: string[];
  factsGuidance: string[];
  hypothesisGuidance: string[];
}

export const DEPARTMENTS: Record<DepartmentId, DepartmentDefinition> = {
  education: {
    id: 'education',
    name: 'Education & Capacity Building',
    summary: 'Schooling, education access, learning conditions and capacity-building evidence.',
    sourceSectors: ['education'],
    indicatorSectors: ['education'],
    recordSectors: ['education'],
    sourceIds: ['ubec-digest-2019-20', 'ubec-site', 'ubec-npa-2022-23', 'ubec-reports-digests', 'fme-nedi', 'worldbank-wdi-primary-enrolment'],
    factsGuidance: [
      'A registered source publishes a stated indicator for its stated reference period and geographic level.',
      'A community demand was published on Civic Mandate after human review.',
      'A national or historical education indicator is context only; it is not a current Kaduna South school figure.',
    ],
    hypothesisGuidance: [
      'Why enrolment, attendance or learning outcomes differ between communities.',
      'Whether a school is currently staffed, safe, supplied or delivering quality learning without current local evidence.',
    ],
  },
  health: {
    id: 'health',
    name: 'Health & Well-being',
    summary: 'Population health, primary healthcare access, facilities and service-delivery evidence.',
    sourceSectors: ['health'],
    indicatorSectors: ['health'],
    recordSectors: ['health'],
    sourceIds: ['ndhs-2024', 'hfr', 'kaduna-hefa', 'kaduna-ksphcb-recruitment-plan-2025', 'nphcda-data-requisition', 'worldbank-wdi-under5-mortality'],
    factsGuidance: [
      'A published source reports a health indicator for its stated reference period and geographic level.',
      'A Health Facility Registry entry establishes that a facility is listed; it does not establish that services are currently available.',
      'A community health concern is a published report, not independent confirmation of the underlying condition.',
    ],
    hypothesisGuidance: [
      'Whether a named facility is currently staffed, stocked, open or providing a specific service without current facility evidence.',
      'Why a health outcome changed or whether a programme caused the change.',
    ],
  },
  'software-technology': {
    id: 'software-technology',
    name: 'Software & Technology',
    summary: 'Digital systems, technology access, software capability and responsible technology evidence.',
    sourceSectors: [],
    indicatorSectors: [],
    recordSectors: [],
    sourceIds: [],
    factsGuidance: [
      'A software system, repository or digital service exists when its public artefact and current status have been inspected.',
      'A technology claim must identify the product, version, owner and evidence date.',
    ],
    hypothesisGuidance: [
      'Digital access, technology adoption, local software-sector size or impact without a registered and retrieved dataset.',
      'Claims that a system is secure, effective or widely used without appropriate independent testing or usage evidence.',
    ],
  },
  civic: {
    id: 'civic',
    name: 'Civic Department',
    summary: 'Public institutions, civic participation, public responsibilities and accountability evidence.',
    sourceSectors: ['governance', 'public-finance'],
    indicatorSectors: [],
    recordSectors: ['governance'],
    sourceIds: ['inec-voter-register-pvc', 'inec-cvr-2025-26', 'civic-mandate', 'nbs-site', 'open-treasury', 'nocopo', 'budget-office'],
    factsGuidance: [
      'An official announcement or published record exists, with its date and issuing institution.',
      'A published community record states what was submitted and reviewed, not how common the issue is.',
      'A budget appropriation, release, payment, contract award, implementation and independently verified delivery are different stages.',
    ],
    hypothesisGuidance: [
      'Whether a public commitment has been implemented or delivered without implementation evidence.',
      'Why an institution acted or failed to act, or whether a public figure represents the whole population.',
    ],
  },
};

export function isDepartmentId(value: string | undefined): value is DepartmentId {
  return value === 'education' || value === 'health' || value === 'software-technology' || value === 'civic';
}
