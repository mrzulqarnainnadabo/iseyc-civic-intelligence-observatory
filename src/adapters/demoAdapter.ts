import type { CommunityObservationFeed, EvidenceVaultFeed, EvidenceItem, EvidenceQuery, Institution, ObservatoryAdapter, RecordQuery, SourceRecord, StateRef, CivicRecord } from '../data/types';
import registry from '../data/source-registry.json';
import mapData from '../data/geo/nigeria-map.json';
import { SYNTHETIC_EVIDENCE, SYNTHETIC_RECORDS } from '../data/synthetic';
import { INSTITUTIONS } from '../data/synthetic/institutions';
import { matchesText } from '../lib/rules';

export type DemoBehaviour = 'normal' | 'empty' | 'error' | 'slow';
export interface DemoOptions { behaviour?: DemoBehaviour; latencyMs?: number }

const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/**
 * Demonstration adapter. The source registry and map are real project data; records,
 * evidence and institution links are SYNTHETIC. Behaviour switches (?demo=empty|error|slow)
 * exist so empty, error and loading states can be reviewed without breaking anything.
 */
export function createDemoAdapter(opts: DemoOptions = {}): ObservatoryAdapter {
  const behaviour = opts.behaviour ?? 'normal';
  const latency = opts.latencyMs ?? (behaviour === 'slow' ? 1800 : 120);
  async function gate<T>(real: () => T, empty: T): Promise<T> {
    await wait(latency);
    if (behaviour === 'error') throw new Error('Demonstration error: the data service did not respond. This is a simulated failure.');
    return behaviour === 'empty' ? empty : real();
  }
  return {
    mode: 'demo',
    label: 'Demonstration data',
    getSources: () => gate(() => registry as SourceRecord[], []),
    getStates: async () => (mapData.locations.map(l => ({ id: l.id, name: l.name })) as StateRef[]),
    getRecords: (q?: RecordQuery) => gate(() => SYNTHETIC_RECORDS.filter(r =>
      (!q?.sector || r.sector === q.sector) && (!q?.stateId || r.stateId === q.stateId) &&
      (!q?.institutionId || r.institutionIds.includes(q.institutionId)) && matchesText([r.title, r.summary, r.lga ?? ''], q?.text)), [] as CivicRecord[]),
    getEvidence: (q?: EvidenceQuery) => gate(() => SYNTHETIC_EVIDENCE.filter(e =>
      (!q?.kind || e.kind === q.kind) && (!q?.status || e.status === q.status) && (!q?.sector || e.sector === q.sector) &&
      (!q?.stateId || e.stateId === q.stateId) && (!q?.recordId || e.recordId === q.recordId) && matchesText([e.title, e.excerpt], q?.text)), [] as EvidenceItem[]),
    getInstitutions: () => gate(() => INSTITUTIONS, [] as Institution[]),
    getCommunityObservations: async (): Promise<CommunityObservationFeed> => ({
      status: 'not-in-demo',
      records: [],
      total: null,
      message: 'Live community observations are not included in demonstration data.',
    }),
    getEvidenceVaultRecords: async (): Promise<EvidenceVaultFeed> => ({
      status: 'not-in-demo',
      records: [],
      total: null,
      message: 'Live published evidence records are not included in demonstration data.',
    }),
  };
}
