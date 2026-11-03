import { useMemo, useState } from 'react';
import { useBundle } from '../lib/data';
import { useAdapter } from '../lib/hooks';
import { useLite } from '../lib/hooks';
import { PageHeader, Section } from '../design/layout';
import { ChipGroup, Card, Button, SyntheticChip, SourceCitation } from '../design/primitives';
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
  const [selected, setSelected] = useState<string>('');
  const [view, setView] = useState<'map' | 'table'>(lite ? 'table' : 'map');
  const scoped = useMemo(() => records.filter(r => !sector || r.sector === sector), [records, sector]);
  const counts = countBy(scoped, r => r.stateId);
  const sel = states.find(s => s.id === selected);
  const inSel = scoped.filter(r => r.stateId === selected);
  const subnational = sources.filter(s => ['state', 'lga', 'facility', 'point'].includes(s.geoLevel) && (!sector || s.sectors.includes(sector)));
  const rows = [...states].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0) || a.name.localeCompare(b.name));
  const effective = lite && view === 'map' ? 'map' : view;
  return (
    <>
      <p className="muted" style={{ marginBottom: '1rem' }}>
        National indicator pilots (Evidence library) are <strong>national aggregates</strong> — they are not state scores.
        Community records below are a separate published stream. Zero published submissions does not mean zero needs.
      </p>

      <PageHeader
        title="Geography"
        lead="Explore Nigeria’s 36 states and the FCT. Selecting a place shows demonstration records and registered sources that can report at state level or below. Map presence is not proof of evidence coverage. Counts are not rates and do not rank places."
      />
      <p className="hero__meta" style={{marginTop:0,marginBottom:'1rem'}}>
        <span className="chip chip--real">36 states + FCT</span>
        {isDemo ? <span className="chip chip--synth">Record locations: synthetic demo</span> : <span className="chip chip--real">Record locations: published Mandate</span>}
        <span className="chip chip--pilot">No invented LGA identifiers</span>
      </p>
      <Card title="Layer">
        <ChipGroup<Sector> label="Sector" value={sector} onChange={setSector} options={SECTORS.map(s => ({ value: s, label: SECTOR_LABEL[s] }))} />
        <div className="viewtoggle" role="group" aria-label="View">
          <Button variant={effective === 'map' ? 'primary' : 'secondary'} aria-pressed={effective === 'map'} onClick={() => setView('map')}>Map</Button>
          <Button variant={effective === 'table' ? 'primary' : 'secondary'} aria-pressed={effective === 'table'} onClick={() => setView('table')}>Table</Button>
          {lite && <span className="muted">Low-data mode starts in table view; the map is a small vector file and can still be opened.</span>}
        </div>
      </Card>
      <div className="grid2 grid2--map">
        <Section title={isDemo ? "Demonstration records by state" : "Published records by state"} id="mapsec" note={isDemo ? <><SyntheticChip /> Counts are invented. Darker is more demo records, not a worse place.</> : <>Published counts only. Darker means more published records in this dataset, not a worse place or higher prevalence.</>}>
          {records.length === 0 ? <EmptyState title="No published records in this dataset yet">Only published Mandate locations appear here. Empty does not mean communities have no concerns. The map fills in as records are published and reviewed.</EmptyState> : effective === 'map' ? (
            <NigeriaMap values={counts} selected={selected} onSelect={setSelected} unit={isDemo ? "demonstration records" : "published records"} ariaLabel={isDemo ? "Map of Nigerian states shaded by demonstration record count. Each state is a button." : "Map of Nigerian states shaded by published record count. Each state is a button."} />
          ) : (
            <div className="tablewrap"><table className="table"><caption className="sr-only">{isDemo ? "Demonstration records by state" : "Published records by state"}</caption>
              <thead><tr><th scope="col">State</th><th scope="col">Records</th><th scope="col"><span className="sr-only">Select</span></th></tr></thead>
              <tbody>{rows.map(s => <tr key={s.id} className={selected === s.id ? 'row--on' : ''}><th scope="row">{s.name}</th><td>{counts[s.id] ?? 0}</td><td><Button variant="ghost" aria-label={`Select ${s.name}`} onClick={() => setSelected(s.id)}>View</Button></td></tr>)}</tbody></table></div>
          )}
        </Section>
        <aside aria-live="polite">
          <Section title={sel ? sel.name : 'Select a state'} id="detail">
            {!sel ? <p className="muted">Choose a state on the map or in the table to see its records and the real sources that could report there.</p> : (
              <>
                <h3>Records</h3>
                {inSel.length === 0 ? <EmptyState title={`No records for ${sel.name}${sector ? ` in ${SECTOR_LABEL[sector]}` : ''}`}>This shows only that nothing was published here in this dataset. It says nothing about need.</EmptyState> :
                  <ul className="plain">{inSel.map(r => <li key={r.id}><strong>{r.title}</strong><br /><span className="muted">{SECTOR_LABEL[r.sector]} · {CLAIM_LABEL[claimStrength(r, evidence)]}</span></li>)}</ul>}
                <h3>Registered sources that can report at state level or below</h3>
                <p className="muted">Real registry entries, not data for {sel.name}. Check coverage and precision in each source.</p>
                {subnational.length === 0 ? <EmptyState title="No sub-national source registered for this selection" /> : subnational.map(s => <SourceCitation key={s.id} s={s} compact />)}
              </>
            )}
          </Section>
        </aside>
      </div>
    </>
  );
}
