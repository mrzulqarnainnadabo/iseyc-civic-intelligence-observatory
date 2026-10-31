/** Shared domain types and data contracts for the Observatory. See docs/DATA_CONTRACTS.md. */

export type Sector =
  | 'education' | 'health' | 'security' | 'infrastructure'
  | 'water-sanitation' | 'employment' | 'public-finance' | 'governance';

/** The five evidence classes the product must keep distinct. */
export type EvidenceKind =
  | 'official-data' | 'published-research' | 'media-report'
  | 'community-submission' | 'independently-verified';

export type EvidenceStatus = 'verified' | 'unverified' | 'outdated' | 'unavailable' | 'disputed';
export type GeoLevel = 'national' | 'zone' | 'state' | 'lga' | 'facility' | 'point' | 'varies';
export type UrlStatus = 'confirmed' | 'domain-confirmed' | 'documented-not-reconfirmed' | 'not-applicable';

export interface SourceRecord {
  id: string;
  publisher: string;
  name: string;
  url: string | null;
  urlStatus: UrlStatus;
  sectors: Sector[];
  kind: EvidenceKind;
  geographicCoverage: string;
  geoLevel: GeoLevel;
  dataType: string;
  updateFrequency: string;
  licence: string;
  lastChecked: string | null; // ISO date; null = not checked
  checkedHow: string;
  limitations: string[];
  notes: string;
}

export interface StateRef { id: string; name: string }

/** Lifecycle stages from a citizen demand to independently verified delivery. */
export const STAGES = ['published', 'referred', 'announced', 'funded', 'implemented', 'verified'] as const;
export type Stage = typeof STAGES[number];

/**
 * evidenced   = a cited evidence item supports this stage
 * claimed     = someone asserts it, but nothing independent supports it yet
 * unknown     = no information found
 * not-reached = nothing indicates this stage has happened
 */
export type StageStatus = 'evidenced' | 'claimed' | 'unknown' | 'not-reached';
export interface StageState { stage: Stage; status: StageStatus; evidenceId?: string; note?: string }

export type RecordOrigin = 'civic-mandate' | 'civic-brain' | 'observatory-demo';

export interface CivicRecord {
  id: string;
  origin: RecordOrigin;
  /** True for demonstration records. The UI must label these wherever shown. */
  synthetic: boolean;
  title: string;
  summary: string;
  sector: Sector;
  stateId: string;
  lga?: string;
  /** Always a community submission class; a record never becomes "verified" by itself. */
  kind: 'community-submission';
  reviewStatus: 'published';
  publishedMonth: string; // YYYY-MM
  institutionIds: string[];
  stages: StageState[];
  unknowns: string[];
  nextSteps: string[];
}

export interface EvidenceItem {
  id: string;
  synthetic: boolean;
  recordId: string;
  kind: EvidenceKind;
  status: EvidenceStatus;
  title: string;
  excerpt: string;
  publisherLabel: string;
  date: string; // ISO date
  sector: Sector;
  stateId: string;
  limitations: string[];
  /** Required for real independently-verified evidence; never valid on synthetic evidence. */
  verification?: { reviewerId: string; reviewedAt: string; method: string };
}

export type InstitutionTier = 'federal' | 'state' | 'local' | 'other';
export interface Institution {
  id: string;
  name: string;
  tier: InstitutionTier;
  sectors: Sector[];
  /** Responsibility mappings are researcher-curated and unverified until a legal basis is attached. */
  responsibilityBasis: 'unverified' | 'verified';
  basisNote: string;
}

export interface RecordQuery { sector?: Sector; stateId?: string; text?: string; institutionId?: string }
export interface EvidenceQuery { kind?: EvidenceKind; status?: EvidenceStatus; sector?: Sector; stateId?: string; text?: string; recordId?: string }

/** Everything the UI needs. Implemented by the demo adapter and (later) a live adapter. */
export interface ObservatoryAdapter {
  readonly mode: 'demo' | 'live';
  readonly label: string;
  getSources(): Promise<SourceRecord[]>;
  getStates(): Promise<StateRef[]>;
  getRecords(q?: RecordQuery): Promise<CivicRecord[]>;
  getEvidence(q?: EvidenceQuery): Promise<EvidenceItem[]>;
  getInstitutions(): Promise<Institution[]>;
}

export const SECTOR_LABEL: Record<Sector, string> = {
  education: 'Education', health: 'Healthcare', security: 'Security', infrastructure: 'Infrastructure',
  'water-sanitation': 'Water and sanitation', employment: 'Employment and livelihoods',
  'public-finance': 'Public finance and budgets', governance: 'Governance and service delivery',
};
export const SECTORS = Object.keys(SECTOR_LABEL) as Sector[];

export const KIND_LABEL: Record<EvidenceKind, string> = {
  'official-data': 'Official data', 'published-research': 'Published research', 'media-report': 'Media report',
  'community-submission': 'Community submission', 'independently-verified': 'Independently verified',
};
export const KINDS = Object.keys(KIND_LABEL) as EvidenceKind[];
export const STATUS_LABEL: Record<EvidenceStatus, string> = {
  verified: 'Verified', unverified: 'Unverified', outdated: 'Outdated', unavailable: 'Unavailable', disputed: 'Disputed',
};
export const STAGE_LABEL: Record<Stage, string> = {
  published: 'Published', referred: 'Referred', announced: 'Announced', funded: 'Funded', implemented: 'Implemented', verified: 'Independently verified',
};
export const STAGE_STATUS_LABEL: Record<StageStatus, string> = {
  evidenced: 'Evidenced', claimed: 'Claimed only', unknown: 'Unknown', 'not-reached': 'Not reached',
};
