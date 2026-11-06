/** 
 * Published-only Civic Mandate adapter.
 * Uses CommunityRecord v0.1 by default and never silently falls back to the legacy pulse feed.
 * Published community records are not a national survey or independently verified outcomes.
 */
import type {
  CivicRecord,
  EvidenceItem,
  EvidenceQuery,
  Institution,
  ObservatoryAdapter,
  RecordQuery,
  Sector,
  SourceRecord,
  StateRef,
} from '../data/types';
import mapData from '../data/geo/nigeria-map.json';
import registry from '../data/source-registry.json';
import { DEFAULT_COMMUNITY_OBSERVATIONS_URL, fetchCommunityObservations } from './communityObservationsAdapter';
import { DEFAULT_EVIDENCE_VAULT_URL, fetchEvidenceVaultRecords } from './evidenceVaultAdapter';

export const DEFAULT_COMMUNITY_RECORDS_URL = 'https://2027-street-mandate.vercel.app/api/v1/community-records';
const COMMUNITY_CONTRACT_VERSION = '0.1.0';
const COMMUNITY_RECORD_KEYS = new Set([
  'id', 'contractVersion', 'publicationStatus', 'verificationStatus', 'text',
  'sector', 'duty', 'issueCategory', 'state', 'lga', 'ward', 'facilityRef',
  'officeLabel', 'reportedAt', 'publishedAt', 'createdAt', 'evidenceRefIds',
  'followUpStatus', 'relatedSuggestedIds',
]);
const VERIFICATION_STATUSES = new Set([
  'unverified', 'partially-verified', 'independently-verified', 'unknown',
]);
const FOLLOW_UP_STATUSES = new Set([
  'none', 'under-review', 'response-documented', 'outcome-unknown', 'unknown',
]);

/** Primary duty → sector (aligned with Stage 2 crosswalk primaries / interim). */
const DUTY_TO_SECTOR: Record<string, Sector> = {
  Health: 'health',
  Education: 'education',
  Security: 'security',
  'Roads & Transport': 'infrastructure',
  'Water & Sanitation': 'water-sanitation',
  Power: 'infrastructure',
  Housing: 'infrastructure',
  Agriculture: 'agriculture',
  Environment: 'environment',
  Employment: 'employment',
  'Youth Development': 'education',
  "Women's Development": 'governance',
  'Social Protection': 'governance',
  'Digital Infrastructure': 'infrastructure',
  'Public Finance': 'public-finance',
  Governance: 'governance',
  Justice: 'governance',
};

type PulseVoice = {
  id: string;
  sentence: string;
  mandate?: string;
  duty?: string;
  office?: string;
  state?: string;
  lga?: string;
  created?: string;
  sector?: string | null;
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
};

type CommunityRecordV01 = {
  id: string; contractVersion: string; publicationStatus: string;
  verificationStatus: 'unverified' | 'partially-verified' | 'independently-verified' | 'unknown';
  text: string; duty: string | null; state: string | null; lga: string | null;
  officeLabel: string | null; createdAt: string;
  sector: string | null; issueCategory: string | null; ward: string | null;
  facilityRef: string | null; reportedAt: string | null; publishedAt: string | null;
  evidenceRefIds: string[]; followUpStatus: 'none' | 'under-review' | 'response-documented' | 'outcome-unknown' | 'unknown';
  relatedSuggestedIds: string[];
};
type CommunityRecordsResponse = {
  contractVersion: string; publicationBoundary: string; page: number; pageSize: number;
  total: number; totalPages: number; truncatedUpstream: boolean; records: CommunityRecordV01[];
};

function slugState(name: string): string {
  const n = name.trim().toLowerCase();
  if (n === 'fct' || n === 'federal capital territory' || n === 'abuja fct' || n === 'abuja') return 'fct';
  return n
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/nassarawa/, 'nasarawa');
}

