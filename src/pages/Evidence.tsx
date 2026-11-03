import { useMemo, useState } from 'react';
import { useBundle } from '../lib/data';
import { useAdapter } from '../lib/hooks';
import { PageHeader, Section } from '../design/layout';
import { Button, Card, ChipGroup, EvidenceBadge, SearchBox, SelectField, SourceCitation, StatusBadge, SyntheticChip } from '../design/primitives';
import { EmptyState } from '../design/feedback';
import { LifecycleTimeline } from '../design/timeline';
import { KINDS, KIND_LABEL, SECTORS, SECTOR_LABEL, STATUS_LABEL, type EvidenceKind, type EvidenceStatus, type Sector } from '../data/types';
import { matchesText } from '../lib/rules';

function toCsv(rows: string[][]) { return rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n'); }

export default function Evidence() {
  const adapter = useAdapter();
  const isDemo = adapter.mode === 'demo';
  const [tab, setTab] = useState<'items' | 'registry'>('registry');
  return (
    <>
      <PageHeader
        title="Evidence library"
        lead="Discover registered sources and evidence items. A registered source is not automatically verified. Every class stays distinct: official data, research, media, community submission, and independent verification."
      />
      <p className="hero__meta" style={{marginTop:0,marginBottom:'1rem'}}>
        <span className="chip chip--real">Registry is project research data</span>
        {isDemo ? <span className="chip chip--synth">Evidence items may be synthetic</span> : <span className="chip chip--real">Pulse-backed items are published community reports (unverified outcomes)</span>}
      </p>
      <Card title="How to use this library">
        <ol className="plain">
          <li>Start with <strong>Sources</strong> to see what is registered and whether the link was confirmed.</li>
          <li>Open <strong>Evidence items</strong> only after you understand the source class and its limits.</li>
          <li>Treat every limitation line as part of the finding — not optional fine print.</li>
        </ol>
      </Card>
      <div className="tabs" role="tablist" aria-label="Evidence views">
        <button role="tab" id="t-reg" aria-selected={tab === 'registry'} aria-controls="p-reg" className={`tab${tab === 'registry' ? ' tab--on' : ''}`} onClick={() => setTab('registry')}>Source registry (real)</button>
        <button role="tab" id="t-items" aria-selected={tab === 'items'} aria-controls="p-items" className={`tab${tab === 'items' ? ' tab--on' : ''}`} onClick={() => setTab('items')}>Evidence items (demonstration)</button>
      </div>
      {tab === 'registry' ? <div role="tabpanel" id="p-reg" aria-labelledby="t-reg"><Registry /></div> : <div role="tabpanel" id="p-items" aria-labelledby="t-items"><Items /></div>}
    </>
  );
}

function Registry() {
  const { sources } = useBundle();
  const [sector, setSector] = useState<Sector | ''>('');
  const [kind, setKind] = useState('');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const rows = useMemo(() => sources.filter(s => (!sector || s.sectors.includes(sector)) && (!kind || s.kind === kind) && (!url || s.urlStatus === url) && matchesText([s.name, s.publisher, s.dataType], text)), [sources, sector, kind, url, text]);
  const download = () => {
    const head = ['id', 'publisher', 'name', 'url', 'urlStatus', 'sectors', 'kind', 'coverage', 'geoLevel', 'dataType', 'updates', 'licence', 'lastChecked', 'limitations'];
    const body = rows.map(s => [s.id, s.publisher, s.name, s.url ?? '', s.urlStatus, s.sectors.join('; '), s.kind, s.geographicCoverage, s.geoLevel, s.dataType, s.updateFrequency, s.licence, s.lastChecked ?? '', s.limitations.join(' | ')]);
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([toCsv([head, ...body])], { type: 'text/csv' })); a.download = 'iseyc-source-registry.csv'; a.click(); URL.revokeObjectURL(a.href);
  };
  return (
    <>
      <Card title="Filter the registry" actions={<Button onClick={download}>Download CSV ({rows.length})</Button>}>
        <ChipGroup<Sector> label="Sector" value={sector} onChange={setSector} options={SECTORS.map(s => ({ value: s, label: SECTOR_LABEL[s] }))} />
        <div className="filters__row">
          <SelectField label="Evidence class" value={kind} onChange={setKind} allLabel="All classes" options={KINDS.map(k => ({ value: k, label: KIND_LABEL[k] }))} />
          <SelectField label="Link status" value={url} onChange={setUrl} allLabel="Any" options={[{ value: 'confirmed', label: 'Link confirmed' }, { value: 'domain-confirmed', label: 'Domain confirmed' }, { value: 'documented-not-reconfirmed', label: 'Not re-confirmed' }, { value: 'not-applicable', label: 'Not yet operating' }]} />
          <SearchBox label="Search" value={text} onChange={setText} placeholder="publisher or title" />
        </div>
      </Card>
      <Section title={`Sources (${rows.length} of ${sources.length})`} id="srcs" note="Unconfirmed entries are listed so researchers can verify them; they are labelled and carry no 'last checked' date.">
        {rows.length === 0 ? <EmptyState title="No sources match">Clear a filter to see more.</EmptyState> : rows.map(s => <details key={s.id} className="srcdetail"><summary><span>{s.name}</span><EvidenceBadge kind={s.kind} small /></summary><SourceCitation s={s} /></details>)}
      </Section>
    </>
  );
}

