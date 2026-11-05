import { createContext, useContext, type ReactNode } from 'react';
import type { CivicRecord, CommunityObservationFeed, EvidenceVaultFeed, EvidenceItem, Institution, SourceRecord, StateRef } from '../data/types';
import { useAdapter, useAsync } from './hooks';
import { Loading, ErrorState } from '../design/feedback';

export interface Bundle { sources: SourceRecord[]; records: CivicRecord[]; evidence: EvidenceItem[]; institutions: Institution[]; states: StateRef[]; communityObservations?: CommunityObservationFeed; evidenceVault?: EvidenceVaultFeed; communityRecordProvenance?: CommunityRecordProvenance }
const Ctx = createContext<Bundle | null>(null);
export const useBundle = (): Bundle => { const b = useContext(Ctx); if (!b) throw new Error('DataProvider missing'); return b; };

/** Loads everything once; handles loading and error for every page. */
export function DataProvider({ children }: { children: ReactNode }) {
  const a = useAdapter();
  const st = useAsync<Bundle>(async () => {
    const [sources, records, evidence, institutions, states, communityObservations, evidenceVault, communityRecordProvenance] = await Promise.all([
      a.getSources(), a.getRecords(), a.getEvidence(), a.getInstitutions(), a.getStates(),
      a.getCommunityObservations ? a.getCommunityObservations() : Promise.resolve({ status: 'unavailable' as const, records: [], total: null, message: 'This adapter does not provide a community observation feed.' }),
      a.getEvidenceVaultRecords ? a.getEvidenceVaultRecords() : Promise.resolve({ status: 'unavailable' as const, records: [], total: null, message: 'This adapter does not provide a published Evidence Vault feed.' }),
      a.getCommunityRecordProvenance ? a.getCommunityRecordProvenance() : Promise.resolve(undefined),
    ]);
    return { sources, records, evidence, institutions, states, communityObservations, evidenceVault, communityRecordProvenance };
  }, [a]);
  if (st.status === 'loading') return <div className="main"><Loading label="Loading the Observatory" /></div>;
  if (st.status === 'error') return <div className="main"><ErrorState message={st.message} onRetry={st.reload} /></div>;
  return <Ctx.Provider value={st.data}>{children}</Ctx.Provider>;
}
export function BundleProvider({ value, children }: { value: Bundle; children: ReactNode }) { return <Ctx.Provider value={value}>{children}</Ctx.Provider>; }
