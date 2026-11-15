import { useMemo, useState } from 'react';
import { useBundle } from '../lib/data';
import { useAdapter, useLite } from '../lib/hooks';
import { Section } from '../design/layout';
import { ChipGroup, Button, SyntheticChip, SourceCitation } from '../design/primitives';
import { NigeriaMap } from '../design/map';
import { EmptyState } from '../design/feedback';
import { SECTORS, SECTOR_LABEL, type Sector } from '../data/types';
import { CLAIM_LABEL, claimStrength, countBy } from '../lib/rules';

export default function Geography() {
  const adapter = useAdapter();
  const isDemo = adapter.mode === 'demo';
  const { records, states, sources, evidence } = useBundle();
  const { lite } = useLite();
  const [sector, setSector] = useState<Sector | ''>('');
  const [selected, setSelected] = useState('');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'map' | 'table'>(lite ? 'table' : 'map');
  const scoped = useMemo(() => records.filter((record) => !sector || record.sector === sector), [records, sector]);
  const counts = countBy(scoped, (record) => record.stateId);
  const selectedState = states.find((state) => state.id === selected);
  const selectedRecords = scoped.filter((record) => record.stateId === selected);
  const selectedEvidence = evidence.filter((item) => item.stateId === selected && (!sector || item.sector === sector));
  const subnationalSources = sources.filter((source) => ['state', 'lga', 'facility', 'point'].includes(source.geoLevel) && (!sector || source.sectors.includes(sector)));
  const rows = useMemo(() => states
    .filter((state) => state.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    .sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0) || a.name.localeCompare(b.name)),
    [states, query, counts]);
  const effectiveView = lite ? 'table' : view;
  const statesWithRecords = states.filter((state) => (counts[state.id] ?? 0) > 0).length;

  return <>
    <header className="page-heading">
      <div><h1>Explore Nigeria</h1><span className="page-heading__meta">{isDemo ? 'Demonstration geography' : 'Geographic distribution of published community records'}</span></div>
      <span className="geo-total">{states.length} jurisdictions</span>
    </header>
    {isDemo && <p><SyntheticChip /></p>}
    <section className="geo-explorer-intro" aria-label="Geography coverage explanation">
      <div><strong>{statesWithRecords} of {states.length}</strong><span>jurisdictions represented in this community-record feed</span></div>
      <p>The map shows published community records, not population prevalence or the completeness of official state statistics. The FCT is included as a separate jurisdiction.</p>
    </section>
    <div className="workspace-section geo-controls">
      <label className="geo-search"><span>Find a state or the FCT</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search jurisdictions" aria-label="Search states and FCT" /></label>
      <ChipGroup<Sector> label="Sector" value={sector} onChange={setSector} options={SECTORS.map((item) => ({ value: item, label: SECTOR_LABEL[item] }))} />
      <div className="viewtoggle" role="group" aria-label="Geography view">
        <Button disabled={lite} variant={effectiveView === 'map' ? 'primary' : 'secondary'} aria-pressed={effectiveView === 'map'} onClick={() => setView('map')}>Map</Button>
        <Button variant={effectiveView === 'table' ? 'primary' : 'secondary'} aria-pressed={effectiveView === 'table'} onClick={() => setView('table')}>List</Button>
      </div>
    </div>
    <div className="grid2 grid2--map geo-layout">
      <Section title={isDemo ? 'Demonstration records by jurisdiction' : 'Published community records by jurisdiction'} id="places-map">
        {effectiveView === 'map' ? <NigeriaMap values={counts} selected={selected} onSelect={setSelected} unit={isDemo ? 'demonstration records' : 'published community records'} ariaLabel="Map of Nigeria showing published community record counts by state and FCT" /> :
          <div className="tablewrap"><table className="table"><caption className="sr-only">Published community record counts by state and FCT</caption><thead><tr><th scope="col">Jurisdiction</th><th scope="col">Community records</th><th scope="col"></th></tr></thead><tbody>{rows.map((state) => <tr key={state.id} className={selected === state.id ? 'row--on' : ''}><th scope="row">{state.name}</th><td>{counts[state.id] ?? 0}</td><td><Button variant="ghost" aria-label={`Inspect ${state.name}`} onClick={() => setSelected(state.id)}>Inspect</Button></td></tr>)}</tbody></table>{rows.length === 0 && <p className="muted">No matching jurisdiction. Try another search.</p>}</div>}
        <p className="geo-map-note">A zero means no published record is present in this feed for the selected filter. It does not mean the underlying issue is absent.</p>
      </Section>
      <aside aria-live="polite">
        <Section title={selectedState?.name ?? 'Jurisdiction detail'} id="place-detail">
          {!selectedState ? <p className="muted">Select a state or FCT on the map or in the list to inspect available records and evidence.</p> : <>
            <div className="geo-detail-stats">
              <div><strong>{selectedRecords.length}</strong><span>Published community records</span></div>
              <div><strong>{selectedEvidence.length}</strong><span>Linked evidence items</span></div>
            </div>
            {selectedRecords.length === 0 ? <EmptyState title="No published community records in this feed" /> : <ul className="plain">{selectedRecords.map((record) => <li key={record.id}><strong>{record.title}</strong><br /><span className="muted">{record.sector ? SECTOR_LABEL[record.sector] : 'Unclassified'} · {CLAIM_LABEL[claimStrength(record, evidence)]}</span></li>)}</ul>}
            <h3>Linked evidence</h3>
            {selectedEvidence.length === 0 ? <p className="muted">No linked evidence items are recorded for this jurisdiction in the current feed.</p> : <ul className="plain">{selectedEvidence.map((item) => <li key={item.id}><strong>{item.title}</strong><br /><span className="muted">{item.publisherLabel} · {item.date} · {item.status}</span></li>)}</ul>}
            <h3>Registered subnational sources</h3>
            <p className="muted">These sources list subnational geographic capability. Their registration does not confirm that observations have been ingested for {selectedState.name}.</p>
            {subnationalSources.length === 0 ? <EmptyState title="No subnational sources registered for this filter" /> : subnationalSources.map((source) => <SourceCitation key={source.id} s={source} compact />)}
          </>}
        </Section>
      </aside>
    </div>
    <p className="geo-method-note"><strong>Coverage rule.</strong> Geographic boundaries, registered sources, published community records and linked evidence are different things. This page reports each available feed separately; it does not infer state-level statistics from national observations or treat missing data as zero.</p>
  </>;
}
