import { useMemo, useState } from 'react';
import { useBundle } from '../lib/data';
import { useAdapter } from '../lib/hooks';
import { PageHeader, Card } from '../design/layout';
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
  const [msg, setMsg] = useState('');
  const scoped = useMemo(
    () => records.filter((r) => (!stateId || r.stateId === stateId) && (!sector || r.sector === sector)),
    [records, stateId, sector],
  );
  const brief = useMemo(
    () =>
      buildBrief({
        records: scoped,
        evidence,
        institutions,
        states,
        stateId: stateId || undefined,
        sector: (sector || undefined) as Sector | undefined,
      }),
    [scoped, evidence, institutions, states, stateId, sector],
  );
  const md = briefToMarkdown(brief);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(md);
      setMsg('Copied to clipboard.');
    } catch {
      setMsg('Copy is not available in this browser. Use Download instead.');
    }
  };
  const download = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
    a.download = `civic-brief-${stateId || 'all'}-${sector || 'all'}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg('Download started.');
  };
  return (
    <>
      <PageHeader
        title="Civic briefs"
        lead="A brief answers fixed questions from the records on hand: what is known, what the evidence supports, what remains unknown, and what to check next. AI or automated text is never an approved institutional position without human review."
      />
      <p className="hero__meta" style={{ marginTop: 0, marginBottom: '1rem' }}>
        {isDemo ? <span className="chip chip--synth">Demonstration scope</span> : <span className="chip chip--real">Based on published records in scope</span>}
        <span className="chip chip--pilot">Draft / interface only — not published institutional briefs</span>
      </p>
      <Card title="Choose a scope">
        <div className="filters__row">
          <SelectField
            label="State"
            value={stateId}
            onChange={setStateId}
            allLabel="All states"
            options={states.map((s) => ({ value: s.id, label: s.name }))}
          />
          <SelectField
            label="Sector"
            value={sector}
            onChange={setSector}
            allLabel="All sectors"
            options={SECTORS.map((s) => ({ value: s, label: SECTOR_LABEL[s] }))}
          />
        </div>
        <div className="actions">
          <Button variant="primary" onClick={copy}>
            Copy as Markdown
          </Button>
          <Button onClick={download}>Download .md</Button>
          <Button onClick={() => window.print()}>Print or save as PDF</Button>
          <span role="status" className="muted">
            {msg}
          </span>
        </div>
      </Card>
      <article className="brief" aria-label={brief.title}>
        <span className="brief__status">Interface draft · not human-approved publication</span>
        <h2>{brief.title}</h2>
        {brief.synthetic && (
          <p>
            <SyntheticChip block />
          </p>
        )}
        <p className="muted">Scope: {brief.scope}</p>
        {scoped.length === 0 && (
          <EmptyState title="No published records in this scope">
            A brief cannot be written from nothing. Try another state or sector, or all sectors.
          </EmptyState>
        )}
        {brief.sections.map((s) => (
          <section key={s.question}>
            <h3>{s.question}</h3>
            <ul>
              {s.lines.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </section>
        ))}
        <aside className="brief__caveats">
          <h3>Read this carefully</h3>
          <ul>
            {brief.caveats.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </aside>
      </article>
    </>
  );
}
