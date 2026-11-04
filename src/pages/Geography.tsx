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
  const [view, setView] = useState<'map' | 'table'>(lite ? 'table' : 'map');
  const scoped = useMemo(() => records.filter((record) => !sector || record.sector === sector), [records, sector]);
  const counts = countBy(scoped, (record) => record.stateId);
  const selectedState = states.find((state) => state.id === selected);
  const selectedRecords = scoped.filter((record) => record.stateId === selected);
  const subnationalSources = sources.filter((source) => ['state', 'lga', 'facility', 'point'].includes(source.geoLevel) && (!sector || source.sectors.includes(sector)));
  const rows = [...states].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0) || a.name.localeCompare(b.name));
  const effectiveView = lite ? 'table' : view;

  return <>
    <header className="page-heading">
      <h1>Places</h1>
      <span className="page-heading__meta">{isDemo ? 'Demonstration locations' : 'Published record locations'}</span>
    </header>
    {isDemo && <p><SyntheticChip /></p>}
    <div className="workspace-section">
      <ChipGroup<Sector> label="Sector" value={sector} onChange={setSector} options={SECTORS.map((item) => ({ value: item, label: SECTOR_LABEL[item] }))} />
      <div className="viewtoggle" role="group" aria-label="View">
        <Button disabled={lite} variant={effectiveView === 'map' ? 'primary' : 'secondary'} aria-pressed={effectiveView === 'map'} onClick={() => setView('map')}>Map</Button>
        <Button variant={effectiveView === 'table' ? 'primary' : 'secondary'} aria-pressed={effectiveView === 'table'} onClick={() => setView('table')}>Table</Button>
      </div>
    </div>
    <div className="grid2 grid2--map">
      <Section title={isDemo ? 'Demonstration records by state' : 'Published records by state'} id="places-map">
        {effectiveView === 'map' ? <NigeriaMap values={counts} selected={selected} onSelect={setSelected} unit={isDemo ? 'demonstration records' : 'published records'} ariaLabel="Map of Nigeria by published community record count" /> :
          <div className="tablewrap"><table className="table"><caption className="sr-only">Record count by state</caption><thead><tr><th scope="col">State</th><th scope="col">Records</th><th scope="col"> </th></tr></thead><tbody>{rows.map((state) => <tr key={state.id} className={selected === state.id ? 'row--on' : ''}><th scope="row">{state.name}</th><td>{counts[state.id] ?? 0}</td><td><Button variant="ghost" aria-label={`Select ${state.name}`} onClick={() => setSelected(state.id)}>View</Button></td></tr>)}</tbody></table></div>}
      </Section>
      <aside aria-live="polite">
        <Section title={selectedState?.name ?? 'Select a state'} id="place-detail">
          {!selectedState ? <p className="muted">Choose a state to inspect its published records.</p> : <>
            <h3>Records ({selectedRecords.length})</h3>
            {selectedRecords.length === 0 ? <EmptyState title="No records in this feed for this state" /> : <ul className="plain">{selectedRecords.map((record) => <li key={record.id}><strong>{record.title}</strong><br /><span className="muted">{record.sector ? SECTOR_LABEL[record.sector] : 'Unclassified'} · {CLAIM_LABEL[claimStrength(record, evidence)]}</span></li>)}</ul>}
            <h3>Registered subnational sources</h3>
            <p className="muted">These sources list subnational coverage; this does not confirm observations for {selectedState.name}.</p>
            {subnationalSources.length === 0 ? <EmptyState title="No subnational sources registered" /> : subnationalSources.map((source) => <SourceCitation key={source.id} s={source} compact />)}
          </>}
        </Section>
      </aside>
    </div>
  </>;
}