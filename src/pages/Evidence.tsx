import { useEffect, useMemo, useState } from 'react';
import { useBundle } from '../lib/data';
import { useAdapter } from '../lib/hooks';
import { Section, Card } from '../design/layout';
import { EmptyState } from '../design/feedback';
import { SourceCitation } from '../design/primitives';
import {
  listIndicators,
  fetchViaGateway,
  formatIndicatorValue,
  type IndicatorDefinition,
  type IndicatorObservation,
} from '../lib/indicators';

function IndicatorBlock({ indicator }: { indicator: IndicatorDefinition }) {
  const [observations, setObservations] = useState<IndicatorObservation[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'unavailable'>('loading');
  const [retrievedAt, setRetrievedAt] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchViaGateway(indicator.id).then((result) => {
      if (!active) return;
      setObservations(result.observations);
      setStatus(result.status === 'error' ? 'unavailable' : result.status === 'empty' || !result.observations.length ? 'empty' : 'ready');
      setRetrievedAt(result.observations[0]?.retrievedAt || (result.receipt as { retrievedAt?: string } | null)?.retrievedAt || null);
    });
    return () => { active = false; };
  }, [indicator.id]);

  const recent = observations.slice(-5).reverse();
  const latest = recent[0];

  return <Card title={indicator.title}>
    {status === 'loading' ? <p className="workspace-loading">Loading</p> : latest ? <>
      <strong className="workspace-stat__value">{formatIndicatorValue(latest.value, indicator.unit)}</strong>
      <span className="workspace-stat__period">{latest.referencePeriod} · National</span>
    </> : <><strong className="workspace-stat__value">—</strong><span className="workspace-stat__period">{status === 'unavailable' ? 'Source unavailable' : 'No observation'}</span></>}
    <span className="workspace-indicator__source">{indicator.sourcePublisher}</span>
    {retrievedAt && <span className="workspace-indicator__source">Retrieved {retrievedAt}</span>}
    <details className="record">
      <summary>Method and limitations</summary>
      <p>{indicator.definition}</p>
      <p className="muted">{indicator.methodologyNotes}</p>
      <p className="muted">{indicator.limitations.join(' ')}</p>
      <p className="muted">Unit: {indicator.unit} · {indicator.measurementType} · {indicator.geographicCoverage}</p>
      <p className="muted">Licence: {indicator.licence} · Update: {indicator.updateFrequency}</p>
      <a href={indicator.sourceUrl} target="_blank" rel="noopener noreferrer">Open source</a>
    </details>
    {recent.length > 1 && <details className="record"><summary>Recent observations ({recent.length})</summary><ul className="plain">{recent.map((observation) => <li key={observation.referencePeriod}>{observation.referencePeriod}: {formatIndicatorValue(observation.value, indicator.unit)}</li>)}</ul></details>}
  </Card>;
}

export default function Evidence() {
  const { sources, evidence } = useBundle();
  const { mode } = useAdapter();
  const isDemo = mode === 'demo';
  const indicators = listIndicators();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return sources;
    return sources.filter((source) =>
      source.name.toLowerCase().includes(term) ||
      source.publisher.toLowerCase().includes(term) ||
      source.sectors.join(' ').toLowerCase().includes(term)
    );
  }, [sources, query]);

  return <>
    <header className="page-heading"><h1>Evidence</h1><span className="page-heading__meta">Public sources and observations</span></header>
    <Section title="National indicators" id="indicators">
      <div className="workspace-grid">{indicators.map((indicator) => <IndicatorBlock key={indicator.id} indicator={indicator} />)}</div>
    </Section>
    <Section title="Source registry" id="registry" note="A registered source is not necessarily an ingested dataset.">
      <label className="field"><span className="sr-only">Search sources</span><input className="input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sources" aria-label="Search sources" /></label>
      {filtered.length === 0 ? <EmptyState title="No matching sources" /> : <ul className="plain source-list">{filtered.map((source) => <li key={source.id}><SourceCitation s={source} /></li>)}</ul>}
    </Section>
    <Section title={isDemo ? 'Demonstration evidence' : 'Community evidence'} id="community-evidence">
      {evidence.length === 0 ? <EmptyState title="No community evidence in this feed" /> : <ul className="plain">{evidence.slice(0, 40).map((item) => <li key={item.id}><strong>{item.title}</strong><br /><span className="muted">{item.kind} · {item.status} · {item.publisherLabel}</span></li>)}</ul>}
    </Section>
  </>;
}