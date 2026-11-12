/** Shared domain types and data contracts for the Observatory. See docs/DATA_CONTRACTS.md. */

export type Sector =
  | 'education' | 'health' | 'security' | 'infrastructure'
  | 'water-sanitation' | 'employment' | 'public-finance' | 'governance'
  | 'agriculture' | 'environment' | 'digital-inclusion' | 'telecommunications';

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
  lastChecked: string | null;
  checkedHow: string;
  limitations: string[];
  notes: string;
}

export interface StateRef { id: string; name: string }

export const STAGES = ['published', 'referred', 'announced', 'funded', 'implemented', 'verified'] as const;
export type Stage = typeof STAGES[number];

export type StageStatus = 'evidenced' | 'claimed' | 'unknown' | 'not-reached';
export interface StageState { stage: Stage; status: StageStatus; evidenceId?: string; note?: string }

export type RecordOrigin = 'civic-mandate' | 'civic-brain' | 'observatory-demo';

export interface CivicRecord {
  id: string;
  origin: RecordOrigin;
  /** Original source-system identifier, preserved when the Observatory namespaces its local id. */
  sourceRecordId?: string;
  synthetic: boolean;
  title: string;
  summary: string;
  sector: Sector | null;
  sourceDuty?: string | null;
  issueCategory?: string | null;
  officeLabel?: string | null;
  verificationStatus?: string;
  evidenceRefIds?: string[];
  followUpStatus?: string;
  relatedSuggestedIds?: string[];
  ward?: string | null;
  facilityRef?: string | null;
  reportedAt?: string | null;
  publishedAt?: string | null;
  contractVersion?: string | null;
  stateId: string;
  lga?: string;
  kind: 'community-submission';
  reviewStatus: 'published';
  publishedMonth: string;
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
  date: string;
  sector: Sector | null;
  stateId: string;
  limitations: string[];
  verification?: { reviewerId: string; reviewedAt: string; method: string };
}

export type CommunityObservationVerification = 'unverified' | 'corroborated' | 'independently-verified' | 'disputed';
export interface CommunityObservation {
  id: string;
  sourceRecordId: string;
  displayId: string | null;
  synthetic: false;
  contractVersion: '0.1.0';
  publicationStatus: 'published';
  verificationStatus: CommunityObservationVerification;
  title: string;
  reportType: string;
  description: string;
  sector: Sector | null;
  stateId: string;
  stateName: string;
  lga: string | null;
  ward: string | null;
  placeOrFacility: string | null;
  observedOn: string | null;
  evidenceTypes: string[];
  evidenceLink: string | null;
  submittedAt: string;
  publishedAt: string | null;
}
export interface CommunityObservationFeed {
  status: 'ready' | 'empty' | 'unavailable' | 'invalid' | 'incomplete' | 'not-in-demo';
  records: CommunityObservation[];
  total: number | null;
  message: string | null;
}

export type EvidenceVaultVerification = 'unverified' | 'source_confirmed' | 'content_corroborated' | 'disputed' | 'corrected' | 'superseded' | 'withdrawn';
export type EvidenceRelation = 'not-assessed' | 'context-only' | 'corroborates' | 'contradicts' | 'unrelated';
export interface EvidenceVaultRecord {
  id: string;
  displayId: string | null;
  synthetic: false;
  contractVersion: '0.1.0';
  publicationStatus: 'published';
  verificationStatus: EvidenceVaultVerification;
  evidenceType: string;
  evidenceScope: string;
  title: string;
  sourceTitle: string | null;
  sourceUrl: string;
  sourceId: string | null;
  publisher: string | null;
  indicatorCode: string | null;
  measure: string | null;
  unit: string | null;
  observedValue: number | null;
  valueStatus: string | null;
  geographicLevel: string | null;
  geographicUnit: string | null;
  referencePeriod: string | null;
  retrievedAt: string | null;
  methodology: string | null;
  limitations: string | null;
  dataStatus: string | null;
  evidenceLinkReview: string | null;
  evidenceRelation: EvidenceRelation;
  linkedCommunityObservationId: string | null;
  linkedDemandId: string | null;
  createdAt: string;
}
export interface EvidenceVaultFeed {
  status: 'ready' | 'empty' | 'unavailable' | 'invalid' | 'incomplete' | 'not-in-demo';
  records: EvidenceVaultRecord[];
  total: number | null;
  message: string | null;
}

export type InstitutionTier = 'federal' | 'state' | 'local' | 'other';
export interface Institution {
  id: string;
  name: string;
  tier: InstitutionTier;
  sectors: Sector[];
  responsibilityBasis: 'unverified' | 'verified';
  basisNote: string;
}

export interface RecordQuery { sector?: Sector; stateId?: string; text?: string; institutionId?: string }
export interface EvidenceQuery { kind?: EvidenceKind; status?: EvidenceStatus; sector?: Sector; stateId?: string; text?: string; recordId?: string }

export interface ObservatoryAdapter {
  readonly mode: 'demo' | 'live';
  readonly label: string;
  getSources(): Promise<SourceRecord[]>;
  getStates(): Promise<StateRef[]>;
  getRecords(q?: RecordQuery): Promise<CivicRecord[]>;
  getEvidence(q?: EvidenceQuery): Promise<EvidenceItem[]>;
  getInstitutions(): Promise<Institution[]>;
  getCommunityObservations?(): Promise<CommunityObservationFeed>;
  getEvidenceVaultRecords?(): Promise<EvidenceVaultFeed>;
}

export const SECTOR_LABEL: Record<Sector, string> = {
  education: 'Education', health: 'Healthcare', security: 'Security', infrastructure: 'Infrastructure',
  'water-sanitation': 'Water and sanitation', employment: 'Employment and livelihoods',
  'public-finance': 'Public finance and budgets', governance: 'Governance and service delivery',
  agriculture: 'Agriculture', environment: 'Environment',
  'digital-inclusion': 'Digital inclusion', telecommunications: 'Telecommunications',
};
export const SECTORS: Sector[] = [
  'education', 'health', 'security', 'infrastructure', 'water-sanitation',
  'employment', 'public-finance', 'governance', 'agriculture', 'environment', 'digital-inclusion', 'telecommunications',
];

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
