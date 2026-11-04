import { useMemo, useState } from 'react';
import { useBundle } from '../lib/data';
import { useAdapter } from '../lib/hooks';
import { Section } from '../design/layout';
import { SelectField, Button, SyntheticChip } from '../design/primitives';
import { EmptyState } from '../design/feedback';
import { SECTORS, SECTOR_LABEL, type Sector } from '../data/types';
import { buildBrief, briefToMarkdown } from '../lib/briefs';

export default function Briefs() {
  const adapter = useAdapter();
  const isDemo = adapter.mode === 'demo';
  const { records, evidence, institutions, states } = useBundle();
  const [stateId, setStateId] = useState('');
  const [sector, setSector] = useState('');
  const [message, setMessage] = useState('');
  const scoped = useMemo(() => records.filter((record) => (!stateId || record.stateId === stateId) && (!sector || record.sector === sector)), [records, stateId, sector]);
  const brief = useMemo(() => buildBrief({
    records: scoped, evidence, institutions, states,
    stateId: stateId || undefined,
    sector: (sector || undefined) as Sector | undefined,
  }), [scoped, evidence, institutions, states, stateId, sector]);
  const markdown = briefToMarkdown(brief);
  const copy = async () => {
    try { await navigator.clipboard.writeText(markdown); setMessage('Copied'); }
    catch { setMessage('Clipboard unavailable'); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `civic-brief-${stateId || 'all'}-${sector || 'all'}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage('Download started');
  };

  return <>
    <header className="page-heading"><h1>Briefs</h1><span className="page-heading__meta">Drafts · human review required</span></header>
    {isDemo && <p><SyntheticChip /></p>}
    <div className="filters">
      <SelectField label="State" value={stateId} onChange={setStateId} allLabel="All states" options={states.map((state) => ({ value: state.id, label: state.name }))} />
      <SelectField label="Sector" value={sector} onChange={setSector} allLabel="All sectors" options={SECTORS.map((item) => ({ value: item, label: SECTOR_LABEL[item] }))} />
      <Button variant="primary" onClick={copy}>Copy</Button>
      <Button onClick={download}>Download</Button>
      <Button onClick={() => window.print()}>Print</Button>
      <span role="status" className="muted">{message}</span>
    </div>
    <article className="brief" aria-label={brief.title}>
      <span className="brief__status">Draft · not approved for publication</span>
      <h2>{brief.title}</h2>
      <p className="muted">Scope: {brief.scope}</p>
      {scoped.length === 0 ? <EmptyState title="No published records in this scope" /> : brief.sections.map((section) => <section key={section.question}>
        <h3>{section.question}</h3><ul>{section.lines.map((line, index) => <li key={index}>{line}</li>)}</ul>
      </section>)}
      <aside className="brief__caveats"><h3>Limitations</h3><ul>{brief.caveats.map((caveat) => <li key={caveat}>{caveat}</li>)}</ul></aside>
    </article>
  </>;
}