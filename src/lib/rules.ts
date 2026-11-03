import type { CivicRecord, EvidenceItem, SourceRecord, Sector, Stage } from '../data/types';
import { SECTORS, STAGES } from '../data/types';

/**
 * Accountability rules (see docs/DATA_CONTRACTS.md):
 *  1. A referral, announcement or budget line never establishes implementation.
 *  2. Implementation is "established" only when the 'verified' stage is evidenced by an
 *     evidence item of kind 'independently-verified' with status 'verified'.
 *  3. A community submission can never, by itself, produce a verified status.
 */
export type ClaimStrength = 'verified-delivery' | 'implementation-claimed' | 'announced-only' | 'in-progress-unknown' | 'not-yet-acted-on';

export function stageOf(r: CivicRecord, s: Stage) { return r.stages.find(x => x.stage === s); }

export function implementationEstablished(r: CivicRecord, evidence: EvidenceItem[]): boolean {
  const v = stageOf(r, 'verified');
  if (!v || v.status !== 'evidenced' || !v.evidenceId) return false;
  const ev = evidence.find(e => e.id === v.evidenceId);
  return !!ev && !r.synthetic && !ev.synthetic && ev.recordId === r.id && ev.sector === r.sector && ev.stateId === r.stateId && ev.kind === 'independently-verified' && ev.status === 'verified' && !!ev.verification?.reviewerId && !!ev.verification?.reviewedAt && !!ev.verification?.method;
}

export function claimStrength(r: CivicRecord, evidence: EvidenceItem[]): ClaimStrength {
  if (implementationEstablished(r, evidence)) return 'verified-delivery';
  const impl = stageOf(r, 'implemented');
  if (impl && (impl.status === 'claimed' || impl.status === 'evidenced')) return 'implementation-claimed';
  const ann = stageOf(r, 'announced'); const fund = stageOf(r, 'funded');
  if ([ann, fund].some(x => x && (x.status === 'claimed' || x.status === 'evidenced'))) return 'announced-only';
  const ref = stageOf(r, 'referred');
  if (ref && ref.status !== 'not-reached') return 'in-progress-unknown';
  return 'not-yet-acted-on';
}

export const CLAIM_LABEL: Record<ClaimStrength, string> = {
  'verified-delivery': 'Delivery independently verified',
  'implementation-claimed': 'Implementation claimed, not independently verified',
  'announced-only': 'Announced or funded on paper only',
  'in-progress-unknown': 'Referred; outcome unknown',
  'not-yet-acted-on': 'No institutional action recorded',
};

/** Count how many records reached each stage with at least a claim; used by the demo funnel. */
export function stageCounts(records: CivicRecord[], evidence: EvidenceItem[]) {
  return STAGES.map(stage => ({
    stage,
    reached: records.filter(r => {
      if (stage === 'verified') return implementationEstablished(r, evidence);
      const s = stageOf(r, stage); return !!s && (s.status === 'evidenced' || s.status === 'claimed');
    }).length,
  }));
}

export function countBy<T, K extends string>(items: T[], key: (t: T) => K): Record<K, number> {
  const out = {} as Record<K, number>;
  for (const it of items) { const k = key(it); out[k] = (out[k] ?? 0) + 1; }
  return out;
}

/** Registry coverage by sector: counts sources, not data. Never presented as data coverage. */
export function registryCoverage(sources: SourceRecord[]) {
  return SECTORS.map(sector => {
    const inSector = sources.filter(s => s.sectors.includes(sector));
    const official = inSector.filter(s => s.kind === 'official-data');
    const subnational = official.filter(s => ['state', 'lga', 'facility', 'point'].includes(s.geoLevel));
    const confirmed = inSector.filter(s => s.urlStatus === 'confirmed' || s.urlStatus === 'domain-confirmed');
    return { sector: sector as Sector, total: inSector.length, official: official.length, subnationalOfficial: subnational.length, confirmed: confirmed.length };
  });
}

/** Human-readable gaps derived from the registry (no invented facts). */
export function registryGaps(sources: SourceRecord[]): string[] {
  const gaps: string[] = [];
  for (const c of registryCoverage(sources)) {
    const label = c.sector.replace('-', ' ');
    const cap = label.charAt(0).toUpperCase() + label.slice(1);
    if (c.official === 0) gaps.push(`No official data source is registered for ${label}.`);
    else if (c.subnationalOfficial === 0) gaps.push(`${cap}: registered official sources are national only; no sub-national official source is registered.`);
    if (c.total > 0 && c.confirmed === 0) gaps.push(`${cap}: none of its registered sources has been re-confirmed yet.`);
  }
  if (!sources.some(s => s.kind === 'independently-verified' && s.urlStatus !== 'not-applicable')) gaps.push('No independent verification source or method is operating yet.');
  return gaps;
}

export function matchesText(hay: string[], q?: string) {
  if (!q) return true; const n = q.trim().toLowerCase(); if (!n) return true;
  return hay.some(h => h.toLowerCase().includes(n));
}
