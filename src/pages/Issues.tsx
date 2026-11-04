import { useMemo, useState } from 'react';
import { useBundle } from '../lib/data';
import { useAdapter } from '../lib/hooks';
import { EmptyState } from '../design/feedback';
import { SearchBox, SelectField, SyntheticChip, SourceCitation } from '../design/primitives';
import { LifecycleTimeline } from '../design/timeline';
import { SECTORS, SECTOR_LABEL, type Sector } from '../data/types';
import { matchesText, countBy, CLAIM_LABEL, claimStrength } from '../lib/rules';

export default function Issues() {
  const adapter = useAdapter();
  const isDemo = adapter.mode === 'demo';
  const { records, evidence, sources, states } = useBundle();
  const [sector, setSector] = useState<Sector | ''>('');
  const [stateId, setStateId] = useState('');
  const [text, setText] = useState('');
  const filtered = useMemo(() => records.filter((record) =>
    (!sector || record.sector === sector) &&
    (!stateId || record.stateId === stateId) &&
    matchesText([record.title, record.summary, record.lga ?? ''], text)
  ), [records, sector, stateId, text]);
  const bySector = countBy(records, (record) => record.sector);
  const sectorSources = sector ? sources.filter((source) => source.sectors.includes(sector)) : [];

  return <>
    <header className="page-heading">
      <h1>Issues</h1>
      <span className="page-heading__meta">{isDemo ? 'Demonstration data' : 'Published Mandate records'}</span>
    </header>
    {isDemo && <p><SyntheticChip /></p>}
    <div className="workspace-section">
      <div className="workspace-section__head"><h2>Sectors</h2></div>
      <div className="sector-grid" role="group" aria-label="Filter by sector">
        {SECTORS.map((item) => <button key={item} type="button" className={`sector-tile${sector === item ? ' sector-tile--on' : ''}`} aria-pressed={sector === item} onClick={() => setSector(sector === item ? '' : item)}>
          <strong>{SECTOR_LABEL[item]}</strong><span className="meta">{bySector[item] ?? 0} records</span>
        </button>)}
      </div>
    </div>
    <div className="filters">
      <SelectField label="State" value={stateId} onChange={setStateId} allLabel="All states" options={states.map((state) => ({ value: state.id, label: state.name }))} />
      <SearchBox label="Search" value={text} onChange={setText} placeholder="Search records" />
      {(sector || stateId || text) && <button type="button" className="btn btn--ghost" onClick={() => { setSector(''); setStateId(''); setText(''); }}>Clear filters</button>}
    </div>
    <section className="workspace-section">
      <div className="workspace-section__head"><h2>{filtered.length} {isDemo ? 'demonstration records' : 'published records'}</h2></div>
      {filtered.length === 0 ? <EmptyState title="No records match these filters">A missing match is not evidence that a need is absent.</EmptyState> : <div className="workspace-records">
        {filtered.map((record) => <details className="record" key={record.id}>
          <summary>
            <span className="record__title">{record.title}</span>
            <span className="record__meta">
              <span className="chip chip--real">{SECTOR_LABEL[record.sector]}</span>
              <span className="chip chip--pilot">{states.find((state) => state.id === record.stateId)?.name ?? record.stateId}{record.lga ? ` · ${record.lga}` : ''}</span>
              <span className="muted">{isDemo ? 'Demonstration' : 'Published'}</span>
            </span>
          </summary>
          <p>{record.summary}</p>
          <p><strong>Evidence status:</strong> {CLAIM_LABEL[claimStrength(record, evidence)]}</p>
          {record.institutionIds.length > 0 && <p className="muted">Institution mapping requires separate verification.</p>}
          <LifecycleTimeline record={record} evidence={evidence} />
          {isDemo && <SyntheticChip />}
        </details>)}
      </div>}
    </section>
    {sector && <section className="workspace-section">
      <div className="workspace-section__head"><h2>Registered sources · {SECTOR_LABEL[sector]}</h2></div>
      {sectorSources.length === 0 ? <EmptyState title="No source registered for this sector" /> : sectorSources.map((source) => <SourceCitation key={source.id} s={source} compact />)}
    </section>}
  </>;
}