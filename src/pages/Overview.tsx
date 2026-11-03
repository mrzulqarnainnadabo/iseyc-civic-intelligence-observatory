import { Link } from 'react-router-dom';
import { useBundle } from '../lib/data';
import { PageHeader, Section } from '../design/layout';
import { Card, EvidenceBadge, SyntheticChip } from '../design/primitives';
import { BarChart, Funnel } from '../design/charts';
import { EmptyState } from '../design/feedback';
import { KINDS, SECTOR_LABEL, STAGE_LABEL, KIND_LABEL } from '../data/types';
import { registryCoverage, registryGaps, stageCounts } from '../lib/rules';

const QUESTIONS = [
  { q: 'What is happening?', to: '/issues', hint: 'Published citizen demands by sector' },
  { q: 'Where is it happening?', to: '/geography', hint: 'State map with a table alternative' },
  { q: 'Who is affected?', to: '/briefs', hint: 'Stated plainly, with limits on what submissions can show' },
  { q: 'What evidence supports it?', to: '/evidence', hint: 'Every item typed, dated and limited' },
  { q: 'Which institutions are responsible?', to: '/accountability', hint: 'Mappings marked unverified until a legal basis is attached' },
  { q: 'What has been announced?', to: '/accountability', hint: 'Announcements shown separately from delivery' },
  { q: 'What is implemented and verified?', to: '/accountability', hint: 'Only independent evidence counts' },
  { q: 'What remains unknown?', to: '/briefs', hint: 'Gaps listed, never hidden' },
  { q: 'What should happen next?', to: '/briefs', hint: 'Concrete next checks per record' },
];

export default function Overview() {
  const { sources, records, evidence } = useBundle();
  const cov = registryCoverage(sources);
  const gaps = registryGaps(sources);
  const counts = stageCounts(records, evidence);
  const confirmed = sources.filter(s => s.urlStatus === 'confirmed' || s.urlStatus === 'domain-confirmed').length;
  return (
    <>
      <PageHeader title="National overview" lead="One place to ask what is happening, where, who is affected, what the evidence says, who is responsible, and what has actually been delivered. Start with a question." />
      <Section title="Start with a question" id="q">
        <ul className="qgrid">
          {QUESTIONS.map(x => <li key={x.q}><Link to={x.to} className="qcard"><strong>{x.q}</strong><span>{x.hint}</span></Link></li>)}
        </ul>
      </Section>

      <Section title="How to read the evidence" id="legend" note="Five classes are kept apart everywhere in the product. A badge always shows its class in words and shape.">
        <div className="legend">
          {KINDS.map(k => (
            <div key={k} className="legend__item"><EvidenceBadge kind={k} />
              <p>{{
                'official-data': 'Published by a government body or statutory agency. Still check its date and limits.',
                'published-research': 'Peer-reviewed or institutional research, civil-society analysis or international datasets.',
                'media-report': 'News reporting. A lead to check, not proof.',
                'community-submission': 'What people chose to submit. Not a representative survey.',
                'independently-verified': 'Checked by trained reviewers using a published method. None exists in the real data yet.',
              }[k]}</p></div>
          ))}
        </div>
      </Section>

      <div className="grid2">
        <Section title="What the source registry covers" id="reg" note={`Real data: ${sources.length} registered sources, ${confirmed} with a link or domain confirmed in research. This counts sources, not data.`}>
          {sources.length === 0 ? <EmptyState title="No sources available">The registry returned no entries.</EmptyState> :
            <BarChart ariaLabel="Registered sources by sector" unit="sources" items={cov.map(c => ({ key: c.sector, label: SECTOR_LABEL[c.sector], value: c.total, hint: <span className="muted">{c.official} official, {c.subnationalOfficial} sub-national</span> }))} />}
        </Section>
        <Section title="Known gaps in the registry" id="gaps" note="Generated from the registry, so it changes as sources are added or re-checked.">
          {gaps.length === 0 ? <p>No gaps detected by the current rules.</p> : <ul className="gaps">{gaps.map(g => <li key={g}>{g}</li>)}</ul>}
        </Section>
      </div>

      <Section title="From demand to verified delivery" id="funnel" note={<>How records move through six stages. <SyntheticChip /> These counts come from invented records and show the interface, not real performance.</>}>
        {records.length === 0 ? <EmptyState title="No published records">When records are published they will appear here with their stage evidence.</EmptyState> :
          <Funnel unit="records" total={records.length} steps={counts.map(c => ({ key: c.stage, label: STAGE_LABEL[c.stage], value: c.reached, note: c.stage === 'verified' ? 'Counted only with independent evidence' : c.stage === 'referred' ? 'A referral does not mean action' : undefined }))} />}
      </Section>

      <Card title="Boundaries we keep">
        <ul className="plain">
          <li>No polls, rankings, candidate or party comparisons, and no endorsements.</li>
          <li>No national statistic is shown unless a registered source publishes it, with its date and limits.</li>
          <li>{KIND_LABEL['community-submission']}s are never presented as representative.</li>
          <li>An announcement, referral or budget line is never presented as delivery.</li>
          <li>Private submission details never enter the Observatory.</li>
        </ul>
      </Card>
    </>
  );
}