function monthFromIso(iso?: string): string {
  if (!iso) return 'unknown';
  const d = iso.slice(0, 7);
  return /^\d{4}-\d{2}$/.test(d) ? d : 'unknown';
}

function mapDuty(duty?: string, mandate?: string): Sector | null {
  const key = (duty || mandate || '').trim();
  if (!key) return null;
  return DUTY_TO_SECTOR[key] ?? null;
}

function voiceToRecord(v: PulseVoice, stateIds: Set<string>): CivicRecord | null {
  if (!v?.id || !v.sentence?.trim()) return null;
  const stateName = (v.state || '').trim();
  let stateId = stateName ? slugState(stateName) : 'unknown';
  if (!stateIds.has(stateId)) {
    const byName = [...stateIds].find((id) => id === stateId);
    if (!byName) {
      // leave slug; geography UI may still show via fallback
    }
  }
  const sector = mapDuty(v.duty, v.mandate);
  const title =
    v.sentence.trim().length > 96 ? `${v.sentence.trim().slice(0, 93)}…` : v.sentence.trim();
  return {
    id: `mandate-${v.id}`,
    origin: 'civic-mandate',
    sourceRecordId: String(v.id),
    synthetic: false,
    title,
    summary: v.sentence.trim(),
    sector,
    sourceDuty: v.duty || v.mandate || null,
    issueCategory: v.issueCategory ?? null,
    officeLabel: v.officeLabel || v.office || null,
    verificationStatus: v.verificationStatus || 'unverified',
    evidenceRefIds: Array.isArray(v.evidenceRefIds) ? v.evidenceRefIds : [],
    followUpStatus: v.followUpStatus || 'unknown',
    relatedSuggestedIds: Array.isArray(v.relatedSuggestedIds) ? v.relatedSuggestedIds : [],
    ward: v.ward ?? null,
    facilityRef: v.facilityRef ?? null,
    reportedAt: v.reportedAt ?? null,
    publishedAt: v.publishedAt ?? null,
    contractVersion: v.contractVersion ?? null,
    stateId,
    lga: v.lga?.trim() || undefined,
    kind: 'community-submission',
    reviewStatus: 'published',
    publishedMonth: monthFromIso(v.created),
    institutionIds: [],
    stages: [{ stage: 'published', status: 'evidenced', note: 'Published on Civic Mandate after human review' }],
    unknowns: [
      'Publication is not independent verification of the underlying conditions.',
      'This record is not a measure of how common the issue is nationwide.',
      v.office ? `Named office in submission (“${v.office}”) is not a confirmed duty mapping.` : 'Responsible office is not confirmed.',
    ],
    nextSteps: [
      'Read the full published wording.',
      'Check official sources for the same place and duty.',
      'Do not treat this alone as proof of national prevalence or delivery.',
    ],
  };
}

function voiceToEvidence(v: PulseVoice, record: CivicRecord): EvidenceItem {
  return {
    id: `ev-${record.id}`,
    synthetic: false,
    recordId: record.id,
    kind: 'community-submission',
    status: 'unverified',
    title: 'Published community demand',
    excerpt: v.sentence.trim(),
    publisherLabel: 'Civic Mandate Nigeria (published record)',
    date: (v.created || '').slice(0, 10) || record.publishedMonth,
    sector: record.sector,
    stateId: record.stateId,
    limitations: [
      'Human-reviewed for publication, not independently field-verified.',
      'Not a representative survey sample.',
    ],
  };
}

