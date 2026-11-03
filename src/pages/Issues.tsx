import { useMemo, useState } from 'react';
import { useBundle } from '../lib/data';
import { PageHeader, Section, Card } from '../design/layout';
import { SearchBox, SelectField, SyntheticChip, SourceCitation, StatusBadge } from '../design/primitives';
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
  const filtered = useMemo(
    () =>
      records.filter(
        (r) =>
          (!sector || r.sector === sector) &&
          (!stateId || r.stateId === stateId) &&
          matchesText([r.title, r.summary, r.lga ?? ''], text),
      ),
    [records, sector, stateId, text],
  );
  const bySector = countBy(records, (r) => r.sector);
  const sectorSources = sector ? sources.filter((s) => s.sectors.includes(sector)) : [];
  const registryBySector = countBy(
    sources.flatMap((s) => s.sectors.map((sec) => ({ sector: sec }))),
    (x) => x.sector,
  );
  const stateName = (id: string) => states.find((s) => s.id === id)?.name ?? id;

  return (
    <>
      <PageHeader
        title="Issues and sectors"
        lead="Browse published citizen demands by sector and place. Sector coverage in the registry is not the same as how common a problem is on the ground."
      />

      <Section
        title="Choose a sector"
        id="sectors"
        note="Ten institutional sectors. Agriculture and environment are in the taxonomy; registry sources for them may still be sparse."
      >
        <div className="sector-grid" role="list">
          {SECTORS.map((s) => {
            const recN = bySector[s] ?? 0;
            const srcN = registryBySector[s] ?? 0;
            const on = sector === s;
            return (
              <button
                key={s}
                type="button"
                role="listitem"
                className={`sector-tile${on ? ' sector-tile--on' : ''}`}
                aria-pressed={on}
                onClick={() => setSector(on ? '' : s)}
              >
                <strong>{SECTOR_LABEL[s]}</strong>
                <span className="meta">
                  {srcN} registered source{srcN === 1 ? '' : 's'}
                  {recN > 0 ? ` · ${recN} demo record${recN === 1 ? '' : 's'}` : ''}
                </span>
              </button>
            );
          })}
        </div>
        {sector ? (
          <p className="muted" style={{ marginTop: '0.75rem' }}>
            Selected: <strong>{SECTOR_LABEL[sector]}</strong>.{' '}
            <button type="button" className="btn btn--secondary" onClick={() => setSector('')}>
              Clear sector
            </button>
          </p>
        ) : null}
      </Section>

      <Card title="Narrow further">
        <div className="filters">
          <SelectField
            label="State"
            value={stateId}
            onChange={setStateId}
            allLabel="All states"
            options={states.map((s) => ({ value: s.id, label: s.name }))}
          />
          <SearchBox label="Search records" value={text} onChange={setText} placeholder="e.g. borehole, roof, clinic" />
        </div>
      </Card>

      <div className="grid2">
        <Section
          title={`Records (${filtered.length})`}
          id="recs"
          note={
            <>
              <SyntheticChip /> Every record below is invented for demonstration.
            </>
          }
        >
          {filtered.length === 0 ? (
            <EmptyState title="No records match these filters">
              {records.length === 0
                ? 'No published records are available yet.'
                : 'Try clearing a filter. Absence of a record means nothing was submitted or published here, not that there is no problem.'}
            </EmptyState>
          ) : (
            <div className="record-list">
              {filtered.map((r) => (
                <details className="record" key={r.id}>
                  <summary>
                    <span className="record__title">{r.title}</span>
                    <span className="record__meta">
                      <span className="chip chip--real">{SECTOR_LABEL[r.sector]}</span>
                      <span className="chip chip--pilot">
                        {stateName(r.stateId)}
                        {r.lga ? ` · ${r.lga}` : ''}
                      </span>
                      <span className="muted">{r.publishedMonth}</span>
                    </span>
                  </summary>
                  <p>{r.summary}</p>
                  <p>
                    <strong>Status:</strong> {CLAIM_LABEL[claimStrength(r, evidence)]}
                  </p>
                  <p className="muted">
                    Responsible (unverified mapping):{' '}
                    {r.institutionIds.map((i) => institutions.find((x) => x.id === i)?.name ?? i).join('; ')}
                  </p>
                  <LifecycleTimeline record={r} evidence={evidence} />
                  <p>
                    <SyntheticChip /> <StatusBadge status="unverified" />
                  </p>
                </details>
              ))}
            </div>
          )}
        </Section>
        <div>
          <Section
            title="Demo records by sector"
            id="bysector"
            note="Demonstration counts only. Submissions show what people chose to report, not prevalence."
          >
            <BarChart
              ariaLabel="Demonstration records by sector"
              unit="records"
              items={SECTORS.map((s) => ({ key: s, label: SECTOR_LABEL[s], value: bySector[s] ?? 0 }))}
            />
          </Section>
          {sector ? (
            <Section
              title={`Registered sources: ${SECTOR_LABEL[sector]}`}
              id="srcs"
              note="Real registry entries. Read each source’s limitations before relying on it."
            >
              {sectorSources.length === 0 ? (
                <EmptyState title="No sources registered for this sector">
                  Empty registry coverage is a gap in our catalogue, not proof that no data exists elsewhere.
                </EmptyState>
              ) : (
                sectorSources.map((s) => <SourceCitation key={s.id} s={s} compact />)
              )}
            </Section>
          ) : null}
        </div>
      </div>
    </>
  );
}
