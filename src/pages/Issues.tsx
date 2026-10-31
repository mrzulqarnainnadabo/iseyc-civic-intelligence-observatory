import { useMemo, useState } from 'react';
import { useBundle } from '../lib/data';
import { PageHeader, Section } from '../design/layout';
import { ChipGroup, SearchBox, SelectField, Card, SyntheticChip, SourceCitation, StatusBadge } from '../design/primitives';
import { BarChart } from '../design/charts';
import { EmptyState } from '../design/feedback';
import { LifecycleTimeline } from '../design/timeline';
import { SECTORS, SECTOR_LABEL, type Sector } from '../data/types';
import { matchesText, countBy, CLAIM_LABEL, claimStrength } from '../lib/rules';

export default function Issues() {
  const { records, evidence, sources, states, institutions } = useBundle();
  const [sector, setSector] = useState<Sector | ''>('');
  const [stateId, setStateId] = useState('');
  const [text, setText] = useState('');
  const filtered = useMemo(() => records.filter(r => (!sector || r.sector === sector) && (!stateId || r.stateId === stateId) && matchesText([r.title, r.summary, r.lga ?? ''], text)), [records, sector, stateId, text]);
  const bySector = countBy(records, r => r.sector);
  const sectorSources = sector ? sources.filter(s => s.sectors.includes(sector)) : [];
  const stateName = (id: string) => states.find(s => s.id === id)?.name ?? id;
  return (
    <>
      <PageHeader title="Issues and sector explorer" lead="Browse published citizen demands by sector and state, then see which real sources are registered for that sector." />
      <Card className="filters" title="Filter">
        <ChipGroup<Sector> label="Sector" value={sector} onChange={setSector} options={SECTORS.map(s => ({ value: s, label: SECTOR_LABEL[s] }))} />
        <div className="filters__row">
          <SelectField label="State" value={stateId} onChange={setStateId} allLabel="All states" options={states.map(s => ({ value: s.id, label: s.name }))} />
          <SearchBox label="Search records" value={text} onChange={setText} placeholder="e.g. borehole, roof, clinic" />
        </div>
      </Card>

      <div className="grid2">
        <Section title={`Records (${filtered.length})`} id="recs" note={<><SyntheticChip /> Every record below is invented for demonstration.</>}>
          {filtered.length === 0 ? (
            <EmptyState title="No records match these filters">{records.length === 0 ? 'No published records are available yet.' : 'Try clearing a filter. Absence of a record means nothing was submitted or published here, not that there is no problem.'}</EmptyState>
          ) : (
            <ul className="reclist">
              {filtered.map(r => (
                <li key={r.id}>
                  <details className="rec">
                    <summary><span className="rec__title">{r.title}</span><span className="rec__meta">{SECTOR_LABEL[r.sector]} · {stateName(r.stateId)}{r.lga ? ` · ${r.lga}` : ''} · {r.publishedMonth}</span></summary>
                    <p>{r.summary}</p>
                    <p><strong>Status:</strong> {CLAIM_LABEL[claimStrength(r, evidence)]}</p>
                    <p className="muted">Responsible (unverified mapping): {r.institutionIds.map(i => institutions.find(x => x.id === i)?.name ?? i).join('; ')}</p>
                    <LifecycleTimeline record={r} evidence={evidence} />
                    <p><SyntheticChip /> <StatusBadge status="unverified" /></p>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </Section>
        <div>
          <Section title="Records by sector" id="bysector" note="Demonstration counts. Submissions show what people chose to report, not how common a problem is.">
            <BarChart ariaLabel="Demonstration records by sector" unit="records" items={SECTORS.map(s => ({ key: s, label: SECTOR_LABEL[s], value: bySector[s] ?? 0 }))} />
          </Section>
          {sector && (
            <Section title={`Registered sources: ${SECTOR_LABEL[sector]}`} id="srcs" note="Real registry entries. Check each source's limitations before relying on it.">
              {sectorSources.length === 0 ? <EmptyState title="No sources registered for this sector" /> : sectorSources.map(s => <SourceCitation key={s.id} s={s} compact />)}
            </Section>
          )}
        </div>
      </div>
    </>
  );
}