function Items() {
  const { evidence, records, states } = useBundle();
  const [kind, setKind] = useState<EvidenceKind | ''>('');
  const [status, setStatus] = useState('');
  const [sector, setSector] = useState('');
  const [text, setText] = useState('');
  const [open, setOpen] = useState('');
  const rows = useMemo(() => evidence.filter(e => (!kind || e.kind === kind) && (!status || e.status === status) && (!sector || e.sector === sector) && matchesText([e.title, e.excerpt], text)), [evidence, kind, status, sector, text]);
  const cur = evidence.find(e => e.id === open); const rec = cur && records.find(r => r.id === cur.recordId);
  return (
    <>
      <Card title="Filter evidence"><SyntheticChip block />
        <ChipGroup<EvidenceKind> label="Class" value={kind} onChange={setKind} options={KINDS.map(k => ({ value: k, label: KIND_LABEL[k] }))} />
        <div className="filters__row">
          <SelectField label="Status" value={status} onChange={setStatus} allLabel="Any status" options={(Object.keys(STATUS_LABEL) as EvidenceStatus[]).map(s => ({ value: s, label: STATUS_LABEL[s] }))} />
          <SelectField label="Sector" value={sector} onChange={setSector} allLabel="All sectors" options={SECTORS.map(s => ({ value: s, label: SECTOR_LABEL[s] }))} />
          <SearchBox label="Search" value={text} onChange={setText} />
        </div>
      </Card>
      <div className="grid2">
        <Section title={`Evidence items (${rows.length})`} id="items">
          {rows.length === 0 ? <EmptyState title="No evidence items match" /> : (
            <ul className="evlist">{rows.map(e => (
              <li key={e.id}><button type="button" className={`evrow${open === e.id ? ' evrow--on' : ''}`} aria-pressed={open === e.id} onClick={() => setOpen(e.id)}>
                <span className="evrow__title">{e.title}</span><span className="evrow__meta"><EvidenceBadge kind={e.kind} small /> <StatusBadge status={e.status} /> <time dateTime={e.date}>{e.date}</time></span></button></li>
            ))}</ul>
          )}
        </Section>
        <aside aria-live="polite"><Section title="Evidence detail" id="detail">
          {!cur ? <p className="muted">Select an item to read its excerpt, limits and the record it belongs to.</p> : (
            <article className="detail">
              <h3>{cur.title}</h3><p><EvidenceBadge kind={cur.kind} /> <StatusBadge status={cur.status} /> <SyntheticChip /></p>
              <blockquote>{cur.excerpt}</blockquote>
              <dl className="facts"><div><dt>Publisher</dt><dd>{cur.publisherLabel}</dd></div><div><dt>Date</dt><dd>{cur.date}</dd></div><div><dt>Sector</dt><dd>{SECTOR_LABEL[cur.sector]}</dd></div><div><dt>State</dt><dd>{states.find(s => s.id === cur.stateId)?.name}</dd></div></dl>
              <div className="limits"><strong>Limitations</strong><ul>{cur.limitations.map(l => <li key={l}>{l}</li>)}</ul></div>
              {rec && <><h4>Lifecycle of the linked record</h4><LifecycleTimeline record={rec} evidence={evidence} /></>}
            </article>
          )}
        </Section></aside>
      </div>
    </>
  );
}
