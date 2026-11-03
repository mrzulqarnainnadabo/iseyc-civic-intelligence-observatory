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
  const [obs, setObs] = useState<IndicatorObservation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retrievedAt, setRetrievedAt] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchViaGateway(indicator.id).then((r) => {
      if (!alive) return;
      setObs(r.observations);
      setError(r.status === 'error' || r.status === 'empty' ? r.errorClass || r.status : null);
      setRetrievedAt(
        r.observations[0]?.retrievedAt ||
          (r.receipt as { retrievedAt?: string } | null)?.retrievedAt ||
          null,
      );
    });
    return () => {
      alive = false;
    };
  }, [indicator]);

  const recent = obs.slice(-5).reverse();

  return (
    <Card>
      <strong>{indicator.title}</strong>
      <p className="muted">{indicator.definition}</p>
      <p className="muted" style={{ fontSize: 13 }}>
        Unit: {indicator.unit} · Type: {indicator.measurementType} · {indicator.geographicCoverage} · geo level: national
      </p>
      {recent.length ? (
        <ul className="plain">
          {recent.map((o) => (
            <li key={o.referencePeriod}>
              <strong>Reference {o.referencePeriod}</strong>: {formatIndicatorValue(o.value, indicator.unit)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">
          {error
            ? `No observations (${error}). Synthetic data is not substituted.`
            : 'No observations loaded.'}
        </p>
      )}
      {retrievedAt ? (
        <p className="muted" style={{ fontSize: 12 }}>
          Last retrieval (gateway): {retrievedAt}
        </p>
      ) : null}
      <p className="muted" style={{ fontSize: 12 }}>
        {indicator.methodologyNotes}
      </p>
      <p className="muted" style={{ fontSize: 12 }}>
        Limitations: {indicator.limitations.join(' ')}
      </p>
      <p className="muted" style={{ fontSize: 12 }}>
        Source: {indicator.sourcePublisher} · Licence: {indicator.licence}
      </p>
      <a href={indicator.sourceUrl} target="_blank" rel="noopener noreferrer">
        Source page
      </a>
    </Card>
  );
}

export default function Evidence() {
  const { sources, evidence } = useBundle();
  const { mode } = useAdapter();
  const isDemo = mode === 'demo';
  const indicators = listIndicators();
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return sources;
    return sources.filter(
      (s) =>
        s.name.toLowerCase().includes(t) ||
        s.publisher.toLowerCase().includes(t) ||
        (s.sectors || []).join(' ').toLowerCase().includes(t),
    );
  }, [sources, q]);

  return (
    <>
      <div className="pagehead">
        <h1>Evidence library</h1>
        <p className="lead">
          Public source registry and pilot national indicators. Community submissions are listed separately and are not
          national statistics.
        </p>
      </div>

      <Section
        title="National indicator pilots"
        id="indicator-pilots"
        note="Live retrieval from World Bank WDI. Values are not produced by ISEYC."
      >
        <div className="grid2">
          {indicators.map((ind) => (
            <IndicatorBlock key={ind.id} indicator={ind} />
          ))}
        </div>
      </Section>

      <Section
        title="Registered sources"
        id="registry"
        note="Metadata catalogue. A listed source is not automatically loaded as observations."
      >
        <label className="field">
          <span className="sr-only">Search sources</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, publisher or sector"
            aria-label="Search sources"
          />
        </label>
        {filtered.length === 0 ? (
          <EmptyState title="No sources match">Try a broader search.</EmptyState>
        ) : (
          <ul className="plain source-list">
            {filtered.map((s) => (
              <li key={s.id}>
                <SourceCitation s={s} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title={isDemo ? 'Demonstration evidence items' : 'Published community evidence items'}
        id="items"
        note={
          isDemo
            ? 'Synthetic items for offline review only.'
            : 'Drawn from published Civic Mandate records when the live adapter is active. Not a national sample.'
        }
      >
        {evidence.length === 0 ? (
          <EmptyState title="No community evidence items in this dataset">
            This does not mean communities have no concerns. It means none are in the current published set.
          </EmptyState>
        ) : (
          <ul className="plain">
            {evidence.slice(0, 40).map((e) => (
              <li key={e.id}>
                <strong>{e.title}</strong>
                <br />
                <span className="muted">
                  {e.kind} · {e.status} · {e.publisherLabel}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