export interface MandatePulseConfig {
  communityRecordsUrl?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export function createMandatePulseAdapter(cfg: MandatePulseConfig = {}): ObservatoryAdapter {
  const communityUrl = cfg.communityRecordsUrl || DEFAULT_COMMUNITY_RECORDS_URL;
  const f = cfg.fetchImpl ?? (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : undefined);
  const timeoutMs = cfg.timeoutMs ?? 12_000;

  const states: StateRef[] = (mapData as { locations: { id: string; name: string }[] }).locations.map((l) => ({ id: l.id, name: l.name }));
  const stateIds = new Set(states.map((s) => s.id));
  const sources = registry as SourceRecord[];

  let cache: { records: CivicRecord[]; evidence: EvidenceItem[]; at: number } | null = null;
  const TTL = 60_000;

  async function fetchJson(target: string): Promise<unknown> {
    if (!f) throw new Error('fetch is not available');
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await f(target, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('CommunityRecord HTTP ' + res.status);
      return await res.json() as unknown;
    } finally {
      clearTimeout(t);
    }
  }

  function mapVoices(voices: PulseVoice[]) {
    const records: CivicRecord[] = [];
    const evidence: EvidenceItem[] = [];
    for (const v of voices) {
      const rec = voiceToRecord(v, stateIds);
      if (!rec) continue;
      records.push(rec);
      evidence.push(voiceToEvidence(v, rec));
    }
    return { records, evidence };
  }

  function validateCommunityRecord(r: unknown): asserts r is CommunityRecordV01 {
    if (!r || typeof r !== 'object' || Array.isArray(r)) throw new Error('Invalid CommunityRecord object');
    const record = r as Record<string, unknown>;
    if (Object.keys(record).length !== COMMUNITY_RECORD_KEYS.size ||
        Object.keys(record).some((key) => !COMMUNITY_RECORD_KEYS.has(key)) ||
        [...COMMUNITY_RECORD_KEYS].some((key) => !Object.prototype.hasOwnProperty.call(record, key)) ||
        record.contractVersion !== COMMUNITY_CONTRACT_VERSION ||
        record.publicationStatus !== 'published' ||
        typeof record.id !== 'string' || !record.id.trim() ||
        typeof record.text !== 'string' || !record.text.trim() ||
        typeof record.createdAt !== 'string' ||
        !VERIFICATION_STATUSES.has(String(record.verificationStatus)) ||
        !FOLLOW_UP_STATUSES.has(String(record.followUpStatus)) ||
        !Array.isArray(record.evidenceRefIds) ||
        !record.evidenceRefIds.every((value) => typeof value === 'string') ||
        !Array.isArray(record.relatedSuggestedIds) ||
        !record.relatedSuggestedIds.every((value) => typeof value === 'string')) {
      throw new Error('CommunityRecord violated the published v0.1 allowlist or field contract');
    }
    for (const key of ['sector', 'duty', 'issueCategory', 'state', 'lga', 'ward', 'facilityRef', 'officeLabel', 'reportedAt', 'publishedAt']) {
      const value = record[key];
      if (value !== null && typeof value !== 'string') {
        throw new Error('Invalid CommunityRecord field: ' + key);
      }
    }
  }

  function validatePage(value: unknown, expectedPage: number, first?: CommunityRecordsResponse): asserts value is CommunityRecordsResponse {
    if (!value || typeof value !== 'object') throw new Error('Unsupported CommunityRecord contract response');
    const page = value as CommunityRecordsResponse;
    const pageKeys = new Set(['contractVersion', 'publicationBoundary', 'page', 'pageSize', 'total', 'totalPages', 'truncatedUpstream', 'records']);
    const rawPage = value as Record<string, unknown>;
    if (Object.keys(rawPage).length !== pageKeys.size ||
        Object.keys(rawPage).some((key) => !pageKeys.has(key)) ||
        [...pageKeys].some((key) => !Object.prototype.hasOwnProperty.call(rawPage, key)) ||
        page.contractVersion !== COMMUNITY_CONTRACT_VERSION ||
        page.publicationBoundary !== 'published-only' ||
        page.page !== expectedPage ||
        !Number.isInteger(page.pageSize) || page.pageSize < 1 ||
        !Number.isInteger(page.total) || page.total < 0 ||
        !Number.isInteger(page.totalPages) || page.totalPages < 1 ||
        page.totalPages !== Math.max(1, Math.ceil(page.total / page.pageSize)) ||
        page.truncatedUpstream !== false ||
        !Array.isArray(page.records) || page.records.length > page.pageSize ||
        (first && (page.pageSize !== first.pageSize || page.total !== first.total || page.totalPages !== first.totalPages))) {
      throw new Error('Unsupported, inconsistent, or truncated CommunityRecord pagination response');
    }
    page.records.forEach(validateCommunityRecord);
  }

  async function fetchCommunityRecords(): Promise<PulseVoice[]> {
    if (!communityUrl) throw new Error('CommunityRecord endpoint disabled');
    const first = await fetchJson(communityUrl + '?page=1&pageSize=50') as CommunityRecordsResponse;
    validatePage(first, 1);
    const all = [...first.records];
    const totalPages = first.totalPages;
    if (totalPages > 100) throw new Error('CommunityRecord pagination exceeds the safe page limit; refusing a partial feed');
    for (let page = 2; page <= totalPages; page++) {
      const next = await fetchJson(communityUrl + '?page=' + page + '&pageSize=50') as CommunityRecordsResponse;
      validatePage(next, page, first);
      all.push(...next.records);
    }
    if (all.length !== first.total) throw new Error('CommunityRecord pagination did not return the declared complete record count');
    const ids = all.map((record) => record.id);
    if (new Set(ids).size !== ids.length) throw new Error('CommunityRecord pagination returned duplicate record IDs');
    return all.map((r) => ({
      id: String(r.id), sentence: r.text, duty: r.duty || undefined,
      state: r.state || undefined, lga: r.lga || undefined,
      office: r.officeLabel || undefined, created: r.createdAt || undefined,
      sector: r.sector, issueCategory: r.issueCategory, officeLabel: r.officeLabel,
      verificationStatus: r.verificationStatus, evidenceRefIds: r.evidenceRefIds,
      followUpStatus: r.followUpStatus, relatedSuggestedIds: r.relatedSuggestedIds,
      ward: r.ward, facilityRef: r.facilityRef, reportedAt: r.reportedAt,
      publishedAt: r.publishedAt, contractVersion: r.contractVersion,
    }));
  }

  async function load() {
    if (cache && Date.now() - cache.at < TTL) return cache;
    const voices = await fetchCommunityRecords();
    cache = { ...mapVoices(voices), at: Date.now() };
    return cache;
  }

  return {
    mode: 'live',
    label: 'Published CommunityRecord feed',
    async getSources() {
      return sources;
    },
    async getStates() {
      return states;
    },
    async getRecords(q?: RecordQuery) {
      const { records } = await load();
      return records.filter(
        (r) =>
          (!q?.sector || r.sector === q.sector) &&
          (!q?.stateId || r.stateId === q.stateId) &&
          (!q?.institutionId || r.institutionIds.includes(q.institutionId)) &&
          (!q?.text || `${r.title} ${r.summary}`.toLowerCase().includes(q.text.toLowerCase())),
      );
    },
    async getEvidence(q?: EvidenceQuery) {
      const { evidence } = await load();
      return evidence.filter(
        (e) =>
          (!q?.kind || e.kind === q.kind) &&
          (!q?.status || e.status === q.status) &&
          (!q?.sector || e.sector === q.sector) &&
          (!q?.stateId || e.stateId === q.stateId) &&
          (!q?.recordId || e.recordId === q.recordId) &&
          (!q?.text || `${e.title} ${e.excerpt}`.toLowerCase().includes(q.text.toLowerCase())),
      );
    },
    async getInstitutions(): Promise<Institution[]> {
      return [];
    },
    async getCommunityObservations() {
      return fetchCommunityObservations({ url: DEFAULT_COMMUNITY_OBSERVATIONS_URL, fetchImpl: f, timeoutMs });
    },
    async getEvidenceVaultRecords() {
      return fetchEvidenceVaultRecords({ url: DEFAULT_EVIDENCE_VAULT_URL, fetchImpl: f, timeoutMs });
    },
  };
}
