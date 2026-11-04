import { useMemo, useState } from 'react';
import { useBundle } from '../lib/data';
import { useAdapter } from '../lib/hooks';
import { EmptyState, Banner } from '../design/feedback';
import { SearchBox, SelectField } from '../design/primitives';
import { Section } from '../design/layout';
import { SECTORS, SECTOR_LABEL, type Sector } from '../data/types';
import type { CommunityObservation } from '../data/types';

const VERIFICATION_LABEL: Record<CommunityObservation['verificationStatus'], string> = {
  unverified: 'Unverified',
  corroborated: 'Corroborated',
  'independently-verified': 'Independently verified',
  disputed: 'Disputed',
};

function Observation({ record }: { record: CommunityObservation }) {
  const place = [record.stateName, record.lga, record.ward, record.placeOrFacility].filter(Boolean).join(' · ');
  return <details className="record">
    <summary>
      <span className="record__title">{record.title}</span>
      <span className="record__meta">
        <span className="chip chip--real">{record.sector ? SECTOR_LABEL[record.sector] : 'Unclassified'}</span>
        <span className="chip chip--pilot">{place || 'Place not specified'}</span>
        <span className="muted">{VERIFICATION_LABEL[record.verificationStatus]}</span>
      </span>
    </summary>
    <p>{record.description}</p>
    <dl className="facts">
      <div><dt>Report type</dt><dd>{record.reportType}</dd></div>
      <div><dt>Observed on</dt><dd>{record.observedOn || 'Not specified'}</dd></div>
      <div><dt>Published</dt><dd>{record.publishedAt || 'Date not supplied'}</dd></div>
      <div><dt>Evidence basis</dt><dd>{record.evidenceTypes.join(', ') || 'Not specified'}</dd></div>
      <div><dt>Editorial status</dt><dd>Published after dual review</dd></div>
      <div><dt>Verification status</dt><dd>{VERIFICATION_LABEL[record.verificationStatus]}</dd></div>
    </dl>
    {record.evidenceLink && <p><a href={record.evidenceLink} target="_blank" rel="noopener noreferrer">Open public evidence link</a></p>}
    <p className="muted">Publication confirms editorial review. It does not, by itself, establish independent verification of the reported condition.</p>
  </details>;
}

export default function Observations() {
  const adapter = useAdapter();
  const { states, communityObservations } = useBundle();
  const feed = communityObservations ?? {
    status: 'unavailable' as const,
    records: [],
    total: null,
    message: 'The community observation feed is not configured for this adapter.',
  };
  const [sector, setSector] = useState<Sector | ''>('');
  const [stateId, setStateId] = useState('');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => feed.records.filter((record) =>
    (!sector || record.sector === sector) &&
    (!stateId || record.stateId === stateId) &&
    (!query || [record.title, record.description, record.stateName, record.lga || '', record.ward || '', record.placeOrFacility || ''].join(' ').toLowerCase().includes(query.toLowerCase()))
  ), [feed.records, sector, stateId, query]);

  const unavailable = feed.status === 'unavailable' || feed.status === 'invalid' || feed.status === 'incomplete';
  const demo = adapter.mode === 'demo' || feed.status === 'not-in-demo';

  return <>
    <header className="page-heading">
      <h1>Community observations</h1>
      <span className="page-heading__meta">{demo ? 'Not included in demonstration data' : 'Published after dual review'}</span>
    </header>

    <Banner tone="info">
      These are submitted community reports, not a representative survey. Publication is not the same as independent verification. An empty feed does not mean services are functioning.
    </Banner>

    {demo && <Banner tone="demo">Live community observations are kept separate from synthetic demonstration records.</Banner>}
    {unavailable && <Banner tone="warn">{feed.message || 'The observation feed could not be validated. Records are withheld; no substitute data are shown.'}</Banner>}
    {feed.status === 'empty' && <EmptyState title="No observations have passed the publication gate yet">This does not establish that there are no service gaps or community concerns.</EmptyState>}

    {feed.status === 'ready' && <>
      <div className="workspace-grid">
        <div className="workspace-stat"><span className="workspace-stat__label">Published observations</span><strong className="workspace-stat__value">{feed.records.length}</strong><span className="workspace-stat__period">Current published feed · not prevalence</span></div>
        <div className="workspace-stat"><span className="workspace-stat__label">Verification states</span><strong className="workspace-stat__value">{new Set(feed.records.map((r) => r.verificationStatus)).size}</strong><span className="workspace-stat__period">Unverified and verified states remain distinct</span></div>
      </div>
      <Section title="Find observations" id="observation-filters">
        <div className="filters">
          <SelectField label="Sector" value={sector} onChange={(v) => setSector(v as Sector | '')} allLabel="All sectors" options={SECTORS.map((s) => ({ value: s, label: SECTOR_LABEL[s] }))} />
          <SelectField label="State" value={stateId} onChange={setStateId} allLabel="All states" options={states.map((s) => ({ value: s.id, label: s.name }))} />
          <SearchBox label="Search" value={query} onChange={setQuery} placeholder="Search reports or places" />
          {(sector || stateId || query) && <button type="button" className="btn btn--ghost" onClick={() => { setSector(''); setStateId(''); setQuery(''); }}>Clear filters</button>}
        </div>
      </Section>
      <Section title={filtered.length + ' published observations'} id="observation-list">
        {filtered.length ? <div className="workspace-records">{filtered.map((record) => <Observation key={record.id} record={record} />)}</div> : <EmptyState title="No published observations match these filters">A missing match is not evidence that a service is available.</EmptyState>}
      </Section>
    </>}
  </>;
}
