import { useMemo, useState } from 'react';
import { useBundle } from '../lib/data';
import { useLite } from '../lib/hooks';
import { PageHeader, Section } from '../design/layout';
import { ChipGroup, Card, Button, SyntheticChip, SourceCitation } from '../design/primitives';
import { NigeriaMap } from '../design/map';
import { EmptyState } from '../design/feedback';
import { SECTORS, SECTOR_LABEL, type Sector } from '../data/types';
import { CLAIM_LABEL, claimStrength, countBy } from '../lib/rules';

export default function Geography() {
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
      <PageHeader title="Geographic explorer" lead="See where published demands sit and which sources can report at state level or below. Counts are not rates and do not rank places." />
      <Card title="Layer">
        <ChipGroup<Sector> label="Sector" value={sector} onChange={setSector} options={SECTORS.map(s => ({ value: s, label: SECTOR_LABEL[s] }))} />
        <div className="viewtoggle" role="group" aria-label="View">
          <Button variant={effective === 'map' ? 'primary' : 'secondary'} aria-pressed={effective === 'map'} onClick={() => setView('map')}>Map</Button>
          <Button variant={effective === 'table' ? 'primary' : 'secondary'} aria-pressed={effective === 'table'} onClick={() => setView('table')}>Table</Button>
          {lite && <span className="muted">Low-data mode starts in table view; the map is a small vector file and can still be opened.</span>}
        </div>
      </Card>
      <div className="grid2 grid2--map">
        <Section title="Demonstration records by state" id="mapsec" note={<><SyntheticChip /> Counts are invented. A darker state means more demonstration records, never a worse or better place.</>}>
          {records.length === 0 ? <EmptyState title="No published records yet">The map fills in as records are published and reviewed.</EmptyState> : effective === 'map' ? (
            <NigeriaMap values={counts} selected={selected} onSelect={setSelected} unit="demonstration records" ariaLabel="Map of Nigerian states shaded by demonstration record count. Each state is a button." />
          ) : (
            <div className="tablewrap"><table className="table"><caption className="sr-only">Demonstration records by state</caption>
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
