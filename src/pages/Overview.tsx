import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useBundle } from '../lib/data';
import { useAdapter } from '../lib/hooks';
import { Section, Card } from '../design/layout';
import { EmptyState } from '../design/feedback';
import { KINDS, KIND_LABEL } from '../data/types';
import { registryCoverage } from '../lib/rules';
import {
  listIndicators,
  fetchIndicatorObservations,
  formatIndicatorValue,
  type IndicatorDefinition,
  type IndicatorObservation,
} from '../lib/indicators';

const ENTRIES = [
  { kicker: 'Evidence', title: 'Evidence library', hint: 'Registered sources and national indicator pilots.', to: '/evidence' },
  { kicker: 'Places', title: 'Geography', hint: 'States remain useful even with no community submissions.', to: '/geography' },
  { kicker: 'Sectors', title: 'Issues and sectors', hint: 'Published community records by sector — not prevalence.', to: '/issues' },
  { kicker: 'Responsibility', title: 'Accountability', hint: 'Keep duty, commitment and delivery distinct.', to: '/accountability' },
  { kicker: 'Synthesis', title: 'Civic briefs', hint: 'Known, unknown, and what to check next.', to: '/briefs' },
  { kicker: 'Method', title: 'Boundaries', hint: 'Non-partisan rules and data honesty.', to: '#boundaries' },
];

function PilotIndicatorCard({ indicator }: { indicator: IndicatorDefinition }) {
  const [obs, setObs] = useState<IndicatorObservation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchIndicatorObservations(indicator).then((r) => {
      if (!alive) return;
      setObs(r.observations);
      setError(r.error ?? null);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [indicator]);

  const latest = obs.length ? obs[obs.length - 1] : null;

  return (
    <Card>
      <p className="muted" style={{ margin: 0, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {indicator.sector} · {indicator.measurementType} · {indicator.geoLevel}
      </p>
      <strong>{indicator.title}</strong>
      {loading ? (
        <p className="muted">Loading series from source…</p>
      ) : latest ? (
        <p>
          <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>{formatIndicatorValue(latest.value, indicator.unit)}</span>
          <span className="muted"> · {latest.date}</span>
        </p>
      ) : (
        <p className="muted">No value returned ({error || 'empty series'}).</p>
      )}
      <p className="muted" style={{ fontSize: 13 }}>
        Source: {indicator.sourcePublisher}. Not produced by ISEYC.
      </p>
      <a href={indicator.sourceUrl} target="_blank" rel="noopener noreferrer">
        Open source
      </a>
    </Card>
  );
}

export default function Overview() {
  const { sources, records } = useBundle();
  const { mode } = useAdapter();
  const isDemo = mode === 'demo';
  const cov = registryCoverage(sources);
  const confirmed = sources.filter(
    (s) => s.urlStatus === 'confirmed' || s.urlStatus === 'domain-confirmed',
  ).length;
  const indicators = listIndicators();
  const mandateStates = new Set(records.map((r) => r.stateId).filter(Boolean)).size;

  return (
    <>
      <header className="hero" aria-labelledby="hero-title">
        <p className="muted" style={{ margin: '0 0 0.5rem', fontSize: 13 }}>
          Operated by ISEYC · Non-partisan civic initiative · Not a government statistics office
        </p>
        <h1 id="hero-title">Understand the evidence. See the issues. Follow public accountability.</h1>
        <p className="lead">
          A national civic intelligence platform that organises public data, community evidence and institutional
          information. Civic Mandate published records are one stream — not the whole picture.
        </p>
        <div className="hero__meta">
          <span className="chip chip--real">Registry: {sources.length} sources</span>
          <span className="chip chip--pilot">{confirmed} link-checked</span>
          <span className="chip chip--real">Indicator pilots: {indicators.length}</span>
          <span className={isDemo ? 'chip chip--demo' : 'chip chip--real'}>
            {isDemo
              ? 'Demo community data'
              : `Published community records: ${records.length} · ${mandateStates} states in set`}
          </span>
        </div>
        <div className="hero__actions">
          <Link className="btn btn--primary" to="/evidence">
            Open evidence library
          </Link>
          <Link className="btn btn--ghost" to="/geography">
            Explore geography
          </Link>
        </div>
      </header>

      <Section
        title="Three evidence streams"
        id="streams"
        note="Keep streams separate. Community reports are not national statistics. Official series are not community experience."
      >
        <div className="grid3">
          <Card>
            <strong>Public datasets</strong>
            <p className="muted">Registered sources and pilot indicators with publisher, method and limits.</p>
            <Link to="/evidence">Browse evidence →</Link>
          </Card>
          <Card>
            <strong>Community evidence</strong>
            <p className="muted">
              Human-reviewed published Civic Mandate records only. Pilot coverage — not a survey of all Nigerians.
            </p>
            <Link to="/issues">Browse sectors →</Link>
          </Card>
          <Card>
            <strong>Interpretation</strong>
            <p className="muted">Briefs and accountability views that must not invent delivery or verification.</p>
            <Link to="/briefs">Open briefs →</Link>
          </Card>
        </div>
      </Section>

      <Section
        title="National indicator pilots"
        id="indicators"
        note="Retrieved live from the World Bank API with attribution. National aggregates only. Gaps and revisions belong to the source."
      >
        <div className="grid3">
          {indicators.map((ind) => (
            <PilotIndicatorCard key={ind.id} indicator={ind} />
          ))}
        </div>
      </Section>

      <Section title="Enter the Observatory" id="enter">
        <nav className="entry-grid" aria-label="Product areas">
          {ENTRIES.map((e) => (
            <Link key={e.to} className="entry" to={e.to}>
              <span className="entry__kicker">{e.kicker}</span>
              <strong>{e.title}</strong>
              <span>{e.hint}</span>
            </Link>
          ))}
        </nav>
      </Section>

      <Section
        title="How to read the evidence"
        id="legend"
        note="Five classes stay distinct. A registered source is not automatically verified evidence."
      >
        <div className="kind-grid">
          {KINDS.map((k) => (
            <div className="kind-card" key={k}>
              <strong>{KIND_LABEL[k]}</strong>
              <p>
                {
                  {
                    'official-data': 'Published by a public institution. Still needs date, scope and method.',
                    'published-research': 'Institutional or peer research. Not a national sample unless stated.',
                    'media-report': 'Journalistic reporting. Useful leads, not official findings.',
                    'community-submission': 'Citizen or community report after human review. Not a survey.',
                    'independently-verified': 'Field or third-party verification with method on record.',
                  }[k]
                }
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Registry coverage (metadata, not observations)" id="coverage">
        {cov.length === 0 ? (
          <EmptyState title="No sources available">The registry returned no entries.</EmptyState>
        ) : (
          <ul className="plain">
            {cov.filter((c) => c.total > 0).slice(0, 8).map((c) => (
              <li key={c.sector}>
                <strong>{c.sector.replace(/-/g, ' ')}</strong>
                <span className="muted"> · {c.total} registered source{c.total === 1 ? '' : 's'}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="muted">Source counts are catalogue coverage, not how common a problem is on the ground.</p>
      </Section>

      <Section title="Boundaries" id="boundaries">
        <ul className="plain">
          <li>ISEYC operates this platform; we do not claim government authority or exclusive official data.</li>
          <li>Publication of a community record is not proof of service delivery or resolution.</li>
          <li>National indicator pilots are attributed to their publishers and remain national aggregates.</li>
          <li>Absence of a published community record is not absence of need.</li>
        </ul>
      </Section>
    </>
  );
}
