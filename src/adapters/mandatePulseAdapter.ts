/**
 * Published-only Civic Mandate pulse adapter.
 * Consumes the public /api/pulse contract. Does not read private submission fields.
 * Published community records are real moderated outputs — not a national survey and not independently verified outcomes.
 */
import type {
  CivicRecord,
  CommunityRecordProvenance,
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

export const DEFAULT_PULSE_URL = 'https://2027-street-mandate.vercel.app/api/pulse';
export const DEFAULT_COMMUNITY_RECORDS_URL = 'https://2027-street-mandate.vercel.app/api/v1/community-records';
const COMMUNITY_CONTRACT_VERSION = '0.1.0';

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
  id: string; contractVersion: string; publicationStatus: string; verificationStatus: string;
  text: string; duty: string | null; state: string | null; lga: string | null;
  officeLabel: string | null; createdAt: string;
  sector: string | null; issueCategory: string | null; ward: string | null;
  facilityRef: string | null; reportedAt: string | null; publishedAt: string | null;
  evidenceRefIds: string[]; followUpStatus: string; relatedSuggestedIds: string[];
};
type CommunityRecordsResponse = {
  contractVersion: string; publicationBoundary: string; page: number; pageSize: number;
  total: number; totalPages: number; truncatedUpstream: boolean; records: CommunityRecordV01[];
};

