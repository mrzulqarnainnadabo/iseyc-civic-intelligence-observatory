import { createContext, useContext, type ReactNode } from 'react';
import type { CivicRecord, CommunityObservationFeed, EvidenceVaultFeed, EvidenceItem, Institution, SourceRecord, StateRef } from '../data/types';
import { useAdapter, useAsync } from './hooks';
import { Loading, ErrorState } from '../design/feedback';

export interface Bundle { sources: SourceRecord[]; records: CivicRecord[]; evidence: EvidenceItem[]; institutions: Institution[]; states: StateRef[]; communityObservations?: CommunityObservationFeed; evidenceVault?: EvidenceVaultFeed }
const Ctx = createContext<Bundle | null>(null);
export const useBundle = (): Bundle => { const b = useContext(Ctx); if (!b) throw new Error('DataProvider missing'); return b; };

/** Loads each read-only feed independently so one upstream outage does not hide other evidence. */
export function DataProvider({ children }: { children: ReactNode }) {
  const a = useAdapter();
  const st = useAsync<Bundle>(async () => {
    const safe = async <T,>(request: Promise<T>, fallback: T): Promise<T> => {
      try { return await request; } catch { return fallback; }
    };
    const [sources, records, evidence, institutions, states, communityObservations, evidenceVault] = await Promise.all([
      safe(a.getSources(), [] as SourceRecord[]),
      safe(a.getRecords(), [] as CivicRecord[]),
      safe(a.getEvidence(), [] as EvidenceItem[]),
      safe(a.getInstitutions(), [] as Institution[]),
      safe(a.getStates(), [] as StateRef[]),
      a.getCommunityObservations
        ? safe(a.getCommunityObservations(), { status: 'unavailable' as const, records: [], total: null, message: 'Community observation retrieval is unavailable.' })
        : Promise.resolve({ status: 'unavailable' as const, records: [], total: null, message: 'This adapter does not provide a community observation feed.' }),
      a.getEvidenceVaultRecords
        ? safe(a.getEvidenceVaultRecords(), { status: 'unavailable' as const, records: [], total: null, message: 'Published Evidence Vault retrieval is unavailable.' })
        : Promise.resolve({ status: 'unavailable' as const, records: [], total: null, message: 'This adapter does not provide a published Evidence Vault feed.' }),
    ]);
    return { sources, records, evidence, institutions, states, communityObservations, evidenceVault };
  }, [a]);
  if (st.status === 'loading') return <div className="main"><Loading label="Loading the Observatory" /></div>;
  if (st.status === 'error') return <div className="main"><ErrorState message={st.message} onRetry={st.reload} /></div>;
  return <Ctx.Provider value={st.data}>{children}</Ctx.Provider>;
}
export function BundleProvider({ value, children }: { value: Bundle; children: ReactNode }) { return <Ctx.Provider value={value}>{children}</Ctx.Provider>; }
