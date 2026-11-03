import { Link } from 'react-router-dom';
import { useBundle } from '../lib/data';
import { Section, Card } from '../design/layout';
import { SyntheticChip } from '../design/primitives';
import { BarChart, Funnel } from '../design/charts';
import { EmptyState } from '../design/feedback';
import { KINDS, SECTOR_LABEL, STAGE_LABEL, KIND_LABEL } from '../data/types';
import { registryCoverage, registryGaps, stageCounts } from '../lib/rules';

const ENTRIES = [
  { kicker: 'Sectors', title: 'Issues and sectors', hint: 'Explore duties by sector. Coverage is not prevalence.', to: '/issues' },
  { kicker: 'Places', title: 'Geography', hint: '36 states and FCT. Map presence is not evidence coverage.', to: '/geography' },
  { kicker: 'Sources', title: 'Evidence library', hint: 'Registered sources and evidence classes, with limits.', to: '/evidence' },
  { kicker: 'Responsibility', title: 'Accountability', hint: 'Duty, institution, commitment and delivery stay distinct.', to: '/accountability' },
  { kicker: 'Synthesis', title: 'Civic briefs', hint: 'What is known, uncertain, and what to check next.', to: '/briefs' },
  { kicker: 'Method', title: 'Boundaries', hint: 'Non-partisan rules and data honesty.', to: '#boundaries' },
];

export default function Overview() {
  const { sources, records, evidence } = useBundle();
  const cov = registryCoverage(sources);
  const gaps = registryGaps(sources);
  const counts = stageCounts(records, evidence);
  const confirmed = sources.filter(
    (s) => s.urlStatus === 'confirmed' || s.urlStatus === 'domain-confirmed',
  ).length;

  return (
    <>
      <header className="hero" aria-labelledby="hero-title">
        <h1 id="hero-title">Understand public evidence across Nigeria</h1>
        <p className="lead">
          The Observatory helps citizens, journalists, researchers and institutions explore what community records and
          registered sources show — and what they do not yet prove.
        </p>
        <div className="hero__meta">
          <span className="chip chip--real">Registry: {sources.length} sources</span>
          <span className="chip chip--pilot">{confirmed} link-confirmed</span>
          <span className="chip chip--real">Default data: published Mandate pulse</span>
        </div>
        <div className="hero__actions">
          <Link className="btn btn--primary" to="/evidence">
            Open evidence library
          </Link>
          <Link className="btn btn--ghost" to="/geography">
            Explore geography
          </Link>
          <Link className="btn btn--ghost" to="/issues">
            Browse sectors
          </Link>
        </div>
      </header>

      <nav className="entry-grid" aria-label="Start exploring">
        {ENTRIES.map((e) => (
          <Link key={e.to} to={e.to} className="entry">
            <span className="entry__kicker">{e.kicker}</span>
            <strong>{e.title}</strong>
            <span>{e.hint}</span>
          </Link>
        ))}
      </nav>

      <Section
        title="How to read the evidence"
        id="legend"
        note="Five classes stay distinct everywhere. A registered source is not automatically verified evidence."
      >
        <div className="kind-grid">
          {KINDS.map((k) => (
            <div className="kind-card" key={k}>
              <strong>{KIND_LABEL[k]}</strong>
              <p>
                {
                  {
                    'official-data': 'Published by a public institution. Still needs date, scope and method.',
                    'published-research': 'Peer or institutional research. Not a national sample unless stated.',
                    'media-report': 'Journalistic reporting. Useful leads, not official findings.',
                    'community-submission': 'Citizen or community report after human review. Not a survey.',
                    'independently-verified':
                      'Checked by trained reviewers with a published method. None in real data yet.',
                  }[k]
                }
              </p>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid2">
        <Section
          title="What the source registry covers"
          id="reg"
          note={`Real project data: ${sources.length} registered sources, ${confirmed} with a confirmed link or domain. Counts sources, not national outcomes.`}
        >
          {sources.length === 0 ? (
            <EmptyState title="No sources available">The registry returned no entries.</EmptyState>
          ) : (
            <BarChart
              ariaLabel="Registered sources by sector"
              unit="sources"
              items={cov.map((c) => ({
                key: c.sector,
                label: SECTOR_LABEL[c.sector],
                value: c.total,
                hint: (
                  <span className="muted">
                    {c.official} official, {c.subnationalOfficial} sub-national
                  </span>
                ),
              }))}
            />
          )}
        </Section>
        <Section
          title="Known gaps in the registry"
          id="gaps"
          note="Generated from the registry; changes as sources are added or re-checked."
        >
          {gaps.length === 0 ? (
            <p>No gaps detected by the current rules.</p>
          ) : (
            <ul className="gaps">
              {gaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <Section
        title="From demand to verified delivery"
        id="funnel"
        note={
          <>
            Six stages of accountability. <SyntheticChip /> Counts below come from invented demo records and show the
            interface — not real institutional performance.
          </>
        }
      >
        {records.length === 0 ? (
          <EmptyState title="No published records in this dataset yet">This view only lists human-reviewed published records currently returned by Civic Mandate. An empty list does not mean communities have no needs.</EmptyState>
        ) : (
          <Funnel
            unit="records"
            total={records.length}
            steps={counts.map((c) => ({
              key: c.stage,
              label: STAGE_LABEL[c.stage],
              value: c.reached,
              note:
                c.stage === 'verified'
                  ? 'Counted only with independent evidence'
                  : c.stage === 'referred'
                    ? 'A referral does not mean action'
                    : undefined,
            }))}
          />
        )}
      </Section>

      <Card title="Boundaries we keep">
        <div id="boundaries" />
        <ul className="plain">
          <li>No polls, rankings, candidate or party comparisons, and no endorsements.</li>
          <li>No national statistic is shown unless a registered source publishes it, with date and limits.</li>
          <li>{KIND_LABEL['community-submission']}s are never presented as representative.</li>
          <li>An announcement, referral or budget line is never presented as delivery.</li>
          <li>Private submission details never enter the Observatory.</li>
        </ul>
      </Card>
    </>
  );
}

