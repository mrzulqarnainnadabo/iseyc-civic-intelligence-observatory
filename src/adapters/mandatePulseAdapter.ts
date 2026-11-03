/**
 * Published-only Civic Mandate pulse adapter.
 * Consumes the public /api/pulse contract. Does not read private submission fields.
 * Published community records are real moderated outputs — not a national survey and not independently verified outcomes.
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

export const DEFAULT_PULSE_URL = 'https://2027-street-mandate.vercel.app/api/pulse';

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
  Other: 'governance',
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

function mapDuty(duty?: string, mandate?: string): Sector {
  const key = (duty || mandate || 'Other').trim();
  return DUTY_TO_SECTOR[key] ?? 'governance';
}

function voiceToRecord(v: PulseVoice, stateIds: Set<string>): CivicRecord | null {
  if (!v?.id || !v.sentence?.trim()) return null;
  const stateName = (v.state || '').trim();
  if (!stateName) return null;
  let stateId = slugState(stateName);
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
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export function createMandatePulseAdapter(cfg: MandatePulseConfig = {}): ObservatoryAdapter {
  const url = cfg.pulseUrl || DEFAULT_PULSE_URL;
  const f = cfg.fetchImpl ?? (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : undefined);
  const timeoutMs = cfg.timeoutMs ?? 12_000;

  const states: StateRef[] = (mapData as { locations: { id: string; name: string }[] }).locations.map((l) => ({ id: l.id, name: l.name }));
  const stateIds = new Set(states.map((s) => s.id));
  const sources = registry as SourceRecord[];

  let cache: { records: CivicRecord[]; evidence: EvidenceItem[]; at: number } | null = null;
  const TTL = 60_000;

  async function load() {
    if (!f) throw new Error('fetch is not available');
    if (cache && Date.now() - cache.at < TTL) return cache;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await f(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`Pulse HTTP ${res.status}`);
      const body = (await res.json()) as PulseResponse;
      const voices = Array.isArray(body.voices) ? body.voices : [];
      const records: CivicRecord[] = [];
      const evidence: EvidenceItem[] = [];
      for (const v of voices) {
        const rec = voiceToRecord(v, stateIds);
        if (!rec) continue;
        records.push(rec);
        evidence.push(voiceToEvidence(v, rec));
      }
      cache = { records, evidence, at: Date.now() };
      return cache;
    } finally {
      clearTimeout(t);
    }
  }

  return {
    mode: 'live',
    label: 'Published Civic Mandate records (public pulse)',
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
      // Do not invent institutional responsibility from pulse office strings.
      return [];
    },
  };
}