type PulseResponse = {
  voices?: PulseVoice[];
  total?: number;
  states?: unknown;
  tally?: unknown;
  timestamp?: string;
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
  // CommunityRecord permits unknown geography; preserve the record without inventing a state.
  let stateId = stateName ? slugState(stateName) : 'unknown';
  // Prefer geo file id when name matches
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
  pulseUrl?: string;
  communityRecordsUrl?: string | null;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export function createMandatePulseAdapter(cfg: MandatePulseConfig = {}): ObservatoryAdapter {
  const url = cfg.pulseUrl || DEFAULT_PULSE_URL;
  const communityUrl = cfg.communityRecordsUrl === null ? null : (cfg.communityRecordsUrl || DEFAULT_COMMUNITY_RECORDS_URL);
  const f = cfg.fetchImpl ?? (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : undefined);
  const timeoutMs = cfg.timeoutMs ?? 12_000;

  const states: StateRef[] = (mapData as { locations: { id: string; name: string }[] }).locations.map((l) => ({ id: l.id, name: l.name }));
  const stateIds = new Set(states.map((s) => s.id));
  const sources = registry as SourceRecord[];

  let cache: { records: CivicRecord[]; evidence: EvidenceItem[]; provenance: CommunityRecordProvenance; at: number } | null = null;
  const TTL = 60_000;

  async function fetchJson(target: string): Promise<unknown> {
    if (!f) throw new Error('fetch is not available');
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await f(target, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error((target === url ? 'Pulse' : 'CommunityRecord') + ' HTTP ' + res.status);
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

  async function fetchCommunityRecords(): Promise<PulseVoice[]> {
    if (!communityUrl) throw new Error('CommunityRecord endpoint disabled');
    const first = await fetchJson(communityUrl + '?page=1&pageSize=50') as CommunityRecordsResponse;
    if (!first || first.contractVersion !== COMMUNITY_CONTRACT_VERSION || first.publicationBoundary !== 'published-only' || !Array.isArray(first.records) || first.page !== 1 || !Number.isInteger(first.totalPages) || first.totalPages < 1) {
      throw new Error('Unsupported CommunityRecord contract response');
    }
    if (first.truncatedUpstream) throw new Error('CommunityRecord feed is truncated upstream; refusing to present it as complete');
    const all = [...first.records];
    const totalPages = Number(first.totalPages);
    if (totalPages > 100) throw new Error('CommunityRecord pagination exceeds the safe page limit; refusing a partial feed');
    for (let page = 2; page <= totalPages; page++) {
      const next = await fetchJson(communityUrl + '?page=' + page + '&pageSize=50') as CommunityRecordsResponse;
      if (!next || next.contractVersion !== COMMUNITY_CONTRACT_VERSION || next.publicationBoundary !== 'published-only' || !Array.isArray(next.records) || next.page !== page || next.truncatedUpstream) {
        throw new Error('Invalid or truncated CommunityRecord pagination response');
      }
      all.push(...next.records);
    }
    return all.map((r) => {
      if (r.contractVersion !== COMMUNITY_CONTRACT_VERSION || r.publicationStatus !== 'published' || !r.id || !r.text?.trim()) {
        throw new Error('CommunityRecord violated the published v0.1 contract');
      }
      return {
        id: String(r.id), sentence: r.text, duty: r.duty || undefined,
        state: r.state || undefined, lga: r.lga || undefined,
        office: r.officeLabel || undefined, created: r.createdAt || undefined,
        sector: r.sector, issueCategory: r.issueCategory, officeLabel: r.officeLabel,
        verificationStatus: r.verificationStatus, evidenceRefIds: r.evidenceRefIds,
        followUpStatus: r.followUpStatus, relatedSuggestedIds: r.relatedSuggestedIds,
        ward: r.ward, facilityRef: r.facilityRef, reportedAt: r.reportedAt,
        publishedAt: r.publishedAt, contractVersion: r.contractVersion,
      };
    });
  }

  async function load() {
    if (cache && Date.now() - cache.at < TTL) return cache;
    let voices: PulseVoice[] = [];
    let provenance: CommunityRecordProvenance;

    if (communityUrl) {
      try {
        voices = await fetchCommunityRecords();
        provenance = {
          status: 'primary',
          source: 'civic-mandate-community-records-v0.1',
          fallbackReason: null,
          contractVersion: COMMUNITY_CONTRACT_VERSION,
          limitations: [
            'Published CommunityRecords only; publication is not independent verification.',
            'Community record counts are not prevalence estimates.',
          ],
        };
      } catch (communityError) {
        const reason = communityError instanceof Error ? communityError.message : String(communityError);
        const isContractFailure = /Unsupported CommunityRecord|Invalid CommunityRecord|violated the published v0\.1 contract|CommunityRecord feed is truncated|CommunityRecord pagination exceeds/.test(reason);
        if (isContractFailure) {
          const empty = mapVoices([]);
          cache = {
            ...empty,
            provenance: {
              status: 'invalid',
              source: 'unavailable',
              fallbackReason: 'community_record_invalid_contract',
              contractVersion: null,
              limitations: ['The CommunityRecord response failed contract validation. Pulse fallback was intentionally not used.'],
            },
            at: Date.now(),
          };
          return cache;
        }
        try {
          const body = await fetchJson(url) as PulseResponse & { error?: string };
          if (body?.error || !Array.isArray(body?.voices)) throw new Error('Invalid pulse response');
          voices = body.voices;
          provenance = {
            status: 'fallback',
            source: 'civic-mandate-pulse-published-only',
            fallbackReason: reason || 'community_record_unavailable',
            contractVersion: null,
            limitations: [
              'Legacy pulse compatibility feed is in use because CommunityRecord retrieval failed.',
              'Published records only; this feed is not a representative national survey.',
              'Publication is not independent verification.',
            ],
          };
        } catch (pulseError) {
          const pulseReason = pulseError instanceof Error ? pulseError.message : String(pulseError);
          const empty = mapVoices([]);
          cache = {
            ...empty,
            provenance: {
              status: 'unavailable',
              source: 'unavailable',
              fallbackReason: `${reason}; ${pulseReason}`,
              contractVersion: null,
              limitations: ['Both the authoritative CommunityRecord API and legacy pulse compatibility feed are unavailable. No substitute records are shown.'],
            },
            at: Date.now(),
          };
          return cache;
        }
      }
    } else {
      try {
        const body = await fetchJson(url) as PulseResponse & { error?: string };
        if (body?.error || !Array.isArray(body?.voices)) throw new Error('Invalid pulse response');
        voices = body.voices;
        provenance = {
          status: 'fallback',
          source: 'civic-mandate-pulse-published-only',
          fallbackReason: 'community_record_endpoint_not_configured',
          contractVersion: null,
          limitations: ['CommunityRecord endpoint is not configured; legacy pulse compatibility feed is in use.'],
        };
      } catch (pulseError) {
        const empty = mapVoices([]);
        cache = {
          ...empty,
          provenance: {
            status: 'unavailable',
            source: 'unavailable',
            fallbackReason: pulseError instanceof Error ? pulseError.message : 'pulse_unavailable',
            contractVersion: null,
            limitations: ['The published community feed is unavailable. No substitute records are shown.'],
          },
          at: Date.now(),
        };
        return cache;
      }
    }

    cache = { ...mapVoices(voices), provenance, at: Date.now() };
    return cache;
  }

  return {
    mode: 'live',
    label: 'Published Mandate feed',
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
    async getCommunityRecordProvenance() {
      return (await load()).provenance;
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
      // Do not invent institutional responsibility from pulse office strings.
      return [];
    },
    async getCommunityObservations() {
      // Separate feed: never fall back to demands, demo data or a synthetic substitute.
      return fetchCommunityObservations({ url: DEFAULT_COMMUNITY_OBSERVATIONS_URL, fetchImpl: f, timeoutMs });
    },
    async getEvidenceVaultRecords() {
      // Evidence Vault is a separate, dual-reviewed source register; never substitute the source registry.
      return fetchEvidenceVaultRecords({ url: DEFAULT_EVIDENCE_VAULT_URL, fetchImpl: f, timeoutMs });
    },
  };
}
